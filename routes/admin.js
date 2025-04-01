const [Router]=require("express");
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

adminRouter.post("/course",(req,res)=> {
    res.json({
        "message": "Admin",
    })
})

adminRouter.put("/course",(req,res)=> {
    res.json({
        "message": "Admin changed the course",
    })
})

adminRouter.get("/course/bulk",(req,res)=> {
    res.json({
        "message": "Admin courses",
    })
})

module.exports={
    adminRouter
}