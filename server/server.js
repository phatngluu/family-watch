require('dotenv').config()
const server = require('http').createServer()
const express = require('express')
const { spawn } = require('child_process')
const WSServer = require('ws').Server
const MongoClient = require('mongodb').MongoClient

const wss = new WSServer({ server: server })
const app = express()

const DB_CONNECTION_STRING = process.env.DB_CONNECTION_STRING
const PORT = process.env.PORT

/** Start database connection */
MongoClient.connect(DB_CONNECTION_STRING, function (err, db) {
    if (err) throw err;
    let tempDataMap = new Map();
    console.log("========= DATABASE CONNECTED =========")

    let dbInstance = db.db("familywatch");

    /** Http setup */
    app.get('/', (req, res) => {
        console.log("Analysing...")

        console.log("Merging user activity and health records...")
        dbInstance.collection('useractivity').aggregate([
            {
                $lookup: {
                    from: "userinfo",
                    localField: "customerID",    // field in the orders collection
                    foreignField: "customerID",  // field in the items collection
                    as: "tempField"
                }
            },
            {
                $replaceRoot: { newRoot: { $mergeObjects: [{ $arrayElemAt: ["$tempField", 0] }, "$$ROOT"] } }
            },
            { $project: { tempField: 0 } },
            { $out: { db: "familywatch", coll: "joined" } }
        ], (err, cursor) => {
            if (err) console.log(err)
        })

        // dbInstance.collection("useractivity").findOne({}, function (err, result) {
        //     if (err) throw err;
        //     console.log(result);
        //     res.json(result)
        // });
    })
    server.on('request', app)

    /** Websocket */
    wss.on('connection', ws => {
        ws.on('message', message => {
            let [customerID, stepCount, heartRate, timestamp] = message.split('/')
            stepCount = parseInt(stepCount)
            heartRate = parseInt(heartRate)
            timestamp = Date(Math.round(parseFloat(timestamp)))

            if (tempDataMap.has(customerID)) {
                let prevHeartRate = tempDataMap.get(customerID).heartRate
                heartRate = Math.round((heartRate + prevHeartRate) / 2)
            }
            tempDataMap.set(customerID, {
                customerID,
                stepCount,
                heartRate,
                timestamp
            })
        })
        ws.send('Connected to server!')
    })

    /** Start server */
    server.listen(PORT, function () {
        console.log("========= SERVER STARTED ON " + PORT + " =========")

        setInterval(() => {
            tempDataMap.forEach(async (element, key) => {
                const data = {
                    customerID: element.customerID,
                    heartRate: element.heartRate,
                    StepPerDay: element.stepCount,
                    timestamp: element.timestamp,
                }

                dbInstance.collection("useractivity").insertOne(data, function (err, res) {
                    if (err) throw err;
                })
            })
            if (tempDataMap.size > 0) {
                tempDataMap = new Map()
                console.log('========= USER ACTIVITIES SENT =========');
            }
        }, parseInt(process.env.DB_TIME_SEND))
    });
});



// /** DB Connection */
// DBConnection.on('error', console.error.bind(console, 'Database connection error:'))
// DBConnection.once('open', () => {
//     console.log('Database connected.')

//     /** Websocket */
//     wss.on('connection', ws => {
//         ws.on('message', message => {
//             console.log(`Received message => ${message}`)
//             let [customerID, stepCount, heartRate, timestamp] = message.split('/')
//             stepCount = parseInt(stepCount)
//             heartRate = parseInt(heartRate)
//             timestamp = Date(Math.round(parseFloat(timestamp)))

//             if (tempDataMap.has(customerID)) {
//                 let prevHeartRate = tempDataMap.get(customerID).heartRate
//                 heartRate = Math.round((heartRate + prevHeartRate) / 2)
//             }
//             tempDataMap.set(customerID, {
//                 customerID,
//                 stepCount,
//                 heartRate,
//                 timestamp
//             })
//         })
//         ws.send('Connected to server!')
//     })

//     /** Every 2 minutes send data to datatbase */
//     setInterval(() => {
//         tempDataMap.forEach(async (element, key) => {
//             console.log(element);
//             const userDataModel = new UserData({
//                 customerID: element.customerID,
//                 male: 0,
//                 age: 27,
//                 currentSmoker: 0,
//                 diabetes: 0,
//                 totChol: 110,
//                 sysBP: 110,
//                 diaBP: 110,
//                 heartRate: element.heartRate,
//                 TenYearCHD: 110,
//                 StepPerDay: element.stepCount,
//                 SP02: 99.99,
//                 timestamp: element.timestamp,
//             })
//             await userDataModel.save(function (err) {
//                 if (err) throw new Error(`Database saving failed. File: ${file.name}`);
//             });
//         })
//         if (tempDataMap.size > 0) {
//             tempDataMap = new Map()
//             console.log('User data sent.');
//         }
//     }, parseInt(process.env.DB_TIME_SEND))

//     /** Start webserver */
//     app.listen(port, () => {
//         console.log("Web server is listening on port " + port);
//     })
// })
