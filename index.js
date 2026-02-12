const { GameDig } = require('gamedig');
const Docker = require('dockerode');

const express = require('express');
const app = express();
const port = 3000;

app.use(express.json());

let docker = new Docker({socketPath: '/var/run/docker.sock'});

// Support Functions
async function setContainerStatus(containerName, desiredStatus) {
    const container = docker.getContainer(containerName);

    try {
        const data = await container.inspect();
        const isRunning = data.State.Running;

        if (desiredStatus === 'Online') {
            if(isRunning) await container.start();
            return { success: true, message: `Container ${containerName} is running.` };
        } else if (desiredStatus === 'Offline') {
            if (!isRunning) await container.stop();
            return { success: true, message: `Container ${containerName} is stopped.` };
        } else {
            return { success: false, message: `Invalid status: ${desiredStatus}. Use "Online" or "Offline".` };
        }
    } catch (error) {
        return { success: false, message: `Failed to set container status: ${error.message}` }
    }
}


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

app.get('/api/v1/service/configs', async (req, res) => {
    configs = await container.GetArchive('/arma3/server/configs');
});

app.put('/api/v1/service/status', async (req, res) => {
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

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});