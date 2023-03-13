// Import node packages
require('dotenv/config');
const express = require("express");
const {MongoClient} = require('mongodb');

const bodyParser = require('body-parser');
const urlencodedParser = bodyParser.urlencoded({ extended: false }) // Will be used for POST requests to parse req bodies

// Import Python.js script
const python = require('./python.js');
const { response } = require('express');

const app = express();
app.use(bodyParser.urlencoded({extended: false}))
app.use(express.static('public')) // Allows use of static files with express, enabled css and client JS to function correctly
app.set('view-engine', 'ejs')

// Database initiation
const client = new MongoClient(process.env.MONGODB_PRIV_STRING);
let dbConnection = false;

// Connect to Database
async function connectToDatabase(){
    try{
        await client.connect().then(dbConnection = true)
        //await client.connect().then(dbConnection = true).finally(console.log(`Database connection has been established`))
    }
    catch(error){
        console.log(error)
    } 
}

// Close database
async function closeDatabase(){

    try{
        await client.close().then(console.log(`Database connection has been closed.`))
    }
    catch(error){
        console.log(error)
    }

    dbConnection = false;
}

// Route to pass data between server and client - Dynamic
app.get("/otp/:host", async (req,res) => {

    //const otpData = python.CallOTP(process.env.TACACS_PRIV_STRING) // Call function to launch Python child process and retrieve OTP info
    const otpData = python.CallOTP(process.env.TACACS_PRIV_STRING2)
    const parseOTP = otpData.split('@'); //Split response so that [0] = otp and [1] = time remaining on otp
    const host = req.params.host;

    let data = {}

    // Check if TACACS+ server is down
    if(parseOTP[0] == 'false'){// Server Down, retrieve and send backup data
        data = {
            link:`ssh://admin:admin@${host}`,
            time: '60'
        }
    }
    else{ // Server is Up, retrieve and send TACACs data
        data = {
            link: `ssh://johnc:${parseOTP[0]}@${host}`,
            time: parseOTP[1]
        }
    }

    console.log(data)
    
    const secret = process.env.SECRET_KEY
    res.json(data) // Send otp info as JSON
})

// Route to pass data between server and client
app.get("/otp", async (req,res) => {

    //const otpData = python.CallOTP(process.env.TACACS_PRIV_STRING) // Call function to launch Python child process and retrieve OTP info
    const otpData = python.CallOTP(process.env.TACACS_PRIV_STRING2) // Call function to launch Python child process and retrieve OTP info
    const parseOTP = otpData.split('@'); //Split response so that [0] = otp and [1] = time remaining on otp

    let data = {}

    // Check if TACACS+ server is down
    if(parseOTP[0] == 'false'){// Server Down, retrieve and send backup data
        data = {
            link:'ssh://admin:admin@192.168.177.5',
            time: '30'
        }
    }
    else{ // Server is Up, retrieve and send TACACs data
        data = {
            link: `ssh://johnc:${parseOTP[0]}@192.168.177.5`,
            time: parseOTP[1]
        }
    }

    const secret = process.env.SECRET_KEY

    console.log(data)
    res.json(data) // Send otp info as JSON
})

/* 
 * Routes used for retrieving data from DB 
 */

