import {Express} from "express";

function applyRouters(app: Express, routers: any[]) {
    for (const router of routers) {
        app.use(router.getInstance().router);
    }
}
export default applyRouters;