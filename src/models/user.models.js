import mongoose, { Schema } from "mongoose";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

/*CREATE A USER MODEL*/
const userSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    password: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    fullName: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    avatar: {
      type: String, //cloudnary url
      required: true,
    },
    coverImage: {
      type: String, //cloudnary url
    },
    watchHistory: [
      {
        type: Schema.Types.ObjectId,
        ref: "Video",
      },
    ],
    password: {
      type: String,
      required: [true, "Password is required"],
    },
    refreshToken: {
      type: String,
    },
  },
  { timestamps: true }
);

/*BECRYPT OR ENCODE THE USER PASSWORD WHEN THE PASSWORD IS MODIFIED*/
/*HERE pre- keyword means that becrypt the password before the whole code run OF MODEL */

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  //means ki agar modified nhi
  // h password toh next me chale jao warna bcrypt krdo
  // neche wale code ko chala do mtlb
  this.password = await bcrypt.hash(this.password, 10); // here 10 is a limit
  next();
});

/*COMPARE THE ACTUAL PASSWORD WITH BECRYPTED PASSWORD TO CHECK THAT THEY BOTH 
ARE SAME OR NOT */

userSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password);
};

/*GENERATE ACCESS TOKEN CODE*/
userSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    {
      _id: this._id,
      email: this.email,
      username: this.username,
      fullName: this.fullName,
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
    }
  );
};

/*GENERATE RESFRESH TOKEN CODE*/
userSchema.methods.generateRefreshToken = function () {
  return jwt.sign(
    {
      _id: this._id,
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
    }
  );
};
export const User = mongoose.model("User", userSchema);
