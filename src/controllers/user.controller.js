import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js"
import { upload } from "../middlewares/multer.middleware.js";
import { uploadOnCloudinary } from "../utils/cloudInary.js";

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

    const existedUser = User.findOne({
        $or: [{ username }, { email }]
    })
    if (existedUser) {
        throw new ApiError(400, "User with email or username already exists")
    }

    // if (
    //     [fullName, email, username, password].some((field) => field ? .trim() === "")) {
    //     throw new ApiError(400, "All field is required ")
    // }

    // let avaterLocalPath;
    // if (req.files && req.files.avatar && req.files.avatar[0]) {
    //     avaterLocalPath = req.files.avatar[0].path;
    // } else {
    //     avaterLocalPath = 'default_avatar_path';
    // }

    const avaterLocalPath = req.files && req.files.avatar && req.files.avatar[0] ?
        req.files.avatar[0].path :
        'default_avatar_path';

    // If avatar file is mandatory, throw an error
    if (avaterLocalPath === 'default_avatar_path') {
        throw new ApiError(400, "Avatar file is required");
    }

    const coverImageLocalPath = (req.files && req.files.coverImage && req.files.coverImage[0] && req.files.coverImage[0].path) || 'default_cover_image_path';

    // Assuming cover image is required
    const isCoverImageRequired = true; // Set based on your logic

    if (isCoverImageRequired && coverImageLocalPath === 'default_cover_image_path') {
        throw new ApiError(400, "Cover image file is required");
    }

    // const avaterLocalPath = req.files ? .avater ? .[0] ? .path;
    // const coverIamgeLocalPath = req.files ? .coverImage[0] ? .path;


    // if (!avaterLocalPath) {
    //     throw new ApiError(400, "Avater file is required")
    // }


    const avater = await uploadOnCloudinary(avaterLocalPath)

    const coverImage = await uploadOnCloudinary(coverImageLocalPath)

    if (!avater) {
        throw new ApiError(400, "Avatar file is required");
    }
    User.create({
        fullName,
        avater: avater.url,
        coverImage: coverImage ? .url,
        email,
        password,
        username: username.toLowerCase()
    })

})

export { registerUser }