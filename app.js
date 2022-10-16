// Import node packages
const express = require("express");
const {MongoClient} = require('mongodb');

const bodyParser = require('body-parser');
const urlencodedParser = bodyParser.urlencoded({ extended: false }) // Will be used for POST requests to parse req bodies

const app = express();
app.use(bodyParser.urlencoded({extended: false}))
app.use(express.static('public')) // Allows use of static files with express, enabled css and client JS to function correctly

// Database initiation - ToDO: Static credentials need to be secured
const uri = `mongodb+srv://jcon93:ez0uqZfrQgWPPgV9@netdatastore.lgla4f8.mongodb.net/?retryWrites=true&w=majority`
const client = new MongoClient(uri);

async function connectToDatabase(){

    // Try Catch to initiate connection to DB
    try{
        await client.connect();
    }
    catch(e){
        console.log(e)
    } 
    /*
    finally {
        await client.close(); // Close DB connection
    }
*/

}

// GET organisations from documents within the organisations collection
app.get("/organisations", async (req, res) => {

    const orgDb = await client.db('final_project').collection('organisations').find({}).toArray()
    console.log(orgDb)

    res.send(orgDb);

})

// GET sites from documents within the sites collection, targets the documents org_id key
app.get("/organisations/:orgId", async (req, res) => {

    const parseData = req.params.orgId;

    const siteDb = await client.db('final_project').collection('sites').find({org_id: `${parseData}`}).toArray();

    console.log(siteDb)

    res.send(siteDb)

})

// GET networks from documents within the networks collection, targets the documents site_id key
app.get("/organisations/:orgId/:siteId", async (req, res) => {

    const parseOrg = req.params.orgId;
    const parseSite = req.params.siteId;

    const netDb = await client.db('final_project').collection('networks').find({site_id: `${parseSite}`}).toArray();

    console.log(netDb)

    res.send(netDb)

})

connectToDatabase().catch(console.error)

// Listen on port 8443, currently using HTML ToDO: secure with https
app.listen(8443, () => console.log("Server active"));