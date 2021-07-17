import express from 'express';
import cors from 'cors';
import applyRouters from "./lib/applyRouters";
import swaggerSpec from './lib/swagger';
import routers from './routes';
import errorRequestHandler from "./lib/errorRequestHandler";
import swaggerUI from 'swagger-ui-express';

const app = express();

app.use(cors({
    origin: ["https://theil.doyeong.dev", "http://theil.doyeong.dev"]
}))
app.use(express.json());
applyRouters(app, routers);

app.use("/docs", swaggerUI.serve, swaggerUI.setup(swaggerSpec));

app.use(errorRequestHandler)
export default app;