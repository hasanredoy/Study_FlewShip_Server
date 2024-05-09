const express = require('express');
const cors = require('cors');
require('dotenv').config()
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken')


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

app.get('/' ,(req ,res)=>{
  res.send('CRUD_JWT_project is running')
})

app.listen(port , ()=>{
  console.log('port is running on:' , port);
})