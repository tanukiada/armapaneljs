const { GameDig } = require('gamedig');
const Docker = require('dockerode');
const argon2 = require('argon2');
const express = require('express');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const cors = require('cors');
const app = express();
const port = 3000;

app.use(express.json());

let docker = new Docker({socketPath: '/var/run/docker.sock'});

const username = process.env.db_user;
const password = process.env.db_pass;
const host = process.env.db_host;
const dbPort = 5432;

const { Client } = require('pg');
const config = {
    user: username,
    password: password,
    host: host,
    port: dbPort,
    database: 'postgres'
};

// Support Functions

function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.sendStatus(401);

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
}

async function createTablesIfNotExists() {
    const client = new Client(config);
    await client.connect();

    const usersQuery = `
        CREATE TABLE IF NOT EXISTS users (
            id SERIAL PRIMARY KEY,
            username TEXT NOT NULL,
            password TEXT NOT NULL
        );
    `;

    await client.query(usersQuery);
    console.log('Table created.');
    await client.end();
}

createTablesIfNotExists();

async function setContainerStatus(containerName, desiredStatus) {
    const container = docker.getContainer(containerName);

    try {
        const data = await container.inspect();
        const isRunning = data.State.Running;

        if (desiredStatus === 'Online') {
            if(!isRunning) await container.start();
            return { success: true, message: `Container ${containerName} is running.` };
        } else if (desiredStatus === 'Offline') {
            if (isRunning) await container.stop();
            return { success: true, message: `Container ${containerName} is stopped.` };
        } else {
            return { success: false, message: `Invalid status: ${desiredStatus}. Use "Online" or "Offline".` };
        }
    } catch (error) {
        return { success: false, message: `Failed to set container status: ${error.message}` }
    }
}

app.get('/api/v1/service/status', authenticateToken, (req, res) => {
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

app.put('/api/v1/service/status', authenticateToken, async (req, res) => {
    const { status } = req.body;

    if (!status) {
        return res.status(400).json({ success: false, message: 'Missing "status" in request body.' });
    }

    try {
        const result = await setContainerStatus("arma3", status);
        res.status(result.success ? 200 : 400).json(result);
    } catch (err) {
        res.status(500).json({ success: false, message: `Server error: ${err.message}` });
    }
});

app.post('/api/v1/auth/register', async(req, res) => {
    const client = new Client(config);
    await client.connect();
    const username = req.body.username;
    const hash = await argon2.hash(req.body.password);
    const query = {
        text: 'INSERT INTO users (username, password) values ($1, $2)',
        values: [username, hash],
    };
    results = await client.query(query);
    return res.status(201).json({ message: "Account created"});
})

app.post('/api/v1/auth/login', async (req, res) => {
    const client = new Client(config);
    await client.connect();
    const username = req.body.username;
    // const hash = await argon2.hash(req.body.password);
    // const query = {
    //     text: 'INSERT INTO users (username, password) values ($1, $2)',
    //     values: [username, hash],
    // };
    const query = {
        text: 'SELECT * FROM users WHERE username = $1',
        values: [username],
    };
    const password = req.body.password; 

    results = await client.query(query);

    const rows = results.rows;
    const row = rows[0];
    const dbUser = row.username;
    const hashedPW = row.password;

    if(username != dbUser) {
        return res.status(400).json({ message: "Invalid Credentials"});
    }

    if (!await argon2.verify(hashedPW, password)) {
        return res.status(400).json({ message: "Invalid Credentials"});
    }

    const token = jwt.sign(
        { uname: username },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
    );

    res.json({ token: token });
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});