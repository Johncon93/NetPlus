// Import node packages
require('dotenv/config');
const express = require("express");
const {MongoClient} = require('mongodb');

const bodyParser = require('body-parser');
const urlencodedParser = bodyParser.urlencoded({ extended: false }) // Will be used for POST requests to parse req bodies

// Import Python.js script
const python = require('./python.js')

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
        await client.connect().then(dbConnection = true).finally(console.log(`Database connection has been established`))
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

/* 
 * Routes used for retrieving data from DB 
 */

// Get Organisations from Db and return as JSON - Used for displaying data in table
app.get("/organisations", async (req, res) => {

    await connectToDatabase().catch(console.error)

    if(dbConnection){

        try{

            const orgDb = await client.db('final_project').collection('organisations').find({}).toArray()
            console.log(orgDb)

            try{
            
                let rowData = []

                for(let i = 0; i < orgDb.length; i++){
                    rowData.push([orgDb[i]['org_id'], orgDb[i]['org_alias'], `<span class="material-symbols-outlined"><i class="material-icons":>check_circle</i></span>`])
                }

                const data = {
                    headers: ['Org Id', 'Org Alias', 'Status'],
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
        
            console.log(siteDb)
        
            //res.send(siteDb)
            res.render('organisations.ejs', {orgId: parseData})
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
        
            console.log(netDb)
        
            res.send(netDb)
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

    await closeDatabase().catch(console.error)
})

// Get Sites listed to an Org and return as JSON - Used for displaying data in table
app.get('/sites/:orgId', async (req, res) => {

    await connectToDatabase().catch(console.error)

    if(dbConnection){
        try{

            const parseData = req.params.orgId;
            const siteDb = await client.db('final_project').collection('sites').find({org_id: `${parseData}`}).toArray();

            try{
            
                let rowData = []

                for(let i = 0; i < siteDb.length; i++){
                    let address = `${siteDb[i]['site_address']['street']}, ${siteDb[i]['site_address']['town']}, ${siteDb[i]['site_address']['post_code']}`
                    rowData.push([siteDb[i]['site_id'], siteDb[i]['site_alias'], address, `<span class="material-symbols-outlined"><i class="material-icons":>check_circle</i></span>`])
                }

                const data = {
                    headers: ['Site Id', 'Site Alias', 'Location', 'Status'],
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
    
    await closeDatabase().catch(console.error)
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

            console.log(networkInfo)

            console.log(`Host IP is: ${networkInfo.host}`)

            const testCommand = 'show process cpu history'
            // Test function to prove GNS3 virtual devices accept commands
            let testResult = python.CallPython(testCommand, networkInfo.host).toString()

            res.render('result.ejs', {command: testCommand, result: testResult})
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
    
    await closeDatabase().catch(console.error)
})

// Listen on port 8443, currently using HTML ToDO: secure with https
app.listen(8443, () => console.log("Server active"));