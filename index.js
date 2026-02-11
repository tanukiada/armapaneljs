const { GameDig } = require('gamedig');
const { spawn } = require('child_process');

const express = require('express');
const app = express();
const port = 3000;

app.use(express.json());

app.get('/', (req, res) => {
    res.json({output: 'hello, world!'});
});

app.get('/api/v1/service/status', (req, res) => {
    GameDig.query({
        type: 'arma3',
        host: '127.0.0.1',
        port: '2303'
    }).then((state) => {
        res.status(200).json({Status: "Online"});
    }).catch((error) => {
        res.status(503).json({Status: "Offline"});
    });
});

app.put('/api/v1/service/start', (req, res) => {
    
})

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});