import "dotenv/config";
import express from 'express';
import http from "http";
import { Server } from "socket.io";
import { router } from "./routes";
import cors from "cors";

const app = express();

app.use(express.json());
app.use(cors());  // Should go before the router :)
app.use(router);

const serverHttp = http.createServer(app);

const io = new Server(serverHttp, {
    cors: {
        origin: "*"
    }
});

io.on("connection", socket => {
    console.log(socket.id);
})

app.get("/github", (request, response) => {
    const clientId = process.env.GITHUB_CLIENT_ID;
    response.redirect(`https://github.com/login/oauth/authorize?client_id=${clientId}`)
})

app.get("/signin/callback", (request, response) => {
    const { code } = request.query;
    response.json(code)
});

export { serverHttp, io }