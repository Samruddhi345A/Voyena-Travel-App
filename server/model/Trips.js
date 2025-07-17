const mongoose = require('mongoose')

const tripSchema =  new mongoose.Schema({
    
    tripDetail: {
        type: String,
        required: true,
    },
    imageUrls: {
        type: [String],
        required: true,
    },
    createdAt: {
        type: Date,
        required: true,
    },
    payment_link: {
        type: String,
        required: true,
    },
    userId: {
        type: String,
        required: true,
    }
})

module.exports = mongoose.model('Trip', tripSchema,'trips')