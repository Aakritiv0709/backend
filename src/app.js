import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
const app = express();
/*IT IS USE TO RESOLVE CORS ERROR THE BELOW WRITTEN STATEMENT USING "USE" KEYWORD
IS A MIDDLEWARE*/
app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);
/*TO ACCEPT THE JSON DATA FROM FRONTEND UPTO A LIMIT OF 16KB IN ANY FORMAT*/
app.use(express.json({ limit: "16kb" }));
/*SOMETIMES OUR URL ARE ENCODED USING DIFFERENT SPECIAL CHARACTERS*/
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
/*ANY TYPE OF FILE AND IMAGE OR DATA IS STORED INSIDE PUBLIC FOLDER*/
app.use(express.static("public"));
/*TO STORE THE DATA OF USER IN COOKIE FORMAT*/
app.use(cookieParser());

// IMPORT ROUTES
import userRouter from "./routes/user.routes.js";

//ROUTES DECLARATION
//when you write controllers and routes in same page then write app.get 
//but here routes and controller are on different page so use app.use

app.use("/api/v1/users",userRouter);
//here in above code /users becomes prefix so it become
// http://localhost:8000/api/v1/users/register


export { app };
