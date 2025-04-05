const {Router}=require("express");
const {adminModel}=require("../db");
const bcrypt = require("bcrypt");
const {z} = require("zod");
const jwt = require("jsonwebtoken");

const { adminMiddleware } = require("../middleware/admin");


const {JWT_ADMIN_PASSWORD}=require("../config");


// password in config.js
// const JWT_ADMIN_PASSWORD="123456789";  // why different from JWT_USER_PASSWORD?

const adminRouter=Router();

adminRouter.post("/signup", async (req,res)=> {  
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
        await adminModel.create({
            email,
            password: hashedPassword,
            firstName,
            lastName
        })
    }
    catch(err) {
        return res.status(400).json({
            message: "Admin already signedup", 
        });
    }

    res.json({
        "message": "Admin signed up successfully",
    })
})

adminRouter.post("/signin",async (req,res)=> {
    const {email, password}=req.body;
    const admin = await adminModel.findOne({   // difference between find and findOne
        email 
    });

    if(!admin) {
        return res.status(400).json({
            "message": "Invalid admin email",
        })
    }

    const matchPassword=await bcrypt.compare(password, admin.password);
    if(!matchPassword) {
        return res.status(400).json({
            "message": "Incorrect admin password",
        })    
    }
    else {
        const token=jwt.sign({
            id: admin._id.toString()
        }, JWT_ADMIN_PASSWORD)
        res.json({
            token
        })
    }
})


// Creating a course
adminRouter.post("/", adminMiddleware, async (req,res)=> {

    const adminId = req.userId;

    const { title, description, imageUrl, price } = req.body;

    const course = await courseModel.create({
        title,
        description,
        imageUrl,
        price,
        creatorId: adminId,
    });

    res.json({
        "message": "Course created",
        courseId: course._id
    })
})


// Updating a course
adminRouter.put("/", adminMiddleware, async (req,res)=> {
    const adminId = req.userId;

    const { courseId, title, description, imageUrl, price } = req.body;

    const course = await courseModel.findOne({
        _id: courseId, // Match the course by ID
        creatorId: adminId, // Ensure the admin is the creator
    });

    // If the course is not found, respond with an error message
    if (!course) {
        return res.status(404).json({
            message: "Course not found!", // Inform the client that the specified course does not exist
        });
    }


    await courseModel.updateOne(
        {
            _id: courseId, // Match the course by ID
            creatorId: adminId, // Ensure the admin is the creator
        },
        { 
            title: title || course.title, // Update title if provided, otherwise keep the existing title
            description: description || course.description, // Update description if provided, otherwise keep the existing description
            imageUrl: imageUrl || course.imageUrl, // Update imageUrl if provided, otherwise keep the existing imageUrl
            price: price || course.price, // Update price if provided, otherwise keep the existing price
         } 
    );

    res.json({
        "message": "Admin updated the course",
        courseId: course._id
    })
})


// Get all the courses
adminRouter.get("/bulk", async (req,res)=> {
    const adminId = req.userId;

    // Find all courses with the given creatorId
    const courses = await courseModel.find({
        creatorId: adminId,
    });

    // Respond with the courses if they are found successfully
    res.status(200).json({
        "message":"All courses",
        courses: courses,
    });
})

module.exports={
    adminRouter
}