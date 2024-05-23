import mongoose from "mongoose";
import { NAME_DB } from "../constants.js";

const connectDB = async() => {

    try {
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URL}/${NAME_DB}`)
        console.log(`\n MongoDB connected !! DB HOST :
        ${connectionInstance.connection.host}`);
    } catch (error) {
        console.log("MONDODB connection error", error);
        process.exit(1)
    }
}

export default connectDB;