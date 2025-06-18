import {asyncHandler} from '../utils/asyncHandler.js'
import {ApiError} from "../utils/ApiError.js"
import {User} from "../models/user.model.js"
import {uploadOnCloudinary} from "../utils/cloudinary.js"
import {ApiResponse} from "../utils/ApiResponse.js"

const generateAccessAndRefreshTokens = async(userId) => {
    try {
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken =  user.generateRefreshToken()

        user.refreshToken = refreshToken
        await user.save({validateBeforeSave: false})

        return  {accessToken, refreshToken}  

9    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating refresh and access token")
    }
}

const registerUser = asyncHandler(async (req, res) => {
    // Get user data from Frontend
    // Validate the data as it should not be empty
    // Check if user already exists - username or email
    // UCheck for images, avatar, etc.
    // Upload the image to cloudinary and check for avatar upload
    // Create user object - create entry in database
    // Remove password and refresh token from user object
    // Check for user creation
    // Send response to frontend with user data

    const {fullName, email, username, password} = req.body
    // console.log(req.body);
    
    // console.log(`Full Name: ${fullName}, Email: ${email}, Username: ${username}, Password: ${password}`);

    // if(fullName === ""){
    //     throw new ApiError(400, "Full name is required")
    // }

    if(
        [fullName, email, username, password].some((field)=>field?.trim()=== "")
    ){
        throw new ApiError(400, "All fields are required")
    }

    // Jo User humne export kiya h from user.model.js uska database se direct connection hota h and it has all the methods to interact with the database

    const existedUser = await User.findOne({
        $or: [{ username },{ email }]
    })

    if(existedUser){
        throw new ApiError(409, "User already exists with this username or email")
    }

    // Now we added middleware in userRoutes so it will give access and add additional fields to req.body
    // Multer gives access to req.files which contains the files uploaded by the user

    // console.log(req.files);
    
     const avatarLocalPath =  req.files?.avatar[0]?.path
    //  const coverImageLocalPath = req.files?.coverImage[0]?.path

    let coverImageLocalPath;
    if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0){
        coverImageLocalPath = req.files.coverImage[0].path
    }

    //  console.log(`Avatar Local Path: ${avatarLocalPath}`);
    //  console.log(`Cover Image Local Path: ${coverImageLocalPath}`);

     if(!avatarLocalPath){
        throw new ApiError(400, "Avatar is required")
     }

    const avatar = await uploadOnCloudinary(avatarLocalPath)
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    if(!avatar) {
        throw new ApiError(400, "Avatar file is required")
    }

    const user = await User.create({
        fullName,
        avatar : avatar.url,
        coverImage : coverImage?.url || "",
        email,
        password,
        username : username.toLowerCase()
    })

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    if(!createdUser){
        throw new ApiError(500, "User creation failed")
    }

    return res.status(201).json(
        new ApiResponse(200, createdUser, "User registered successfully")
    )
    
})

const loginUser = asyncHandler(async(req, res)=> { 
    // req body -> data
    // username or email base
    // find the user
    // password check
    // access token and refresh token
    // send cookie

    const {email, username, password} = req.body
    if(!(username || email))
    {
        throw new ApiError(400, "username or email is required")
    }

    const user = await User.findOne({
        $or: [{username}, {email}]
    })

    if(!user){
        throw new ApiError(404, "User does not exist")
    }

    const isPasswordValid = await user.isPasswordCorrect(password)

    if(!isPasswordValid){
        throw new ApiError(401, "Invalid user credentials")
    }

    const {accessToken, refreshToken} = await generateAccessAndRefreshTokens(user._id)

    const loggedInUser = await User.findById(user._id).select("-password, -refreshToken")

    const options = {
        httpOnly : true,
        secure: true
    }

    return res
    .status(200)
    .cookie("accessToken",accessToken, options)
    .cookie("refreshToken", refreshToken, options).
    json(
        new ApiResponse(
            200,
            {
                user: loggedInUser, accessToken, refreshToken
            },
            "User logged in Successfully"
        )
    )

})

const logoutUser = asyncHandler(async(req,res)=>{
    // Clear cookies 
    // Clear refresh token in User
    await User.findByIdAndUpdate(
        req.user._id,{
            $set:{
                refreshToken : undefined
            }
        },
        {
            new: true
        }
    )

    const options = {
        httpOnly : true,
        secure: true
    }

    return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse (200, {}, "User logged out"))

})


export {registerUser, loginUser, logoutUser}