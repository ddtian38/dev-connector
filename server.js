const express = require("express")
const connectDB = require('./config/db')

const app = express();

//Connect Database
connectDB();

app.get("/", (req,res) =>{
    res.send("HOME ROUTE")
})

const PORT = process.env.PORT || 3001

app.listen(PORT, function() {
    console.log(`listening on port  ${PORT}`)
})