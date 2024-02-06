import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { User } from "../models/user.models.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";

//METHOD FOR GENERTING ACCESS TOKEN AND REFRESH TOKEN
const generateAccessAndRefreshTokens = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });
    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      500,
      "Something went wrong while generating access and refresh token"
    );
  }
};
//***********************/

const registerUser = asyncHandler(async (req, res) => {
  //return res.status(200).json({
  // message: "ok",
  // });

  //REGISTER USER LOGIC AND STEPS:=
  /*TAKE THE DATA OF USER or get user details from frontend
 VALIDATION CHECK-not empty
 CHECK THAT USER IS NEW OR NOT or check if user already exists:-username,email
 check for image ,check for avatar
 upload them to cloudinary:=first store in localhost then cloudinary
 create user object-create entry in db
 remove password and refresh token field from response because it is private thing or sensitive data
 check for user creation or IF IT IS NEW THEN CREATE A NEW USER
 return response
 */

  //req.body=data aa jata hai
  //sned the user data
  const { fullName, email, username, password } = req.body;
  //console.log("email:", email);

  //check the user data validation
  if (
    [fullName, email, username, password].some((field) => field?.trim() === "")
  ) {
    throw new ApiError(404, "All fields are required");
  }

  //to check that user exist or not=by importing User model it contact
  //with database and check all thing for us from database
  const existedUser = await User.findOne({
    $or: [{ username }, { email }],
  });
  if (existedUser) {
    throw new ApiError(
      409,
      "the entered username and email is already exist in database"
    );
  }
  //check the image of avatar
  //we know req.body returns all the user entered data but we add middleware so
  //it adds some more function in our req.body like=req.files by multer package
  //"?."=is called chaining operator which is used becoz may be its exits or not to check
  const avatarLocalPath = req.files?.avatar[0]?.path;
  //const coverImageLocalPath = req.files?.coverImage[0]?.path;
  //write code for coverimage because it is not required field so how to
  //handle error when someone not sent the coverimage
  //you can also check avatar image in the below form
  let coverImageLocalPath;
  if (
    req.files &&
    Array.isArray(req.files.coverImage) &&
    req.files.coverImage.length > 0
  ) {
    coverImageLocalPath = req.files.coverImage[0].path;
  }

  //avatar image is required so check the validation
  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar file local path is required");
  }
  const avatar = await uploadOnCloudinary(avatarLocalPath);
  const coverImage = await uploadOnCloudinary(coverImageLocalPath);
  if (!avatar) {
    throw new ApiError(400, "Avatar file is required");
  }
  const user = await User.create({
    fullName,
    avatar: avatar.url,
    coverImage: coverImage?.url || "", //check that if coverimage is availabe then use it
    //otherwise empty because it is not required field
    email,
    password,
    username: username.toLowerCase(),
  });
  //to find user by id because atomatic db gives every data a unique id below is code
  //const createdUser = await User.findById(user._id);

  //code for remove password and refresh token field
  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );
  //last validation that user created successfully or not
  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while registering the user");
  }
  //return response
  //console.log(req.body); it returns fulname,password,username and email
  //console.log(req.files); it returns all the info of avatar and coverimage because
  //they both are files
  return res
    .status(201)
    .json(new ApiResponse(200, createdUser, "User created successfully"));
});

//LOGIN USER
const loginUser = asyncHandler(async (req, res) => {
  //to do
  // req body->data
  //username or email
  //find the user
  //password check
  //access and refresh token send to user
  //send cookies
  //response that it successfully login

  const { username, email, password } = req.body; //either login with username and pas or email and pass
  if (!(username || email)) {
    throw new ApiError(400, "username or password is required");
  }
  //find user that it exits in database or not check
  const user = await User.findOne({
    $or: [{ username }, { email }],
  });
  if (!user) {
    throw new ApiError(404, "user does not exist");
  }
  //check password User=mongodb or mongoose ka ek object hai ye unse baat krta h iske fun findOne etc
  //user=ye hamara banaya gya user hai

  const isPasswordValid = await user.isPasswordCorrect(password); //req.body wala password h yha means jo enter kiya gya h abhi
  if (!isPasswordValid) {
    throw new ApiError(401, "password is not valid or incorrect");
  }
  //access or refresh token generate create=>sabse upar create kiya h
  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
    user._id
  );
  const loggedInUser = await User.findById(user._id).select(
    "-password -refreahToken"
  );
  const options = {
    //it is modifiable from server only not from frontend
    httpOnly: true,
    secure: true,
  };
  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          user: loggedInUser,
          accessToken,
          refreshToken,
        },
        "User logged In successfully"
      )
    );
});
//LOGOUT USER
const logoutUser = asyncHandler(async (req, res) => {
  //auth middleware for logout purpose
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        refreshToken: undefined,
      },
    },
    {
      new: true,
    }
  );
  const options = {
    httpOnly: true,
    secure: true,
  };
  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged Out successfully"));
});
//ENDPOINT FOR REFRESHING TOKEN
const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken =
    req.cookies.refreshToken || req.body.refreshToken;
  if (!incomingRefreshToken) {
    throw new ApiError(401, "unauthorized request");
  }
  try {
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );
    const user = await User.findById(decodedToken?._id);
    if (!user) {
      throw new ApiError(401, "Invalid refresh token");
    }
    if (incomingRefreshToken !== user?.refreshToken) {
      throw new ApiError(401, "Refresh token is expired or used");
    }
    const options = {
      httpOnly: true,
      secure: true,
    };
    const { accessToken, newRefreshToken } =
      await generateAccessAndRefreshTokens(user._id);
    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", newRefreshToken, options)
      .json(
        200,
        { accessToken, refreshToken: newRefreshToken },
        "Access token refreshed"
      );
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid refresh token");
  }
});
export { registerUser, loginUser, logoutUser, refreshAccessToken };
