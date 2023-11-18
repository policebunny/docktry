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
app.get("/profs", async function (req, res) {

    res.writeHead(200, { "Content-Type": "application/json", });
    data = await getprofs();
    console.log(data);
    res.end(JSON.stringify(data));

});

async function getprofs() {
    await client.connect();
    const prof = {
        //category: "gear-surf-surfboards" 
    };

    const db = await client.db(`profdb`).collection('profs').find(prof).toArray();
    console.log(JSON.stringify(db));
    return db;
}

app.get("/profs/:id",async function (req, res) {

    res.writeHead(200, { "Content-Type": "application/json", });
    //maybe JSON.stringify nachher raus ??
    res.end(JSON.stringify(await getprofbyid(req.params.id)));

});

async function getprofbyid(id) {
    await client.connect();
    let prof = {
        //category: "gear-surf-surfboards" 
    };
    prof.id = id;

    const db = await client.db(`profdb`).collection('profs').findOne(prof).toArray();
    console.log(JSON.stringify(db));
    return db;

}

app.put("/profs/:id",async function (req, res) {
    console.log("hier in put vorlage");
    let a = {
        // c:    
    };
    a.id = req.body.id;           //hier böse ?
    a.name = req.body.name;
    a.rating = req.body.rating;
    res.writeHead(200, {
        "Content-Type": "application/json",
    });
    res.end(JSON.stringify(await putprofbyid(a)));
});
//update prof

async function putprofbyid(prof) {
    console.log("hier in async putprofbyid");
    await client.connect();
    let query = { id: parseInt(prof.id) };
    let update = { $set: {name: prof.name}, $set: {rating: prof.rating} };
    let options = { upsert: false, new: false };
    const db = await client.db(`profdb`).collection('profs').updateOne(query, update, options); //not done
    console.log(JSON.stringify(db));
    return await getprofs();

}

app.delete("/profs/:id",async function (req, res) {

    res.writeHead(200, {
        "Content-Type": "application/json",
    })
    console.log(req.params.id);
    res.end(JSON.stringify(await deletById(req.params.id)));


});

async function deletById(id) {
    await client.connect();
    let req = {}
    req.id = id;
    console.log(id);
    // { "_id" : ObjectId("563237a41a4d68582c2509da") }
    //const bd = await client.db(`profdb`).collection('profs').findOne({id: parseInt(id)});
    const db = await client.db(`profdb`).collection('profs').deleteMany({ id: parseInt(req.id) });


    console.log(id);
    console.log(JSON.stringify(db));
    return await getprofs();
}

app.post("/profs",async function (req, res) {

    let prof = {}
    prof.name = req.body.name;
    prof.rating= req.body.rating;


    res.writeHead(200, {
        "Content-Type": "application/json",
    });

    res.end(JSON.stringify(await postProf(prof)));
});

async function countid () {
    console.log("hier in async countid");

    await client.connect();

    const db = await client.db(`profdb`).collection('profs').countDocuments(); //not done
    console.log(db)
    console.log(db + 1);
    //return db + Math.floor(Math.random() * 10000);   //böse?
    return db + 1;
}

async function postProf(prof) {
    await client.connect();
    prof.id = await countid();
    console.log("in postprof");
    console.log(prof.id);
    console.log(prof);
    
    let query = { id: prof.id };
    let update = { $set: {id: prof.id, name: prof.name, rating: prof.rating} };
    let options = { upsert: true, new: true };
    const db = await client.db(`profdb`).collection('profs').updateOne(query, update, options); //not done
    console.log(JSON.stringify(db));
    return await getprofs();

}

app.listen(port, () => console.log(`Server listening on port ${port}!`));