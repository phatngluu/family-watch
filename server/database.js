require('dotenv').config()
const mongoose = require('mongoose')

const DB_CONNECTION_STRING = process.env.DB_CONNECTION_STRING
mongoose.connect(DB_CONNECTION_STRING, {useNewUrlParser: true, useUnifiedTopology: true})

const DBConnection = mongoose.connection

const fileSchema = new mongoose.Schema({
    customerID: String,
    male: Number,
    age: Number,
    currentSmoker: Number,
    diabetes: Number,
    totChol: Number,
    sysBP: Number,
    diaBP: Number,
    heartRate: Number,
    TenYearCHD: Number,
    StepPerDay: Number,
    SP02: Number,
    timestamp: {type: Date, default: Date.now}
});

const UserData = mongoose.model('UserData', fileSchema);

module.exports.UserData = UserData;
module.exports.DBConnection = DBConnection;