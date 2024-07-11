import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";

export const verifyJWT = asyncHandler(async(req, res, next) => {
    try {
        // Extract token from cookies or Authorization header
        let token;
        if (req.cookies && req.cookies.accessToken) {
            token = req.cookies.accessToken;
        } else if (req.header("Authorization")) {
            token = req.header("Authorization").replace("Bearer ", "");
        }

        // Log the extracted token for debugging purposes
        console.log('Extracted Token:', token);

        // If no token is found, throw an unauthorized error
        if (!token) {
            throw new ApiError(401, "Unauthorized request: No token provided");
        }

        // Verify and decode the token
        let decodedToken;
        try {
            decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        } catch (err) {
            throw new ApiError(401, "Unauthorized request: Invalid token");
        }

        // Log the decoded token for debugging purposes
        console.log('Decoded Token:', decodedToken);

        // Ensure the decoded token contains an ID
        if (!decodedToken || !decodedToken._id) {
            throw new ApiError(401, "Unauthorized request: Token does not contain valid user ID");
        }

        // Find the user by ID from the decoded token
        const user = await User.findById(decodedToken._id).select("-password -refreshToken");

        // Log the found user for debugging purposes
        console.log('Authenticated User:', user);

        // If no user is found, throw an invalid access token error
        if (!user) {
            throw new ApiError(401, "Unauthorized request: User not found");
        }

        // Attach the user to the request object
        req.user = user;

        // Proceed to the next middleware or route handler
        next();
    } catch (error) {
        // Log the error for debugging purposes
        console.error('JWT Verification Error:', error);

        // Respond with an appropriate error message
        res.status(401).json(new ApiError(401, error.message || "Invalid access token"));
    }
});