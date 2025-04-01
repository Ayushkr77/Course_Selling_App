const express=require("express");
const app=express();

app.post("/user/signup",(req,res)=> {
    res.json({
        "message": "User created successfully",
    })
})

app.post("/user/signin",(req,res)=> {
    res.json({
        "message": "User signed in",
    })
})

app.post("/user/purchases",(req,res)=> {  // to see the purchased courses
    res.json({
        "message": "Purchased courses",
    })
})

app.post("/course/purchase",(req,res)=> {  // to purchase endpoint
    res.json({
        "message": "Purchasing...",
    })
})

app.post("/courses",(req,res)=> {  // see all courses endpoint
    res.json({
        "message": "User created successfully",
    })
})

app.listen(3000,()=> {
    console.log("Server is running on port 3000");
})