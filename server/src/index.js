const express = require('express')
const cors = require('cors')
const dotenv = require('dotenv')
dotenv.config()
const PORT = process.env.PORT || 8080
const DbService = require('./db')

const app = express()
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({extended : false}))


app.get('/', (req,res)=>{
    const db = DbService.getDbServiceInstance()
    const result = db.getData()
    
    result
    .then(data => res.json({data:data}))
    .catch(err =>console.log(err))
})


app.post("/", (req,res)=>{
    const {Name} = req.body;
    const {date} = req.body;
    const {route} = req.body;
    const {marker_type} = req.body;
    const {distance} = req.body;
    
    const db = DbService.getDbServiceInstance()
    const result = db.postData(Name,date,route,marker_type,distance)

    result
    .then(data => res.json({data : data}))
    .catch(err => console.log(err.message))
})
app.listen(PORT, ()=>{
    console.log("app listning on " + PORT);
})
