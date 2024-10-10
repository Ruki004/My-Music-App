// Howler.js setup
let sound=null; //initiallize sound var
let isPaused = false; //track song pause
let timeUpdateInterval = null; // store interval ID for updating timestamp

// Function to format time in minutes:seconds
function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
}

// Function to update the timestamp
function updateTimestamp() {
    if (sound) {
        const currentTime = sound.seek(); // Get the current time in seconds
        document.getElementById('timestamp').innerText = formatTime(currentTime);
    }
}

//function to adjust dropdownwidth 


function adjustDropdownWidth () {
            // Get the width of the search bar
            const searchBar = document.getElementById('searchBar');
            const songList = document.getElementById('songList');
            
            // Match the dropdown width with the search bar width
            songList.style.width = searchBar.offsetWidth + 'px';
    
            // Optional: Dynamically show the dropdown as the user types
            songList.style.display = searchBar.value ? 'block' : 'none';
        }
    
        // Adjust the dropdown width on page load as well
        window.onload = adjustDropdownWidth;

//function to play song and decoding
function playSong(song) {
const encodedSong = encodeURIComponent(song);

    // If a sound is already playing, stop it before starting a new one
    if (sound) {
        sound.stop(); // Stop the current song
        sound=null; //clear sound instance
        clearInterval(timeUpdateInterval); // Clear the interval if a song was already playing
    }

    if (!sound) { // If no sound instance exists, create a new one
            sound = new Howl({
                src: [`http://localhost:8001/songs/${encodedSong}`],
                autoplay: true,
                loop: false,
                volume: 0.6,
                onend: function() {
                    console.log('Finished playing');
                    isPaused = false; // Reset pause state when song ends
                    clearInterval(timeUpdateInterval); // Stop updating the timestamp when the song ends
                    sound = null; // Clear sound instance when finished
                },
                onloaderror: function(id, error) {
                    console.error('Load error:', error);
                    alert(`Load error: ${error.message}`);
                },
                onplayerror: function(id, error) {
                    console.error('Play error:', error);
                    alert(`Play error: ${error.message}`);
                }
            });

            // Start updating the timestamp every second
            timeUpdateInterval = setInterval(updateTimestamp, 1000); // Update every second

            // Reset paused state
            isPaused = false; 

        } else if (isPaused) {
            sound.play(); // Resume playing if the sound is paused
            isPaused = false; // Reset paused state
        }
}
    /*Play, button */
        document.getElementById('playButton').onclick = function() {
    const songName = document.getElementById('searchBar').value; // The name entered in the search bar (without extension)

    if (songName) {
        // Retrieve the list of songs with their extensions from the song list
        const songItems = document.getElementById('songList').getElementsByTagName('a');
        
        let fullSongPath = null;
        
        // Find the song with the matching name (including the extension)
        Array.from(songItems).forEach(item => {
            const fullSongName = item.textContent;
            if (fullSongName === songName) {
                fullSongPath = item.dataset.fullPath; // Get the full path from the dataset or another attribute
            }
        });

        if (fullSongPath) {
            playSong(fullSongPath); // Play the full song path
        } else {
            alert('Song not found. Please select a song from the list.');
        }
    } else {
        alert('Please enter or select a song.');
    }
};

/*Pause button */
        document.getElementById('pauseButton').onclick = function() {
            if (sound && sound.playing()) {
                sound.pause();//pause the sound
                isPaused=true;//set paused state to true
                clearInterval(timeUpdateInterval); // Stop updating the timestamp when paused
            } else if (sound && isPaused){
                sound.play(); //resume playing
                isPaused=false;
                timeUpdateInterval = setInterval(updateTimestamp, 1000); // Resume updating the timestamp when the song is resumed
            }
        };

/*resume button */
// document.getElementById('resumeButton').onclick=function(){

//     if(sound && isPaused){
//         sound.play(); //resume playing
//         isPaused=false;
//     }
// }

/*Stop button */
        document.getElementById('stopButton').onclick = function() {
            if (sound) {
                sound.stop();
                clearInterval(timeUpdateInterval); // Stop updating the timestamp when the song is stopped
                document.getElementById('timestamp').innerText = "00:00"; // Reset timestamp when the song stops
                sound=null; //clear sound instance
                isPaused=false; //reset paused state
            }
        };

// Function to fetch songs and display them
function fetchSongs() {
    fetch('http://localhost:8001/api/songs') // Fetch the list of songs
        .then(response => response.json())
        .then(songNames => {
            const songListDiv = document.getElementById('songList');
            
            songListDiv.innerHTML = ''; // Clear the existing list

            songNames.forEach(song => {// Strip extension for display but keep it for playing
                const songWithoutExtension = song.replace(/\.(mp3|ogg|wav)$/, '');
                const decodedSong = decodeURIComponent(songWithoutExtension);

                const songItem = document.createElement('a');
                songItem.textContent = decodedSong;
                songItem.dataset.fullPath = song; // Store the full song path with extension
                
                songItem.onclick = () => {
                    document.getElementById('searchBar').value = decodedSong;
                    playSong(song); // Play the song when clicked
                };
                
                songListDiv.appendChild(songItem);
            });

            songListDiv.style.display = 'block';
        })
        .catch(err => {
            console.error('Error fetching songs:', err);
        });
}

        // Function to filter songs based on search input
        function filterSongs() {
            const filter = document.getElementById('searchBar').value.toLowerCase();
            const songItems = document.getElementById('songList').getElementsByTagName('a');

        // Loop through the song list and hide songs that don't match the filter
            Array.from(songItems).forEach(item => {
                const decodedSongText = decodeURIComponent(item.textContent); // Ensure song name is decoded
                if (decodedSongText.toLowerCase().indexOf(filter) > -1) {
                    item.style.display = '';
                } else {
                    item.style.display = 'none';
                    
                }
            });
        }

        // Fetch songs when the page loads
        window.onload = fetchSongs;

        // Show song list when search bar is focused
        document.getElementById('searchBar').onfocus = function() {
            fetchSongs(); // Fetch songs when the search bar is focused
            document.getElementById('songList').style.display = 'block';
        };

        // Hide the song list when clicking outside
        document.addEventListener('click', function(event) {
            if (!event.target.closest('#searchBar') && !event.target.closest('#songList')) {
                document.getElementById('songList').style.display = 'none';
            }
        });

        // Filter the song list when typing in the search bar
        document.getElementById('searchBar').oninput = function() {
            filterSongs();
        };

