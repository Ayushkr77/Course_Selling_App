const express=require("express");
const mongoose = require("mongoose");
const dotenv=require("dotenv");

// const {userRouter}=require("./routes/user");
const {userRouter}=require("./routes/user")

// const {createCourseRoutes}=require("./routes/course");
const {courseRouter}=require("./routes/course")

const {adminRouter}=require("./routes/admin");



dotenv.config();

const app=express();


app.use(express.json());




// app.post("/user/signup",(req,res)=> {
//     res.json({
//         "message": "User created successfully",
//     })
// })

// app.post("/user/signin",(req,res)=> {
//     res.json({
//         "message": "User signed in",
//     })
// })

// app.post("/user/purchases",(req,res)=> {  // to see the purchased courses
//     res.json({
//         "message": "Purchased courses",
//     })
// })



// Now instead of above code(the commented lines), we'll just write

// createUserRoutes(app);   // this line under the hood does the same thing(that is the above commented code)
// OR
app.use("/user",userRouter);







// app.post("/course/purchase",(req,res)=> {  // to purchase endpoint
//     res.json({
//         "message": "Purchasing...",
//     })
// })

// app.post("/course/preview",(req,res)=> {  // see all courses endpoint
//     res.json({
//         "message": "User created successfully",
//     })
// })



app.use(adminRouter);  // added admin router


// createCourseRoutes(app);
// OR
app.use("/course",courseRouter);





async function main() {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to the database");

    app.listen(process.env.PORT  || 3000, () => {
        console.log("Server is listening on port 3000");
    });
}

main();