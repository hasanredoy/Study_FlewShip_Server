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
const cookieOptions = {
  httpOnly: true,
  sameSite:"none",
  secure: true ,
};
// middle wares 
const verifyToken = (req, res, next) => {
  const token = req?.cookies?.token;
  console.log(req?.cookies);
  console.log('token from cookies' , req?.cookies?.token);
  if (!token) {
    return res.status(401).send({ message: "unauthorized" });
  }

  jwt.verify(token, process.env.API_TOKEN_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).send({ message: "unauthorized" });
    }
    req.user = decoded;
    next();
  });
};


async function run() {
  try {

 // auth api
 app.post("/jwt", async (req, res) => {
  const user = req.body;
  console.log("user for token", user);
  const token = jwt.sign(user, process.env.API_TOKEN_SECRET, {
    expiresIn: "1h",
  });
  console.log(token);

  
  res.cookie('token', token, cookieOptions)
  .send({ token });
});
// setting cookies clear while user is logged out
app.post("/logout", async (req, res) => {
  const user = req.body;
  console.log("logging out user", user);
  res.clearCookie("token", { ...cookieOptions ,maxAge: 0 }).send({ success: true });
});

    // assignments api
    const assignmentsCollection = client
      .db("assignmentsDB")
      .collection("assignments");

    // getting assignment api
    app.get("/assignments",async (req, res) => {
      
      let query = {}
      if(req.query?.filter){
        query={levels: req.query.filter }
      }
     
      const data = assignmentsCollection.find(query);

      const result = await data.toArray();
      res.send(result);
    });
    // posting on assignment api
    app.post("/assignments",  async (req, res) => {
     
      const data = req.body;
      console.log(data);
      const result = await assignmentsCollection.insertOne(data);
      res.send(result);
    });
  // getting single assignment 
    app.get("/assignments/:id",verifyToken,  async (req, res) => {
     
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
 

// submitted assignments api 
const submittedAssignmentsCollection = client
      .db("submittedAssignmentsDB")
      .collection("submitted");

      // getting submitted assignment api
    app.get("/submittedAssignment", verifyToken,async (req, res) => {
      
      let query = {}
      if(req.query?.email){
        query={userEmail: req.query.email }
      }
      // if (req.query?.email !== req.user?.email) {
      //   return res.status(403).send({ message: "forbidden" });
      // }
      console.log('req user email ',req?.user?.email);
      const data = submittedAssignmentsCollection.find(query);

      const result = await data.toArray();
      res.send(result);
    });
      // getting single submitted assignment api
    app.get("/submittedAssignment/:id",verifyToken,  async (req, res) => {
      
      const id = req.params.id
      const filter={_id: new ObjectId(id)}

      const result = await submittedAssignmentsCollection.findOne(filter);
      res.send(result);
    });
    // posting on assignment api
    app.post("/submittedAssignment", async (req, res) => {
     
      const data = req.body;
      console.log(data);
      const result = await submittedAssignmentsCollection.insertOne(data);
      res.send(result);
    });

      // update single submitted assignment api
    app.put("/submittedAssignment/:id", async (req, res) => {
      
      const id = req.params.id
      const filter={_id: new ObjectId(id)}
      const options={upsert:true}
      const markData =req.body
      const update = {
        $set:{
          pdf: markData.pdf,
          note: markData.note,
          userEmail: markData.userEmail,
          access: markData.access,
          status: markData.status,
          title: markData.title,
          name: markData.name,
          marks: markData.marks,
          obtainedMarks:markData.obtainedMarks,
          Feedback:markData.Feedback
        }
      }
      const result = await submittedAssignmentsCollection.updateOne(filter,update,options);
      res.send(result);
    });
    


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
