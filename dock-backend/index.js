const express = require("express");
const app = express();
const fs = require("fs");
const cors = require("cors");
const port = 8080;
const filename = __dirname + "/profs.json";

// Read .env file and set environment variables
require('dotenv').config();
const random = Math.floor(Math.random() * 100);

// Use official mongodb driver to connect to the server
const { MongoClient, ObjectId } = require('mongodb');
const { Console } = require("console");

// New instance of MongoClient with connection string
// for Cosmos DB
const url = process.env.COSMOS_CONNECTION_STRING;
const client = new MongoClient(url);



//Middleware
app.use(express.json()); //for parsing application/json
app.use(cors()); //for configuring Cross-Origin Resource Sharing (CORS)
function log(req, res, next) {
    console.log(req.method + " Request at" + req.url);
    next();
}
app.use(log);




//Endpoints
app.get("/profs", function (req, res) {

    res.writeHead(200, { "Content-Type": "application/json", });
    data = getprofs();
    res.end(JSON.stringify(data));

});

async function getprofs() {
    await client.connect();
    const prof = {
        //category: "gear-surf-surfboards" 
    };

    const db = await client.db(`profdb`).collection('profs').find(prof).toArray();
    Console.log(JSON.stringify(db));
    return db;
}

app.get("/profs/:id", function (req, res) {

    res.writeHead(200, { "Content-Type": "application/json", });
    //maybe JSON.stringify nachher raus ??
    res.end(JSON.stringify(getprofbyid(req.params.id)));

});

async function getprofbyid(id) {
    await client.connect();
    let prof = {
        //category: "gear-surf-surfboards" 
    };
    prof.id = id;

    const db = await client.db(`profdb`).collection('profs').findOne(prof).toArray();
    Console.log(JSON.stringify(db));
    return db;

}

app.put("/profs/:id", function (req, res) {
    let a = {
        // c:    
    };
    a.id = req.params.id;
    a.name = req.body.name;
    a.rating = req.body.rating;
    res.writeHead(200, {
        "Content-Type": "application/json",
    });
    res.end(JSON.stringify(putprofbyid(a)));
});
//update prof
async function putprofbyid(prof) {
    await client.connect();
    let query = { name: prof.id };
    let update = { $set: prof.name, $set: prof.rating };
    let options = { upsert: true, new: true };
    const db = await client.db(`profdb`).collection('profs').updateOne(query, update, options); //not done
    Console.log(JSON.stringify(db));
    return getprofs();

}

app.delete("/profs/:id", function (req, res) {

    let dataAsObject = JSON.parse(data);

    res.writeHead(200, {
        "Content-Type": "application/json",
    })
    res.end(JSON.stringify(deletById(req.params.id)));


});

async function deletById(id) {
    await client.connect();
    let req = {}
    req.id = id
    const db = await client.db(`profdb`).collection('profs').deleteOne(req)
    Console.log(JSON.stringify(db));
    return getprofs();
}

app.post("/profs", function (req, res) {

    let prof = {}
    prof.id = new ObjectId(prof)
    prof.name = req.body.name;
    prof.rating= req.body.rating;


    res.writeHead(200, {
        "Content-Type": "application/json",
    });

    res.end(JSON.stringify(postProf(prof)));
});

async function postProf(prof) {
    await client.connect();
    let query = { name: prof.id };
    let update = { $set: prof.name, $set: prof.rating };
    let options = { upsert: true, new: true };
    const db = await client.db(`profdb`).collection('profs').updateOne(query, update, options); //not done
    Console.log(JSON.stringify(db));
    return getprofs();

}

app.listen(port, () => console.log(`Server listening on port ${port}!`));