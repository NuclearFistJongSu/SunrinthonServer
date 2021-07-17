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
	apis: ["**/*.ts"],
};

const swaggerSpec:any = swaggerJsDoc(options);
const swaggerPath: string = path.resolve(__dirname, `../docs`, `./`);
const dirs = fs.readdirSync(swaggerPath);

swaggerSpec.schemas = {};
for (const [index, fileName] of _.entries(dirs)) {
    const defenitionName = fileName.replace(".model.json", "");
    swaggerSpec.schemas[defenitionName] = JSON.parse(
        fs.readFileSync(path.join(swaggerPath, fileName)).toString()
    )
}

export default swaggerSpec;