const express = require("express")
const connectDB = require('./config/db')
const apiRoutes = require("./routes/api")

const app = express();

//Connect Database
connectDB();

//Init middleware
app.use(express.json({ extended: false} ))


app.get("/", (req,res) =>{
    res.send("HOME ROUTE")
})

//Define routes

app.use("/api", apiRoutes)

const PORT = process.env.PORT || 3001

app.listen(PORT, function() {
    console.log(`listening on port  ${PORT}`)
})