// Get Organisations from Db and return as JSON - Used for displaying data in table
app.get("/organisations", async (req, res) => {

    await connectToDatabase().catch(console.error)

    if(dbConnection){

        try{

            const orgDb = await client.db('final_project').collection('organisations').find({}).toArray()
            const siteDb = await client.db('final_project').collection('sites').find().toArray()
            const netDb = await client.db('final_project').collection('networks').find().toArray()

            try{
            
                let rowData = []

                for(let i = 0; i < orgDb.length; i++){

                    let orgInfo = [0, 0]
                    let siteInfo = [0, 0, 0]

                    for(var y = 0; y < siteDb.length; y++){
    
                        if(siteDb[y]['org_id'] == orgDb[i]['org_id']){
                            orgInfo[0] += 1

                            for(var z = 0; z < netDb.length; z++){
                                if(siteDb[y]['site_id'] == netDb[z]['site_id'] && netDb[z]['status']){
                                    siteInfo[0] += 1
                                }
                                else if(siteDb[y]['site_id'] == netDb[z]['site_id'] && netDb[z]['status'] != true){
                                    siteInfo[1] += 1
                                }
                            }
                        }
                    }

                    /*
                    if(orgInfo[0] != 1){
                        orgInfo[1] = `${orgInfo[0]} x sites`
                    }
                    else{
                        orgInfo[1] = `${orgInfo[0]} x site`
                    }
                    */

                    siteInfo[2] = `${siteInfo[0]} x <i class="material-icons inline-icon ok-icon" id="deviceHealth">check_circle</i> ${siteInfo[1]} x <i class="material-icons inline-icon bad-icon" id="deviceHealth">cancel</i>`

                    rowData.push([orgDb[i]['org_id'], orgDb[i]['org_alias'], `${orgInfo[0]}`, `${siteInfo[2]}`])
                }

                const data = {
                    headers: ['Org Id', 'Org Alias', 'Number of sites', 'Network Status'],
                    rows: rowData
                }
                res.json(data)
            }
            catch(error){
                console.log(`Failed to extract database info, error message \n ${error}`)
            }

        }
        catch(error){
            // Request has failed
            res.send(`Request has failed, error message \n${error}`)
        }
    }
    else{
        // Database connection not established
        res.send("Error! Database connection not initiated")
    }
    
})

// GET sites from documents within the sites collection, targets the documents org_id key
app.get("/organisations/:orgId", async (req, res) => {

    await connectToDatabase().catch(console.error)
    
    if(dbConnection){

        try{
            const parseData = req.params.orgId;

            const siteDb = await client.db('final_project').collection('sites').find({org_id: `${parseData}`}).toArray();

            res.render('sites.ejs', {orgId: parseData})
        }
        catch(error){
            // Request has failed
            res.send(`Request has failed, error message \n${error}`)
        }
    }
    else{
        // Database connection not established
        res.send("Error! Database connection not initiated")
    }

})

// GET networks from documents within the networks collection, targets the documents site_id key
app.get("/organisations/:orgId/:siteId", async (req, res) => {

    await connectToDatabase().catch(console.error)

    if(dbConnection){

        try{
            const parseOrg = req.params.orgId;
            const parseSite = req.params.siteId;

            const netDb = await client.db('final_project').collection('networks').find({site_id: `${parseSite}`}).toArray();

            res.render('networks.ejs', {orgId: parseOrg, siteId: parseSite})
        }
        catch(error){
            // Request has failed
            res.send(`Request has failed, error message \n${error}`)
        }
    }
    else{
        // Database connection not established
        res.send("Error! Database connection not initiated")
    }

})

// Get Sites listed to an Org and return as JSON - Used for displaying data in table
app.get('/sites/:orgId', async (req, res) => {

    await connectToDatabase().catch(console.error)

    if(dbConnection){
        try{

            const parseData = req.params.orgId;
            const siteDb = await client.db('final_project').collection('sites').find({org_id: `${parseData}`}).toArray();
            const netDb = await client.db('final_project').collection('networks').find().toArray()

            try{
            
                let rowData = []

                for(let i = 0; i < siteDb.length; i++){

                    let siteInfo = [0,0,0]

                    let address = `${siteDb[i]['site_address']['street']}, ${siteDb[i]['site_address']['town']}, ${siteDb[i]['site_address']['post_code']}`
        
                    for(var z = 0; z < netDb.length; z++){
                        if(siteDb[i]['site_id'] == netDb[z]['site_id'] && netDb[z]['status']){
                            siteInfo[0] += 1
                        }
                        else if(siteDb[i]['site_id'] == netDb[z]['site_id'] && netDb[z]['status'] != true){
                            siteInfo[1] += 1
                        }
                    }

                    siteInfo[2] = `${siteInfo[0]} x <i class="material-icons inline-icon ok-icon" id="deviceHealth">check_circle</i> ${siteInfo[1]} x <i class="material-icons inline-icon bad-icon" id="deviceHealth">cancel</i>`

                    rowData.push([siteDb[i]['site_id'], siteDb[i]['site_alias'], address, siteInfo[2]])
                }

                const data = {
                    headers: ['Site Id', 'Site Alias', 'Location', 'Network Status'],
                    rows: rowData
                }
                res.json(data)
            }
            catch(error){
                console.log(`Failed to extract database info, error message \n ${error}`)
            }
        }
        catch(error){
            // Request has failed
            res.send(`Request has failed, error message \n${error}`)
        }
    }
    else{
        // Database connection not established
        res.send("Error! Database connection not initiated")
    }
    
    //await closeDatabase().catch(console.error)
})

