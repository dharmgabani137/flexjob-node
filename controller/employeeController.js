const UserModel = require("../models/userModels");

async function employeeData(req,res) {

    const pageNumber = req.query.page || 1; // Get the current page number from the query parameters
    const limit = req.query.limit || 5;
     // Number of items per page


    UserModel.paginate({type : 'employee'}, { page: pageNumber, limit: limit }, (err, result) => {
        if (err) {
            return res.status(500).json({ message: 'Error occurred while fetching users.' });
        }   

        const { docs, total, limit, page, pages } = result;
        res.json({ users: docs, total, limit, page, pages });
    });


    // res.json({
    //     data : user,
    //     message : "record fetched"
    // })
    
}

module.exports = {
    employeeData
}