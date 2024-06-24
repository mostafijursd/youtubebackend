import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken"
export const verifyJWT = asyncHandler(async(req, _, next) => {
    //  const token=  req.cookies?.accessToken || req.header("Authorization") ?.replace("Bearer","")

    try {
        const token = (req.cookies && req.cookies.accessToken) ||
            (req.header("Authorization") ? req.header("Authorization").replace(/^Bearer\s*/, '') : undefined);
        if (!token) {
            throw new ApiError(401, "Unauthorized request")
        }
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)

        const user = await User.findOne({ _id: decodedToken && decodedToken._id }, '-password -refreshToken');


        if (!user) {
            //todo discuss about 
            throw new ApiError(401, "Invalid Acces Token")
        }
        req.user = user;
        next()

    } catch (error) {
        throw new ApiError(401, error.message || "Invalid access token")
    }
})