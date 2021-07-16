import express, {RequestHandler} from 'express';
import "reflect-metadata";

export function Router<T extends RouterClass>(constructor: T) {
    const routes = Reflect.getMetadataKeys(constructor.prototype).map((v) => ({name: v, ...Reflect.getMetadata(v, constructor.prototype)}));

    return class Router extends constructor {
        public router = express.Router();
        private static instance = new Router();

        private constructor(...args: any[]) {
            super(...args);

            routes.forEach(route => {
                const middlewares: any = route.options.middlewares ? route.options.middlewares : [];
                // @ts-ignore
                this.router[route.method](route.path, ...middlewares, this[route.name]);
            })
        }
        public static getInstance() {
            return this.instance;
        }
    };
}
export function routes(method: string, path: string, options: Partial<RoutesOptions> = {}) {
    return function<T extends RequestHandler>(target: any, propertyKey: string, descriptor: TypedPropertyDescriptor<T>) {
        if (!descriptor.value) return;

        Reflect.defineMetadata(propertyKey, {method, path, options}, target);
        const func = descriptor.value;
        const handler: RequestHandler =  function (req, res, next) {
            Promise.resolve(func.call(target, req, res, next))
                .catch(e => {
                    next(e);
                });
        };

        descriptor.value = handler as T;
    }
}

type RouterClass = {new (...args: any[]): {
}};
interface RoutesOptions {
    middlewares: RequestHandler[]
}