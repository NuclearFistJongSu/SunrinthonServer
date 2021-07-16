import express from 'express';
import cors from 'cors';
import applyRouters from "./lib/applyRouters";
import routers from './routes';
import errorRequestHandler from "./lib/errorRequestHandler";
import swaggerUI from 'swagger-ui-express';
import YAML from 'yamljs';
import path from 'path';

const app = express();

const swaggerSpec = YAML.load(path.join(__dirname, '../src/docs/openapi.yml'));
app.use(cors({
    origin: ["https://theil.doyeong.dev", "http://theil.doyeong.dev"]
}))
app.use(express.json());
applyRouters(app, routers);
app.use("/docs", swaggerUI.serve, swaggerUI.setup(swaggerSpec));

app.use(errorRequestHandler)
export default app;