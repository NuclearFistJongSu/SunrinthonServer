import app from "./app";
import envs from "./envs";
import connectDB from "./lib/connectDB";

const PORT = envs.PORT;

connectDB()
    .then(() => {
        app.listen(PORT, () => {
            console.log(`Server started at port ${PORT}`);
        });
    })
