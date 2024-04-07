const paymentModel = require('../models/paymentModel');
const ProposalModel = require('../models/proposalModels');
const Razorpay = require("razorpay")
const crypto = require('crypto');

const razorpayInstance = new Razorpay({

    // Replace with your key_id 
    key_id: "rzp_test_GFjWtFrV9orbTZ",

    // Replace with your key_secret 
    key_secret: "o46HMxP3jIjxadoddMDLsLgA"
});

async function createOrder(req, res) {
    // STEP 1: 
    const { payerId, receiverId, postId, proposalId, amount, status, message, rzp_txz } = req.body;
    var proposalData = await ProposalModel.findOne({ _id: req.body.proposalId });
    // STEP 2:	 
    razorpayInstance.orders.create({ payerId, receiverId, postId, amount: proposalData.bidAmount * 100, status, message, rzp_txz },
        async (err, order) => {

            //STEP 3 & 4: 
            if (!err) {

                var paymentDetails = await paymentModel.create({
                    payerId: req.payload._id,
                    receiverId: req.body.proposalId,
                    postId: proposalData.postId,
                    proposalId: req.body.proposalId,
                    amount: proposalData.bidAmount,
                    order_id: order.id
                })
                res.json(order)
            } else {
                res.json(err);
            }



        }
    )
}

async function verifyOrder(req, res) {
    // STEP 7: Receive Payment Data 
    const { order_id, payment_id, razorpay_signature } = req.body;

    console.log(order_id, payment_id, razorpay_signature);

    // Pass yours key_secret here 
    const key_secret = "o46HMxP3jIjxadoddMDLsLgA";

    // Creating hmac object 
    let hmac = crypto.createHmac('sha256', key_secret);

    // Passing the data to be hashed 
    hmac.update(order_id + "|" + payment_id);

    // Creating the hmac in the required format 
    const generated_signature = hmac.digest('hex');


    if (razorpay_signature === generated_signature) {
        var payment = await paymentModel.findOne({ order_id: order_id })
        payment.status = "completed"
        payment.save();
        console.log(payment);
        var proposalUpdate = await ProposalModel.updateOne({ _id: payment.proposalId }, { paymentStatus: true },{upsert:true})
        console.log(proposalUpdate);
        res.json({ success: true, message: "Payment has been verified" })
    }
    else
        res.json({ success: false, message: "Payment verification failed" })
}

module.exports = {
    createOrder,
    verifyOrder
}