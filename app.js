// Import node packages
const express = require("express");
const {MongoClient} = require('mongodb');

const bodyParser = require('body-parser');
const urlencodedParser = bodyParser.urlencoded({ extended: false }) // Will be used for POST requests to parse req bodies

// Import Python script
const python = require('./python')

const app = express();
app.use(bodyParser.urlencoded({extended: false}))
app.use(express.static('public')) // Allows use of static files with express, enabled css and client JS to function correctly

// Database initiation - ToDO: Static credentials need to be updated and secured in an env file
const uri = `mongodb+srv://jcon93:ez0uqZfrQgWPPgV9@netdatastore.lgla4f8.mongodb.net/?retryWrites=true&w=majority`
const client = new MongoClient(uri);

let dbConnection = false;

// Connect to Database
async function connectToDatabase(){

    try{
        await client.connect().then(dbConnection = true).finally(console.log(`Database connection has been established`))
    }
    catch(e){
        console.log(e)
    } 

}

// Close database
async function closeDatabase(){

    try{
        await client.close().then(console.log(`Database connection has been closed.`))
    }
    catch(e){
        console.log(e)
    }

    dbConnection = false;
}

/* 
 * Routes used for retrieving data from DB 
 */

// GET organisations from documents within the organisations collection
app.get("/organisations", async (req, res) => {

    await connectToDatabase().catch(console.error)

    if(dbConnection){

        try{

            const orgDb = await client.db('final_project').collection('organisations').find({}).toArray()
            console.log(orgDb)
            res.send(orgDb);

        }
        catch(e){
            // Request has failed
            res.send(`Request has failed, error message \n${e}`)
        }
    }
    else{
        // Database connection not established
        res.send("Error! Database connection not initiated")
    }

    await closeDatabase().catch(console.error)
    
})

// GET sites from documents within the sites collection, targets the documents org_id key
app.get("/organisations/:orgId", async (req, res) => {

    await connectToDatabase().catch(console.error)
    
    if(dbConnection){

        try{
            const parseData = req.params.orgId;

            const siteDb = await client.db('final_project').collection('sites').find({org_id: `${parseData}`}).toArray();
        
            console.log(siteDb)
        
            res.send(siteDb)
        }
        catch(e){
            // Request has failed
            res.send(`Request has failed, error message \n${e}`)
        }
    }
    else{
        // Database connection not established
        res.send("Error! Database connection not initiated")
    }

    await closeDatabase().catch(console.error)

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
        catch(e){
            // Request has failed
            res.send(`Request has failed, error message \n${e}`)
        }
    }
    else{
        // Database connection not established
        res.send("Error! Database connection not initiated")

    }

    await closeDatabase().catch(console.error)
})

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

            // Test function to prove GNS3 virtual devices accept commands
            let testCommand = python.CallPython("show run", networkInfo.host)

            res.send(testCommand)
        }
        catch(e){
            // Request has failed
            res.send(`Request has failed, error message \n${e}`)
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