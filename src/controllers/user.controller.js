import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js"
import { uploadOnCloudinary } from "../utils/cloudInary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const generateAccessAndReferesh = async(userId) => {
    try {
        const user = await User.findById(userId)
        const accessToekn = user.generateAccessToken()
        const refreshToken = user.generateRefreeshToken()
        user.refreshToken = refreshToken
        await user.save({ validateBeforeSave: false })

        return { accessToekn, refreshToken }

    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating refersh and access token ")
    }
}


const registerUser = asyncHandler(async(req, res) => {
    // get user details from frontend 
    //validation - not empty 
    // check if user already exists : username ,eamil
    // ckeck for images , check for avater 
    // upload them to cloudinary ,avater 
    // create user object- create entry in db
    // remove user password and refresh field from respone 
    // check for user creation 
    // return res 


    const { fullName, email, username, password } = req.body
    console.log("Email:", email);

    if (fullName === "") {
        throw new ApiError(400, "Fullname is required")
    }
    if (email === "") {
        throw new ApiError(400, "Email is required")
    }
    if (username === "") {
        throw new ApiError(400, "username is required")
    }
    if (password === "") {
        throw new ApiError(400, "password is required")

    }

    const existedUser = await User.findOne({
        $or: [{ username }, { email }]
    })
    if (existedUser) {
        throw new ApiError(409, "User with email or username already exists")
    }

    // console.log(req.files);
    // if (
    //     [fullName, email, username, password].some((field) => field?.trim() === "")) {
    //     throw new ApiError(400, "All field is required ")
    // }

    // let avaterLocalPath;
    // if (req.files && req.files.avatar && req.files.avatar[0]) {
    //     avaterLocalPath = req.files.avatar[0].path;
    // } else {
    //     avaterLocalPath = 'default_avatar_path';
    // }

    const avaterLocalPath = req.files && req.files.avatar && req.files.avatar[0] && req.files.avatar[0].path;
    // const coverImageLocalPath = req.files && req.files.coverImage && req.files.coverImage[0] && req.files.coverImage[0].path;


    // let coverIamgeLocalPath;

    // if (req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length > 0) {
    //     coverIamgeLocalPath = req.files.coverImage[0].path
    // }
    let coverImageLocalPath;

    if (req.files && Array.isArray(req.files.coverImage)) {
        [coverImageLocalPath] = req.files.coverImage.map(file => file.path);
    }

    if (!avaterLocalPath) {
        throw new ApiError(400, "Avatar file is required");
    }

    // if (!coverImageLocalPath) {
    //     throw new ApiError(400, "Cover image file is required");
    // }


    // const avaterLocalPath = req.files ? .avatar ? .[0] ? .path;
    // const coverIamgeLocalPath = req.files ? .coverImage[0] ? .path;


    // if (!avaterLocalPath) {
    //     throw new ApiError(400, "Avater file is required")
    // }


    const avatar = await uploadOnCloudinary(avaterLocalPath)

    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    if (!avatar) {
        throw new ApiError(400, "Avatar file is required");
    }
    const user = await User.create({
        fullName,
        avatar: avatar.url,
        coverImage: coverImage ? coverImage.url : "",
        email,
        password,
        username: username.toLowerCase()
    })
    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )
    if (!createdUser) {
        throw new ApiError(500, "Somethong went wrong while registering the user")
    }
    return res.status(201).json(
        new ApiResponse(200, createdUser, "User registered successfully  ")
    )
})

const loginUser = asyncHandler(async(req, res) => {
    //req- body -data
    // username or email 
    // find the user 
    // password check
    // access token 
    //send cookie

    const { email, username, password } = req.body


    if (!username || !email) {
        throw new ApiError(400, "username or email rquired ")
    }

    const user = await User.findOne({
        $or: [{ username }, { email }]
    })

    if (!user) {
        throw new ApiError(404, "User does not exist")
    }

    const isPasswordValid = await user.isPasswordCorrect(password)

    if (!isPasswordValid) {
        throw new ApiError(401, "Invalid user credentials")
    }

    const { accessToekn, refreshToken } = await generateAccessAndReferesh(user._id)

    const loggedInUser = await User.findById(user._id).select("-password - refreshToken", )

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
        .status(200)
        .cookie("accessToken", accessToekn, options)
        .cookie("retreshToken", refreshToken, options)
        .json(
            new ApiResponse(
                200, {
                    user: loggedInUser,
                    accessToekn,
                    refreshToken
                },

                "User Loggend In Successfully"

            )


        )
});



export {
    registerUser,
    loginUser
}