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
const userMiddleware = require("../middleware/user");

// password in config.js
// const JWT_USER_PASSWORD="userSecret";


const userRouter=Router();

userRouter.post("/signup",async (req,res)=> {  // no need to write /user/signup
    // Why not destructure req.body before Zod validation? Because we don’t yet know if the data is valid.
    // const { email, password, firstName, lastName } = req.body;   
    

    // This defines a schema. Zod is now expecting an object that has exactly these fields. But it doesn’t use req.body directly — yet.
    const reqBody=z.object({  
        email: z.string().min(3).email(),
        password: z.string().min(3),
        firstName: z.string().min(3),
        lastName: z.string().min(3)
    }).strict();


    // Now Zod checks if req.body includes all these fields, and whether they follow the rules (e.g., email format, min lengths, etc).
    const result=reqBody.safeParse(req.body);   // Syntax: const result = schema.safeParse(data); schema: A Zod schema you define. data: The data you want to validate (e.g. req.body).

    // If validation succeeds: result.success === true result.data → the parsed and validated object
    // If validation fails: result.success === false result.error  → contains detailed validation errors



    if(!result.success) {
        return res.status(400).json({
            "message": "Invalid data",
            "errors": result.error
        })
    }


    // const { email, password, firstName, lastName } = req.body;   // Raw data directly from the client request. If you instead use req.body, you bypass validation, defeating the purpose of using Zod. But if there was wrong data(doesnt follow zod schema), then above only it should return. But it is not good practice.
    // Simple rule: If you’re using .safeParse(), then always use result.data. It’s cleaner, safer, and shows that you trust the validated output, not the raw input.

    const { email, password, firstName, lastName } = result.data;   // Data that has been validated and parsed using Zod. If the validation passes, result.data contains the sanitized, type-safe object.

    const hashedPassword=await bcrypt.hash(password, 5);  // 5 is the salt rounds (the higher, the more secure but slower). 5 is okay for dev/test environments — it's faster.

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
        email: z.string().email(), 
        password: z.string().min(6), 
    });

    // Parse and validate the incoming request body data
    const parseDataWithSuccess = requireBody.safeParse(req.body);

    if (!parseDataWithSuccess.success) {
        return res.json({
            message: "Incorrect data format",
            error: parseDataWithSuccess.error, 
        });
    }

    // const {email, password}=req.body;
    const { email, password } = parseDataWithSuccess.data;


    const user = await userModel.findOne({   // difference between find and findOne
        email 
    });

    if(!user) {
        return res.status(400).json({
            "message": "Invalid email",
        })
    }

    const matchPassword=await bcrypt.compare(password, user.password); // password: This is the plain text password the user just entered while signing in. user.password: This is the hashed password you earlier saved in the database during signup. 
    // bcrypt.compare(): i) Hashes the plain password using the same salt and algorithm. ii)Then checks if the newly hashed value matches the one from the DB.
    // Why Is This Secure? i)One-way hashing: You can’t reverse-engineer a hashed password. ii)Salting: Makes every hash unique, even if two users use same password. iii)Prevents brute-force attacks and rainbow table attacks
    
    

    if(!matchPassword) {
        return res.status(400).json({
            "message": "Incorrect password",
        })    
    }
    else {
        const token=jwt.sign({  // signing a token with the user’s ID and a secret key (JWT_USER_PASSWORD)          
            id: user._id.toString()
        }, JWT_USER_PASSWORD)
        res.json({
            token
        })
    }
})



// Little bit doubt in this endpoint
userRouter.get("/purchases", userMiddleware, async (req,res)=> {  // to see the purchased courses for a specific authenticated user
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
        const purchasesCourseIds = purchases.map((purchase) => purchase.courseId);  // array of course IDs that the user has purchased
    
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