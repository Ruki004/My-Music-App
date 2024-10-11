const express = require('express');
const app = express();
const cors = require('cors'); // Import the CORS package
/*
This sets up Express, a web framework for Node.js, allowing you to easily handle HTTP requests and serve files. 
*/
const path = require('path');
const serveIndex = require('serve-index');  // Import serve-index
/*
This line serves static files (like .mp3 audio files) from your E:/osu!/Songs directory. 
*/
const fs = require('fs'); // Add file system module
const songsDirectory =  'E:/osu!/Songs';

app.use(cors());

// Serve static files from the osu! songs directory on your SSD
app.use('/docs/songs', express.static(songsDirectory), serveIndex(songsDirectory, { 'icons': true }));

// Endpoint to get song names in JSON format
app.get('/api/songs', (req, res) => {
    fs.readdir(songsDirectory, (err, files) => {
        if (err) {
            return res.status(500).send('Unable to scan directory: ' + err);
        }
        // Filter to include only mp3 files
        const songNames = files.filter(file => file.endsWith('.mp3')); // Adjust extension as needed
        res.json(songNames); // Return song names as JSON
    });
});

// // Root route handler
// app.get('/', (req, res) => {
//     res.send('Welcome to the osu! Music Player. Navigate to /songs to access your files.');
// });


app.use(express.static(path.join(__dirname, 'docs')));

// Root route handler - serve index.html on the root URL
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'docs', 'index.html'));
});


/*
When someone visits http://localhost:8002/, they’ll see a welcome message.
*/

// Start server
const PORT = process.env.PORT || 8001; // Use environment port or 8002
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});


