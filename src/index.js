import dotenv from 'dotenv';
import { app } from './app.js'
import connectDB from "./db/index.js";

dotenv.config({
    path: './.env'
})
connectDB()
    .then(() => {
        app.listen(process.env.PORT || 8000, () => {
            console.log(`Server is running at port : 
            ${process.env.PORT}`);
        })



        //  mongoose.connection.close();

    })
    .catch((error) => {
        console.log("MONGO BD connection failed !! ", error);
    })