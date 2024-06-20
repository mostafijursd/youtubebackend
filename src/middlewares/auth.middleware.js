import { ApiError } from "../utils/ApiError";
import { asyncHandler } from "../utils/asyncHandler";

export const verifyJWT = asyncHandler(async(req, res, next) => {
    //  const token=  req.cookies?.accessToken || req.header("Authorization") ?.replace("Bearer","")

    const token = (req.cookies && req.cookies.accessToken) ||
        (req.header("Authorization") ? req.header("Authorization").replace(/^Bearer\s*/, '') : undefined);
    if (!token) {
        throw new ApiError(401, "Unauthorized request")
    }
})