// Get Networks listed to a site and return as JSON - Used for displaying data in table
app.get('/networks/:orgId/:siteId', async (req, res) => {

    await connectToDatabase().catch(console.error)

    if(dbConnection){
        try{

            const parseSite = req.params.siteId;
            const netDb = await client.db('final_project').collection('networks').find({site_id: `${parseSite}`}).toArray();

            try{

                let rowData = []

                for(let i = 0; i < netDb.length; i++){

                    let status = ''
                    if(netDb[i]['status'] == true){ // Check if device was last seen alive or dead then adjust icon accordingly.
                        status = `<span id="ok-icon" class="material-symbols-outlined"><i class="material-icons":>check_circle</i></span>`
                    }
                    else{
                        status = `<span id="bad-icon" class="material-symbols-outlined"><i class="material-icons":>cancel</i></span>`
                    }

                    rowData.push([netDb[i]['network_id'], netDb[i]['alias_name'], netDb[i]['host'], netDb[i]['network_type'], status])
                }

                const data = {
                    headers: ['Network Id', 'Network Alias', 'Host IP', 'Network type', 'Status'],
                    rows: rowData
                }
                res.json(data)
            }
            catch(error){
                console.log(`Failed to extract database info, error message \n ${error}`)
            }
        }
        catch(error){
            // Request has failed
            res.send(`Request has failed, error message \n${error}`)
        }
    }
    else{
        // Database connection not established
        res.send("Error! Database connection not initiated")
    }
    
    //await closeDatabase().catch(console.error)
})

app.get("/device/:netId/:cmd", async (req, res) => {

    await connectToDatabase().catch(console.error)

    if(dbConnection){

        try{
            const parseNet = req.params.netId;
            const parseCmd = req.params.cmd;
        
            // Uses findOne as network_id should be unique
            const networkInfo = await client.db('final_project').collection('networks').findOne({network_id: `${parseNet}`});

            let cmdResult = ''

            switch(parseCmd){

                case 'runconfig':
                    cmdResult = python.CallDevice('show run', networkInfo.host).toString()
                    break
                case 'iproute':
                    cmdResult = python.CallDevice('show ip route', networkInfo.host).toString()
                    break
                case 'env':
                    cmdResult = python.CallDevice('show enviro all', networkInfo.host).toString()
                    break
                default:
                    cmdResult = ''
            }

            res.send(cmdResult)
        }
        catch(error){
            // Request has failed
            res.send(`Request has failed, error message \n${error}`)
        }
    }
    else{
        // Database connection not established
        res.send("Error! Database connection not initiated")
    }

})

// Test route to launch Python commands
app.get("/organisations/:orgId/:siteId/:netId", async (req, res) => {
  
    await connectToDatabase().catch(console.error)

    if(dbConnection){

        try{
            const parseOrg = req.params.orgId;
            const parseSite = req.params.siteId;
            const parseNet = req.params.netId;
        
            // Uses findOne as network_id should be unique
            const networkInfo = await client.db('final_project').collection('networks').findOne({network_id: `${parseNet}`});

            const testCommand = 'show process cpu history'

            // Test function to prove GNS3 virtual devices accept commands
            let cmdResult = python.CallDevice(testCommand, networkInfo.host).toString()

            res.render('result.ejs', {command: testCommand, result: cmdResult, orgId: parseOrg, siteId: parseSite, netId: parseNet})
        }
        catch(error){
            // Request has failed
            res.send(`Request has failed, error message \n${error}`)
        }
    }
    else{
        // Database connection not established
        res.send("Error! Database connection not initiated")
    }
    
})

