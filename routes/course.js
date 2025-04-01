// All the routes that start with /course are handled here


// function createCourseRoutes(app) {
//     app.post("/course/purchase",(req,res)=> {  // to purchase endpoint
//         res.json({
//             "message": "Purchasing...",
//         })
//     })
    
//     app.post("/course/preview",(req,res)=> {  // see all courses endpoint
//         res.json({
//             "message": "User created successfully",
//         })
//     })
// }

// module.exports={
//     createCourseRoutes
// }







const { Router } = require("express");

const courseRouter = Router();

courseRouter.post("/purchase", (req, res) => {
    res.json({
        "message": "Purchasing...",
    });
});

courseRouter.get("/preview", (req, res) => {  
    res.json({
        "message": "Available courses",
    });
});

module.exports = { 
    courseRouter 
};
