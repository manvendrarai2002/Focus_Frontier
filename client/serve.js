const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 5500;

// Middleware to handle extensionless .html requests
app.use((req, res, next) => {
    if (req.method === 'GET' && !path.extname(req.path) && req.path !== '/') {
        const htmlPath = path.join(__dirname, req.path + '.html');
        if (fs.existsSync(htmlPath)) {
            return res.sendFile(htmlPath);
        }
    }
    next();
});

// Serve static files from the client directory
app.use(express.static(__dirname));

// Fallback to index.html for any SPA-style route that wasn't found above
app.use((req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Client development server running at http://localhost:${PORT}`);
});