app.get("/device/:orgId/:siteId/:netId", async (req, res) => {

    await connectToDatabase().catch(console.error)

    if(dbConnection){

        try{
            const parseOrg = req.params.orgId;
            const parseSite = req.params.siteId;
            const parseNet = req.params.netId;
        
            // Uses findOne as network_id should be unique
            const networkInfo = await client.db('final_project').collection('networks').findOne({network_id: `${parseNet}`});
            const siteInfo = await client.db('final_project').collection('sites').findOne({site_id: `${parseSite}`});

            let addrString = ''
            let keyArray = Object.keys(siteInfo.site_address)

            for(key in keyArray){
                
                let part = keyArray[key]
                addrString += `${siteInfo.site_address[part]}, `

            }
            addrString = addrString.slice(0,-2)

            let deviceIcon = ''

            if(networkInfo.network_type == 'WAN'){
                deviceIcon = '/img/router.jpg'
            }
            else if(networkInfo.network_type == 'LAN') {
                deviceIcon = '/img/layer-3-switch.jpg'
            }
            else{
                deviceIcon = '/img/workgroup-switch.jpg'
            }

            let status = ''

            if(networkInfo.status){

                status = `check_circle`
            }
            else{
                status = `cancel`
            }

            res.render('device.ejs', {
            siteAddress: addrString,
            orgId: parseOrg, 
            siteId: parseSite, 
            netId: parseNet, 
            network_type: networkInfo.network_type,
            img: deviceIcon,
            alias_name: networkInfo.alias_name,
            host: networkInfo.host,
            protocol: networkInfo.protocol,
            status: status,
            device_type: networkInfo.device_type})
        }
        catch(error){
            // Request has failed
            res.send(`Request has failed, error message \n${error}`)
        }
    }
    else{
        // Database connection not established
        res.send("Error! Database connection not initiated")
    }
    
    //await closeDatabase().catch(console.error)
})

app.get('/alerts', async (req, res) =>{

    await connectToDatabase().catch(console.error)

    if(dbConnection){

        try{

            const alertInfo = await client.db('final_project').collection('alerts').find().toArray();

            try{
            
                let rowData = []

                for(let i = 0; i < alertInfo.length; i++){

                    rowData.push([alertInfo[i]['time'], alertInfo[i]['host'], alertInfo[i]['message']])
                }
                //rowData = rowData.reverse()
                const data = {
                    headers: ['Time', 'Host', 'Message'],
                    rows: rowData
                }
                res.json(data)
            }
            catch(error){
                console.log(`Failed to extract database info, error message \n ${error}`)
            }

        }
        catch(error){
            res.send(`Request has failed, error message \n${error}`)
        }
    }
    else{
        res.send('Error! Database connection not initiated.')
    }

})

app.get('/alerts/:host', async (req, res) =>{

    await connectToDatabase().catch(console.error)

    const host = req.params.host
    
    if(dbConnection){

        try{
            const alertInfo = await client.db('final_project').collection('alerts').find().toArray();

            let rowData = []

            for(let i = 0; i < alertInfo.length; i++){

                if(alertInfo[i]['host'].toString().includes(host.toString())){
                    rowData.push([alertInfo[i]['time'], alertInfo[i]['host'], alertInfo[i]['message']])
                }
            }

            const data = {
                headers: ['Time', 'Host', 'Message'],
                rows: rowData
            }
            res.json(data)

        }
        catch(error){
    
            res.send(`Request has failed, error message \n${error}`)
        }
    }
    else{
        res.send('Error! Database connection not initiated.')
    }

})

app.post('/alerts', async (req, res) => {

    console.log(req.body.host)
    console.log(req.body.message)
    
})

app.get('/uplinks/:host', async (req, res) =>{

    try{
        const host = req.params.host;

        let uplinkHealth = python.UplinkHealth(host)
        let timeStamp = new Date().toISOString()

        const returnObj = {
            [timeStamp]: uplinkHealth
        }

        res.json(returnObj)

    }
    catch(error){
        res.send(`Request has failed, error message \n${error}`)
    }

})


function InitiateHealthCheck(){

    let result = python.InitHealth()

    return result;
}


function InitiateControllers(){

}

function InitiateSYSLOG(){

    let result = python.InitSYSLOG()

    return result;
}

function InitiateBGP(){

    let result = python.InitBGP()

    return result;
}

// Initiate BGP using AS 100 and advertise 2x test routes
let bgpInit = InitiateBGP()
console.log(`BGP Status: ${bgpInit[0]}\n${bgpInit[1]}`)
 
let sysInit = InitiateSYSLOG()
console.log(`SYSLOG Status: ${sysInit[0]}\n${sysInit[1]}`)

let healthInit = InitiateHealthCheck()
console.log(`SYSLOG Status: ${healthInit[0]}\n${healthInit[1]}`)

// Listen on port 8443, currently using HTML ToDO: secure with https
app.listen(8443, () => console.log("Server active"));