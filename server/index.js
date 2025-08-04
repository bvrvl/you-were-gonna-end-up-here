const express = require('express');
const app = express();

// Test API request route

app.get('api/test', (req, res) => {
    res.json({ message: "Hello from the server"});
});

app.listen(3000, () => console.log('Server running on http://localhost:3000'));

// export Express app instance to be used as a serverless function
module.exports = app;
