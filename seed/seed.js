const User = require('../models/userModels')
const expertiseModel = require('../models/expertiseModel')
const expertiseData = require('./expertise.json');
const userData = require('./user.json');



async function seed(req, res) {
    await User.deleteMany({})
    await expertiseModel.deleteMany({})
    seedExpertise()

    var eId = await getExpertiseIds()
    console.log(eId);

    var suData = userData.map(e => {
        e.expertise = []
        for (let i = 0; i < rNumb(1, 5); i++) {
            e.expertise.push(eId[rNumb(0, eId.length - 1)])
        }
        return e
    })



    await User.insertMany(suData)

    res.send('Seeded users!')
}



async function seedExpertise() {
    return await expertiseModel.insertMany(expertiseData);
}

async function getExpertiseIds() {
    const expertise = await expertiseModel.find({});
    return expertise.map(e => e._id.toString());
}

const rNumb = (min, max) => Math.round((Math.random() * (max - min)) + min);


module.exports = {
    seed
}
