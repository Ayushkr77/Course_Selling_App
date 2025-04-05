const {Router}=require("express");
const {adminModel}=require("../db");
const bcrypt = require("bcrypt");
const {z} = require("zod");
const jwt = require("jsonwebtoken");

const {JWT_ADMIN_PASSWORD}=require("../config");


// password in config.js
// const JWT_ADMIN_PASSWORD="123456789";  // why different from JWT_USER_PASSWORD?

const adminRouter=Router();

adminRouter.post("/signup",async (req,res)=> {  
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

adminRouter.post("/",(req,res)=> {
    res.json({
        "message": "Admin",
    })
})

adminRouter.put("/",(req,res)=> {
    res.json({
        "message": "Admin changed the course",
    })
})

adminRouter.get("/bulk",(req,res)=> {
    res.json({
        "message": "Admin courses",
    })
})

module.exports={
    adminRouter
}