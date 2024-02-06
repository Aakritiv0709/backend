import multer from "multer";
const storage=multer.diskStorage({
    //req-request send by user ,file-file send by user mainly multer is used for this to
    // receive files from user,cb-callback
destination:function(req,file,cb){
    cb(null,"./public/temp"); //path where we store all files

},
filename:function(req,file,cb){
    //you can also add unique suffix in your file for that you have 
    //to read documentation of multer
    cb(null,file.originalname);//it gives the same which is user saved in
    // their pc but it is not good practice
}
})
export const upload=multer({
    storage,
})