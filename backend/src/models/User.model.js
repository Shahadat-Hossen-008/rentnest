import mongoose from "mongoose";
import bcrypt from 'bcryptjs'

const userSchema = new mongoose.Schema({
    userName:{
        type: String,
        required: true,
        unique: true
    },
    fullName:{
        type: String,
        required: true,
    },
    email:{
        type: String,
        required: true,
        unique: true
    },
    password:{
        type: String,
        required: true
    },
    role:{
        type: String,
        enum: ['admin', 'host', 'guest'],
        required: true,
        default: 'guest'
    },
    profilePic: {
        url: {
            type: String,
            default: ""
        },
        publicId: {
            type: String
        }
    },
    refreshToken: {
        type: String
    },
    isVerfied:{
        type: Boolean,
        default: false
    }, 
     otpCode: String, 
    expiredOtp: Date
}, {timestamps: true})

//hash password in save time
userSchema.pre('save', async function () {
    if (!this.isModified('password')) {
        return
    }

    this.password = await bcrypt.hash(this.password, 12)
})

//check correct password
userSchema.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password, this.password)
}

const User = mongoose.model('User', userSchema)
export default User;