import {connect} from "mongoose";
import envs from "../envs";

function connectDB() {
    return connect(envs.MONGO_URL, {useNewUrlParser: true, useUnifiedTopology: true});
}

export default connectDB;