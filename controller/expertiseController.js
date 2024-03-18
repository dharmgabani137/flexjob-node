const expertiseModel = require('../models/expertiseModel');

// Define the array
var array = [{ technology: "JavaScript" },{ technology: "Python" },{ technology: "Java" },{ technology: "C" },{ technology: "C++" },{ technology: "C#" },{ technology: "Swift" },{ technology: "Ruby" },{ technology: "PHP" },{ technology: "Go" },{ technology: "Rust" },{ technology: "TypeScript" },{ technology: "Kotlin" },{ technology: "Perl" },{ technology: "Scala" },{ technology: "HTML" },{ technology: "CSS" },{ technology: "SQL" },{ technology: "Assembly" },{ technology: "R" },{ technology: "Lua" },{ technology: "Haskell" },{ technology: "Objective-C" },{ technology: "Dart" },{ technology: "MATLAB" }];

async function seedData(req, res) {
    try {
        var data = req.body;
        var technologies = array.map(item => item.technology);
    
        var user = await expertiseModel.create(array);
        res.json({
            status : true,
            data : user,
            message : "data inserted"
        })
    } catch (error) {
        res.status(500).json({
            status: false,
            message: error.message
        });
    }
     
}

async function expertiseData(req,res) {
    var user = await expertiseModel.find({});   
    res.json({
        data : user,
        status : true,
        message : "data fetch successfully"
    })
}



module.exports = {
    seedData,
    expertiseData

}
