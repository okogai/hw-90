import express from 'express';
import expressWs from 'express-ws';
import cors from 'cors';
import { WebSocket } from 'ws';
import {Pixel} from "./ types";

const app = express();
expressWs(app);

const port = 8000;

app.use(cors());

const router = express.Router();

const activeConnections: WebSocket[] = [];

let pixels: Pixel[] = [];

router.ws('/draw', (ws: WebSocket) => {
    console.log('Client connected');

    ws.send(JSON.stringify({ type: 'init', pixels }));

    ws.on('message', (msg: string) => {
        const data = JSON.parse(msg);

        if (data.type === 'draw') {
            pixels = [...pixels, ...data.pixels];

            activeConnections.forEach(client => {
                if (client !== ws) {
                    client.send(JSON.stringify({ type: 'draw', pixels: data.pixels }));
                }
            });
        }
    });

    ws.on('close', () => {
        console.log('Client disconnected');
        const index = activeConnections.indexOf(ws);
        if (index !== -1) {
            activeConnections.splice(index, 1);
        }
    });

    activeConnections.push(ws);
});

app.use(router);

app.listen(port, () => {
    console.log(`Server started on port ${port}`);
});
