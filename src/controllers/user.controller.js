import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { User } from "../models/user.models.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
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
  console.log("email:", email);

  //check the user data validation
  if (
    [fullName, email, username, password].some((field) => field?.trim() === "")
  ) {
    throw new ApiError(404, "All fields are required");
  }

  //to check that user exist or not=by importing User model it contact
  //with database and check all thing for us from database
  const existedUser = User.findOne({
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
  const coverImageLocalPath = req.files?.coverImage[0];
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
    throw new ApiError(500, "Somwthing went wrong while registering the user");
  }
  //return response
  return res
    .status(201)
    .json(new ApiResponse(200, createdUser, "User created successfully"));
});
//all tast completed
export { registerUser };
