/*THERE IS 4 KEY-ERR,REQ,RES,NEXT REQ-WHEN USER SEND REQUEST FOR ANYTHING
RES-WHEN SERVER SENDS A RESPONSE NEXT-IT IS FOR MIDDLEWARE TO PASS ONE THING TO ANOTHER
OR TO PASS DIFFERENT TEST CASES ERR-IT IS FOR ANY TYPE OF ERROR*/
const asyncHandler = (requestHandler) => {
  return (req, res, next) => {
    Promise.resolve(requestHandler(req, res, next)).catch((err) => next(err));
  };
};
export { asyncHandler };

/* try and catch wala 
const asyncHandler = () => {};
const asyncHandler = (func) =>()=> {};
const asyncHandler = (func) =>async()=> {};
*****for understanding only */
/*
const asyncHandler=(func)=async(req,res,next)=>{
try{
    await func(req,res,next)
}catch(error){
    res.status(err.code||500).json({
        success:false,
        message:err.message,
    })
}
}
export { asyncHandler };*/
