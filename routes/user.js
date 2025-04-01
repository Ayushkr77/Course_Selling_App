// All the routes that start with /user are handled here



// function createUserRoutes(app) {
//     app.post("/user/signup",(req,res)=> {
//         res.json({
//             "message": "User created successfully",
//         })
//     })
    
//     app.post("/user/signin",(req,res)=> {
//         res.json({
//             "message": "User signed in",
//         })
//     })
    
//     app.post("/user/purchases",(req,res)=> {  // to see the purchased courses
//         res.json({
//             "message": "Purchased courses",
//         })
//     })
// }

// module.exports={
//     createUserRoutes: createUserRoutes // or just createUserRoutes
// }





// Using Router in express

// const express=require("express");
// const Router=express.Router();
// OR
const {Router}=require("express");

const userRouter=Router();

userRouter.post("/signup",(req,res)=> {  // no need to write /user/signup
    res.json({
        "message": "User created successfully",
    })
})

userRouter.post("/signin",(req,res)=> {
    res.json({
        "message": "User signed in",
    })
})

userRouter.post("/purchases",(req,res)=> {  // to see the purchased courses
    res.json({
        "message": "Purchased courses",
    })
})

module.exports={  // Now we are not exporting any function anymore, now we are exporting a router
    userRouter:userRouter
}