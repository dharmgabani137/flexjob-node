const UserModel = require("../models/userModels");
async function employerData(req, res) {

    // pagination
    const page = parseInt(req.query.page || 1);
    const limit = parseInt(req.query.limit || 3);
    // Number of items per page
    var skip = (page - 1) * limit;


    const user = await UserModel.find({ type: 'employer' }).skip(skip).limit(limit);
    const total = await UserModel.countDocuments({ type: 'employer' });
    var totalPages = Math.ceil(total / limit)

    res.json({
        users: user,
        totalPages: totalPages,
        currentPage: page,
        nextPage: page + 1 > totalPages ? false : page + 1,
        prevPage: page - 1 >= 1 ? page - 1 : false,
        message: "success"
    });

}

module.exports = {
    employerData
}