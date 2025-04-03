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
const { userModel, purchaseModel, courseModel } = require("../db");
const bcrypt = require("bcrypt");
const {z} = require("zod");
const jwt = require("jsonwebtoken");

const JWT_USER_PASSWORD="userSecret";


const userRouter=Router();

userRouter.post("/signup",async (req,res)=> {  // no need to write /user/signup
    // const { email, password, firstName, lastName } = req.body;
    
    const reqBody=z.object({
        email: z.string().min(3).email(),
        password: z.string().min(3),
        firstName: z.string().min(3),
        lastName: z.string().min(3)
    }).strict();

    const result=reqBody.safeParse(req.body);
    if(!result.success) {
        return res.status(400).json({
            "message": "Invalid data",
            "errors": result.error
        })
    }

    const { email, password, firstName, lastName } = req.body;
    // const { email, password, firstName, lastName } = result.data;

    const hashedPassword=await bcrypt.hash(password, 5);

    try {
        await userModel.create({
            email,
            password: hashedPassword,
            firstName,
            lastName
        })
    }
    catch(err) {
        return res.status(400).json({
            message: "You are already signedup", 
        });
    }

    res.json({
        "message": "User signed up successfully",
    })
})

userRouter.post("/signin", async (req,res)=> {
    const {email, password}=req.body;
    const user = await userModel.findOne({ 
        email 
    });

    if(!user) {
        return res.status(400).json({
            "message": "Invalid email",
        })
    }

    const matchPassword=await bcrypt.compare(password, user.password);
    if(!matchPassword) {
        return res.status(400).json({
            "message": "Incorrect password",
        })    
    }
    else {
        const token=jwt.sign({
            id: user._id.toString()
        }, JWT_USER_PASSWORD)
        res.json({
            token
        })
    }
})

userRouter.post("/purchases",(req,res)=> {  // to see the purchased courses
    res.json({
        "message": "Purchased courses",
    })
})

module.exports={  // Now we are not exporting any function anymore, now we are exporting a router
    userRouter:userRouter
}