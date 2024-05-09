const express = require('express');
const cors = require('cors');
require('dotenv').config()
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken')
const { MongoClient, ServerApiVersion } = require('mongodb');


const app = express()

// port 
const port = process.env.PORT || 5000

// using middleWares 
app.use(cors({
  origin: [
    "http://localhost:5173",
    "http://localhost:5174",
     
  ],
  credentials: true,
}))
app.use(express.json())
app.use(cookieParser())




const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster01.2xfw1xu.mongodb.net/?retryWrites=true&w=majority&appName=Cluster01`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
  
  } finally {
   
  }
}
run().catch(console.dir);



app.get('/' ,(req ,res)=>{
  res.send('CRUD_JWT_project is running')
})

app.listen(port , ()=>{
  console.log('port is running on:' , port);
})