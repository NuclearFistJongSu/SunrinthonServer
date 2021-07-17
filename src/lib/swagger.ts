import swaggerJsDoc from "swagger-jsdoc";
import * as fs from "fs";
import * as path from "path";
import _ from "lodash";


const options = {
    swaggerDefinition: {
		info: {
			version: "v1",
			title: "Stocker",
			description: "Stocker API",
		},
		host: "sunrinthon.heroku.com",
		basePath: "/",
	},
	apis: ["**/routes/*.ts"],
};

const swaggerSpec:any = swaggerJsDoc(options);
const swaggerPath: string = path.resolve(__dirname, `../../src/docs`, `./`);
const dirs = fs.readdirSync(swaggerPath);

swaggerSpec.schemas = {};
for (const [index, fileName] of _.entries(dirs)) {
	const [name, type] = fileName.split(".");
	const data = JSON.parse(
        fs.readFileSync(path.join(swaggerPath, fileName)).toString()
    );

	if (type === "schema")
		swaggerSpec.schemas[name] = data;
	else {
		swaggerSpec.definitions[name] = data;
	}
}

export default swaggerSpec;