const PostModel = require("../models/postModels");
const UserModel = require("../models/userModels");

async function employeeData(req, res) {

    try {
        const page = parseInt(req.query.page || 1);
        const limit = parseInt(req.query.limit || 3);

        // Calculate the start and end indexes for the requested page
        var skip = (page - 1) * limit;

        var user = await UserModel.find({ type: 'candidate' }).skip(skip).limit(limit)
        var count = await UserModel.countDocuments({ type: 'candidate' })

        var totalPages = Math.ceil(count / limit)

        res.json({
            data: user,
            totalPages: totalPages,
            currentPage: page,
            nextPage: page + 1 > totalPages ? false : page + 1,
            prevPage: page - 1 >= 1 ? page - 1 : false,
            message: "success",
            status: true
        })

    } catch (error) {
        res.json({
            status: false,
            message: error.message
        });
    }
}
// pagination


module.exports = {
    employeeData
}