const express = require("express");
const router = express.Router();

//@route  POST api/post
//@desc   Register user
//@access Public

router.get("/", (req, res)=>{
    res.send("post route")
})

module.exports = router;