const express = require("express");
const router = express.Router();
const auth = require("../../../middleware/auth");
const {User} = require("../../../models/index")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken");
const config = require("config");
const {check, validationResult} = require("express-validator/check");

//@route  GET api/auth
//@desc   Get auth
//@access Public

router.get("/", auth, async(req, res)=>{
    try{
        const user = await User.findById(req.user.id, "-password")
        res.json(user)

    }catch(err){
        res.status(500).send("Server Error")
    }
})

//@route  POST api/auth
 //@desc   Authenticate user & get token
 //@access Public

 router.post("/", 
 [
    check("email", "Please include a valid email").isEmail(),
    check("password",
    "Password is required").exists()
 ],

 async (req, res)=>{
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({errors: errors.array()})
    }

    const {email, password} = req.body

    try{
    
    //See if user exists
    let user = await User.findOne({email});

    if(!user){
        return res.status(400)
                   .json( {errors: [{ message: "Invalid credentials" }] })
    }

    const isMatch = await bcrypt.compare(password, user.password)

    if(!isMatch) {
        return res.status(400)
        .json( {errors: [{ message: "Invalid credentials" }] })
    }

    //return jsonwebtoken 
    //pay load is data being sent via token
    const payload = {
        user:{
            id: user.id,
        }
    }

    jwt.sign(payload, 
        config.get("jwtSecret"),
        {expiresIn: 360000},
        (err, token) =>{
            if(err) throw err;
            res.json({ token })
        }
        );

    }catch(err){

        console.log(err.message);
        res.status(500).send("Server error")
    }

 
 });


 



module.exports = router;