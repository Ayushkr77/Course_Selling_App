const {Router}=require("express");
const {adminModel}=require("../db");

const adminRouter=Router();

adminRouter.post("/signup",(req,res)=> {  
    res.json({
        "message": "Admin created successfully",
    })
})

adminRouter.post("/signin",(req,res)=> {
    res.json({
        "message": "Admin signed in",
    })
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