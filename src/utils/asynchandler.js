const asyncHandler = (requestHandler) => {
    return(req, res, next)=>{
        Promise.resolve(requestHandler(req, res, next)).catch((error)=> next(error))
    }
}


export {asyncHandler}

// We are writing a function here which will we wrapped in try catch block although we will be using promises in our code but just for thw sake of understanding how things work we are writing this function


// const asyncHandler = () => {}
// const asyncHandler = (func) => {()=>{}}
// const asyncHandler = (func) => {async()=>{}}

// const asyncHandler = (fn) => async(req, res, next)=> {
//     try {
//         await fn(req, res, next)
//     } catch (error) {
//         res.status(error.code || 500).json({
//             success: false,
//             message: error.message
//         })
        
//     }
// }