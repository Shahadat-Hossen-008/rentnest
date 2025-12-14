import express, { urlencoded } from 'express'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import User from './models/User.model.js'



const app = express()

//access request
app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))

//handle cookies
app.use(cookieParser())

//for access req body
app.use(urlencoded({extended: false}))
app.use(express.json())

//routes


app.get('/', (req, res)=>{
    res.send('rent nest server is running....')
})

app.post("/register", async (req, res)=>{
    const {userName, fullName, email, password} = req.body;
    if(!userName || !fullName || !email || !password){
        return res.status(400).json({message: "All fields are required"})
    }
    const exitingUser = await User.findOne({email});
    if(exitingUser && exitingUser.isVerfied){
        return res.status(409).json({message: "User already exists"})
    }

    const otpCode = Math.floor(100000 + Math.random() * 900000).toString() ;
    const otpExpiresAt = new Date(Date.now() + 150 * 1000);
    if(!exitingUser){
        const newUser = new User({
            userName,
            fullName,
            email,
            password,   
            otpCode: otpCode,
            expiredOtp: otpExpiresAt
        });
        await newUser.save();
        return res.status(201).json({message: "User registered successfully. Please verify your email."})
    } else{
        exitingUser.otpCode = otpCode;
        exitingUser.expiredOtp = otpExpiresAt;
        await exitingUser.save();
        return res.status(200).json({message: "OTP resent successfully. Please verify your email."})
    }
    
})

app.post("/verify-otp", async (req, res)=>{
    const {email, otp} = req.body;
    const user = await User.findOne({email});
    if(!user){
        return res.status(404).json({message: "User not found"});
    }
    if(!email || !otp){
        return res.status(400).json({message: "Email and OTP are required"});
    }
    
    const currentTime = new Date();
    if(currentTime > user.expiredOtp){
        return res.status(400).json({message: "OTP has expired. Please request a new one."});
    }
    if(user.otpCode !== otp){
        return res.status(400).json({message: "Invalid OTP. Please try again."});
    }

    user.isVerfied = true;
    user.otpCode = undefined;
    user.expiredOtp = undefined;
    await user.save();
    return res.status(200).json({message: "OTP verified successfully."});
})
// app.use()

export default app