const express = require("express");
const cors = require("cors");
require("dotenv").config();
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

const app = express();

// port
const port = process.env.PORT || 5000;

// using middleWares
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "http://localhost:5174",
      "https://study-flewship-a-11.firebaseapp.com",
      "https://study-flewship-a-11.web.app",
    ],
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster01.2xfw1xu.mongodb.net/?retryWrites=true&w=majority&appName=Cluster01`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});
// console.log(uri);
async function run() {
  try {
    // assignments api
    const assignmentsCollection = client
      .db("assignmentsDB")
      .collection("assignments");

    // getting assignment api
    app.get("/assignments", async (req, res) => {
      const data = assignmentsCollection.find();

      const result = await data.toArray();
      res.send(result);
    });
    // posting on assignment api
    app.post("/assignments", async (req, res) => {
      const data = req.body;
      console.log(data);
      const result = await assignmentsCollection.insertOne(data);
      res.send(result);
    });
  // getting single assignment 
    app.get("/assignments/:id", async (req, res) => {
     
      const id = req.params.id
      const filter = {_id : new ObjectId(id)}
      const result = await assignmentsCollection.findOne(filter);
      res.send(result)
    });
    // updating assignment api
    app.put("/assignments/:id", async (req, res) => {
      const assignment = req.body;
      const id = req.params.id
      console.log('id=',id,'assignment=',assignment);
      const filter = {_id : new ObjectId(id)}
      const updateAssignment = {
        $set: {
          title: assignment?.title,
          levels: assignment?.levels,
          marks: assignment?.marks,
          date: assignment?.date,
          photoURL: assignment?.photoURL,
          description: assignment?.description,
          email: assignment?.email,
        },
      };
      const options = { upsert: true };
      const result = await assignmentsCollection.updateOne(filter ,updateAssignment,options);
      res.send(result)
    });

// delete an assignment
app.delete('/assignments/:id', async(req,res)=>{
  const id = req.params.id
  const filter={_id: new ObjectId(id)}
  const result = await assignmentsCollection.deleteOne(filter)
  res.send(result)
})


    // online study benefit collection
    const benefitCollection = client
      .db("Online-study-benifitsDB")
      .collection("benfitsOfOnlineStudy");

    app.get("/benefits", async (req, res) => {
      const getBenefit = benefitCollection.find();
      const result = await getBenefit.toArray();
      res.send(result);
    });

    // feature collection
    const featureCollection = client.db("FeaturesDB").collection("features");
    // feature api
    app.get("/features", async (req, res) => {
      const getFeature = featureCollection.find();
      const result = await getFeature.toArray();
      res.send(result);
    });
  } finally {
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("CRUD_JWT_project is running");
});

app.listen(port, () => {
  console.log("port is running on:", port);
});
