import mongoose, {Schema} from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const userSchema = new Schema(
    {
        username : {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true,
            index: true  //To make the field searchable in the database in optimized way
        },
         email : {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true
         },
         fullName : {
            type: String,
            required: true,
            trim: true,
            index: true
         },
         avatar:{
            type: String, //cloudinary url service will be used to store the image
            required: true
         },
         coverImage:{
            type: String //cloudinary url service will be used to store the image
         },
         watchHistory: [{
            type: Schema.Types.ObjectId,
            ref: "Video"
         }],
         password : {
            type: String,  //bcrypt library will be used to hash the password
            required: [true, "Password is required"],
         },
         //Tokens are data used for authentication and authorization in the application
         refreshToken : {  
            type: String
         }
    }, {timeStamps:true})

// we won't use arrow function in middleware hooks because we need to access the `this` context
//and also its time taking so we use async-await in the middleware hooks
userSchema.pre("save", async function (next) {
    if(!this.isModified("Password") ) return next() //if password is not modified, then skip hashing

    this.password =await bcrypt.hash(this.password, 10)
    next()
})    


// Custom methods
userSchema.methods.isPasswordCorrect = async function (password) {
    return await bcrypt.compare(password, this.password)
}

userSchema.methods.generateAccessToken = function (){
   return jwt.sign(
        {
            _id: this._id,
            email : this.email,
            username: this.username,
            fullname: this.fullname
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn : process.env.ACCESS_TOKEN_EXPIRY 
        }
    )
}

userSchema.methods.generateRefreshToken = function(){
    return jwt.sign(
        {
            _id: this._id
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn : process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}

export const User = mongoose.model("User", userSchema);