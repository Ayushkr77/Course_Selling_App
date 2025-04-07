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

const {JWT_USER_PASSWORD}=require("../config");

// password in config.js
// const JWT_USER_PASSWORD="userSecret";


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

    // const { email, password, firstName, lastName } = req.body;   // Raw data directly from the client request. If you instead use req.body, you bypass validation, defeating the purpose of using Zod.
    const { email, password, firstName, lastName } = result.data;   // Data that has been validated and parsed using Zod. If the validation passes, result.data contains the sanitized, type-safe object.

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
    const requireBody = z.object({
        email: z.string().email(), // Email must be a valid email format
        password: z.string().min(6), // Password must be at least 6 characters long
    });

    // Parse and validate the incoming request body data
    const parseDataWithSuccess = requireBody.safeParse(req.body);

    // If validation fails, return a 400 error with the validation error details
    if (!parseDataWithSuccess.success) {
        return res.json({
            message: "Incorrect data format",
            error: parseDataWithSuccess.error, // Provide details about the validation error
        });
    }

    const {email, password}=req.body;
    const user = await userModel.findOne({   // difference between find and findOne
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



userRouter.get("/purchases", async (req,res)=> {  // to see the purchased courses
    // Get the userId from the request object set by the userMiddleware
    const userId = req.userId;

    // Find all purchase records associated with the authenticated userId
    const purchases = await purchaseModel.find({
        userId: userId, // Querying purchases by user ID
    });

    // If no purchases are found, return a 404 error response to the client
    if (!purchases) {
        return res.status(404).json({
            message: "No purchases found", // Error message for no purchases found
        });
    }

    // If purchases are found, extract the courseIds from the found purchases
    const purchasesCourseIds = purchases.map((purchase) => purchase.courseId);

    // Find all course details associated with the courseIds
    const coursesData = await courseModel.find({
        _id: { $in: purchasesCourseIds }, // Querying courses using the extracted course IDs
    });

    // Send the purchases and corresponding course details back to the client
    res.status(200).json({
        purchases, // Include purchase data in the response
        coursesData, // Include course details in the response
    });
})

module.exports={  // Now we are not exporting any function anymore, now we are exporting a router
    userRouter:userRouter
}