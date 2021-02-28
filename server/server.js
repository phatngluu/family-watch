require('dotenv').config()
const express = require('express')
const { spawn } = require('child_process')
const WebSocket = require('ws')
const { DBConnection, UserData } = require('./database.js');

const app = express()
const port = 3000

const wss = new WebSocket.Server({ port: 8080 })
let tempDataMap = new Map();

/** API */
app.get('/', (req, res) => {
    console.log("Analysing...")
    
})


/** DB Connection */
DBConnection.on('error', console.error.bind(console, 'Database connection error:'))
DBConnection.once('open', () => {
    console.log('Database connected.')

    /** Websocket */
    wss.on('connection', ws => {
        ws.on('message', message => {
            console.log(`Received message => ${message}`)
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

    /** Every 2 minutes send data to datatbase */
    setInterval(() => {
        tempDataMap.forEach( async (element, key) => {
            console.log(element);
            const userDataModel = new UserData({
                customerID: element.customerID,
                male: 0,
                age: 27,
                currentSmoker: 0,
                diabetes: 0,
                totChol: 110,
                sysBP: 110,
                diaBP: 110,
                heartRate: element.heartRate,
                TenYearCHD: 110,
                StepPerDay: element.stepCount,
                SP02: 99.99,
                timestamp: element.timestamp,
            })
            await userDataModel.save(function (err) {
                if (err) throw new Error(`Database saving failed. File: ${file.name}`);
            });
        })
        if (tempDataMap.size > 0) {
            tempDataMap = new Map()
            console.log('User data sent.');
        }
    }, parseInt(process.env.DB_TIME_SEND))

    /** Start webserver */
    app.listen(port, () => {
        console.log("Web server is listening on port " + port);
    })
})
