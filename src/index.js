//require('dotenv').config({path:'./env'}) YOU CAN WRITE THIS WAY ALSO
//BUT YOU FOLLOW IMPORT OR MODULE SYNTAX SO IT IS NOT ACCEPTED BELOW IS ACCEPTED
//AND CHANGE OF SOME SHOULD BE DONE IN PACKAGE.JSON FILE
import dotenv from "dotenv";
import connectDB from "./db/index.js";
import { app } from "./app.js";
/*DOTENV MAINLY USED TO LOAD ALL IMPORTANT DATA FROM ENV FILE AT THE START OF THE PROJECT*/
dotenv.config({
  path: "./.env",
});

/*DB WORKS ASYNCHROUSLY THATS WHY IT IS IMPORTANT TO HANDLE ERROR LIKE BELOW*/

connectDB()
  .then(() => {
    app.listen(process.env.PORT || 8000, () => {
      console.log(`server is running at port : ${process.env.PORT}`);
    });
  })
  .catch((err) => {
    console.log("Mongodb connection failed in index.js file ", err);
  });

/* OTHER WAY TO CONNECT DB INSIDE THE INDEX FILE ONLY BY USING TRY AND CATCH  
and ALSO OTHER TYPE IS WRITTEN INSIDE DB FOLDER SEPARATELY
db folder in index.js file
import mongoose from "mongoose";
import { DB_NAME } from "./constants";
import express from "express";
const app = express();
async () => {
  try {
    await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
    app.on("error", (error) => {
      console.log("ERROR:", error);
      throw error;
    });
    app.listen(process.env.PORT, () => {
      console.log(`your APP is listening at port ${process.env.PORT}`);
    });
  } catch (error) {
    console.log("ERROR", error);
    throw error;
  }
};
*/
