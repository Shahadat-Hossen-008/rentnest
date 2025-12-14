import mongoose from "mongoose";


const dbConn = async () => {
    try{
        mongoose.connect(process.env.MONGO_URL);
        console.log("Database connected successfully");
    }catch{
        console.log("Database connection failed");
    }
}

export default dbConn;