// Import node packages
require('dotenv/config');
const express = require("express");
const {MongoClient} = require('mongodb');

const bodyParser = require('body-parser');
const urlencodedParser = bodyParser.urlencoded({ extended: false }) // Will be used for POST requests to parse req bodies

// Import Python.js script
const components = require('./components.js');
const { response } = require('express');

// Import the Firebase modules
const firebase_initializeApp = require("firebase/app")
const firebase_auth = require("firebase/auth")

const app = express();
app.use(bodyParser.urlencoded({extended: false}))
app.use(express.static('public')) // Allows use of static files with express and enables css / client JS to function correctly
app.set('view-engine', 'ejs')


/*
    -----------------------------------
    DATABASE CONNECTION CONFIG
    -----------------------------------
*/

const client = new MongoClient(process.env.MONGODB_PRIV_STRING);
let dbConnection = false;

// Connect to Database
async function connectToDatabase(){
    try{
        await client.connect().then(dbConnection = true)
    }
    catch(error){
        console.log(error)
    } 
}

/*
    -----------------------------------
    UPLINK ROUTES
    -----------------------------------
*/

app.get('/uplinks/:host', async (req, res) =>{

    try{
        const host = req.params.host;

        let uplinkHealth = components.UplinkHealth(host)
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

app.get("/history/:netId", async (req, res) => {

    const netId = req.params.netId

    await connectToDatabase().catch(console.error)
    if(dbConnection){
        try{
            const netDb = await client.db('final_project').collection('networks').findOne({network_id: `${netId}`})

            res.json(netDb['health'])
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

/*
    -----------------------------------
    DATATABLE ROUTES
    -----------------------------------
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
})

/*
    -----------------------------------
    RENDER VIEW ROUTES
    -----------------------------------
*/

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
            switch(networkInfo.network_type){
                case 'WAN':
                    if(networkInfo.alias_name.includes('SW')){
                        deviceIcon = '/img/layer-3-switch.jpg'
                    }
                    else{
                        deviceIcon = '/img/router.jpg'
                    }
                    break
                case 'LAN':
                    deviceIcon = '/img/workgroup-switch.jpg'
                    break
            }

            let status = 'check_circle'
            if(!networkInfo.status){

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
                device_type: networkInfo.device_type
            })
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

/*
    -----------------------------------
    COMMAND ROUTES
    -----------------------------------
*/

// GET result of executing stored procedure.
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
                    cmdResult = components.CallDevice('show run', networkInfo.host).toString()
                    break
                case 'iproute':
                    cmdResult = components.CallDevice('show ip route', networkInfo.host).toString()
                    break
                case 'env':
                    cmdResult = components.CallDevice('show enviro all', networkInfo.host).toString()
                    break
                default:
                    cmdResult = ''
            }

            res.json(cmdResult)
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

// GET SSH Link
app.get("/otp/:host", async (req,res) => {

    // Call function to launch Python child process and retrieve OTP info
    const otpData = components.CallOTP(process.env.TACACS_PRIV_STRING2)

     //Split response so that [0] = otp and [1] = time remaining on otp
    const parseOTP = otpData.split('@');

    // Retrieve passed IP address.
    const host = req.params.host;

    let data = {}

    // Check if TACACS+ server is down
    if(parseOTP[0] == 'false'){// Server Down, send backup login details.
        data = {
            link:`ssh://${process.env.BACKUP_USERNAME}:${process.env.BACKUP_PASSWORD}@${host}`,
            time: '60'
        }
    }
    else{ // Server is Up, retrieve and send TACACs data
        data = {
            link: `ssh://johnc:${parseOTP[0]}@${host}`,
            time: parseOTP[1]
        }
    }

    res.json(data) // Send otp info as JSON
})

/*
    -----------------------------------
    ALERT ROUTES
    -----------------------------------
*/

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

    const host = req.params.host

    await connectToDatabase().catch(console.error)
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

/*
    -----------------------------------
    FIREBASE CONFIG *** WIP ***
    -----------------------------------
*/
function login(email, password){
    return null
}

try{
    const firebaseConfig = {

        apiKey: process.env.API_KEY,
        authDomain: process.env.AUTH_DOMAIN,
        projectId: process.env.PROJECT_ID,
        storageBucket: process.env.STORAGE_BUCKET,
        messagingSenderId: process.env.MESSAGING_SENDER_ID,
        appId: process.env.APP_ID,
        measurementId: process.env.MEASUREMENT_ID
    };

        // Initialize Firebase
        firebase_initializeApp.initializeApp(firebaseConfig);

        // Test Credentials
        let email = process.env.FIREBASE_TEST_EMAIL
        let password = process.env.FIREBASE_TEST_PASSWORD
        
        // Test login code
        const auth = firebase_auth.getAuth();
        firebase_auth.signInWithEmailAndPassword(auth, email, password)
            .then((userCredential) => {
                // Signed in 
                const user = userCredential.user;
            })
            .catch((error) => {
                console.log(`Error ${error.code}/n${error.message}`)
        });
}
catch(error){

    console.log(`Error, failed to load firebase SDK.\n${error}`)
}

/*
    -----------------------------------
    APP Start config
    -----------------------------------
*/

// Function to initial Software-based controllers upon application launch.
function InitiateControllers(){

    let controllers = [['BGP'],['SYSLOG'],['ICMP']]
    for(var x = 0; x < controllers.length; x++){

        let result = ''
        switch(controllers[x][0]){
            case 'BGP':
                result = components.InitBGP()
                controllers[x] = ['BGP Status:', result[0], result[1]]
                break;
            case 'SYSLOG':
                result = components.InitSYSLOG()
                controllers[x] = ['SYSLOG Status:', result[0], result[1]]
                break;
            case 'ICMP':
                result = components.InitHealth()
                controllers[x] = ['ICMP Status:', result[0], result[1]]
                break;
            default:
                break;
        }
    }
    return(controllers)
}

console.log(InitiateControllers())

// Listen on port 8443
app.listen(8443, () => console.log("Server active"));