 const express = require("express");
 const router = express.Router();
const gravatar = require("gravatar");
const bycrypt = require("bcryptjs");

const jwt = require("jsonwebtoken");
const config = require("config");
const {check, validationResult} = require("express-validator/check");
const {User} = require("../../../models/index")

 //@route  GET api/users
 //@desc   Register User
 //@access Public

 router.post("/", 
 [
    check("name", "Name is required")
    .not()
    .isEmpty(),
    check("email", "Please include a valid email").isEmail(),
    check("password",
    "Please enter a password with 5 or more characters").isLength({min: 6})
 ],

 async (req, res)=>{
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({errors: errors.array()})
    }

    const {name, email, password} = req.body

    try{
    
    //See if user exists
    let user = await User.findOne({email});

    if(user){
        return res.status(400).json( {errors: [{ message: "Users already exists" }] })
    }


    //Get users gravatar 
    const avatar = gravatar.url(email, {
        size: "200",
        rating: "pg",
        default: "mm"
    })

    //Creating new user document
    user = new User({
        name,
        email,
        avatar,
        password
    })
    //encrypt password

    const SALT = await bycrypt.genSalt(10);
    user.password = await bycrypt.hash(password, SALT)

    await user.save();

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

 
 })

 module.exports = router;