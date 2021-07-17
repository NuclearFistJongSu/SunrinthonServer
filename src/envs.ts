import dotenv from 'dotenv';

dotenv.config();

const envs = {
    PORT: process.env.PORT || 4000,
    MONGO_URL: process.env.MONGO_URL || "mongodb://mongo/sunrinthon",
    ACCESS_KEY_ID: process.env.ACCESS_KEY_ID,
    SECRET_ACCESS_KEY: process.env.SECRET_ACCESS_KEY
};

export default envs;