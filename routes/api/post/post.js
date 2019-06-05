const express = require("express");
const router = express.Router();
const auth = require("../../../middleware/auth")
const {check, validationResult} = require("express-validator/check")
const {Post, User, Profile} = require("../../../models/index");

//@route  POST api/post
//@desc   Create user
//@access Private

router.post("/", [auth,
     [
    check("text", "Text is required.")
            .not()
            .isEmpty()
]
], async (req, res)=>{
    const errors = validationResult(req);

    if(!errors.isEmpty()){
        return res.status(400).json({errors : errors.array()});
    }


    try {
        const user = await User.findById(req.user.id).select("-password");

        const newPost = new Post( {
            text: req.body.text,
            name: user.name,
            avatar: user.avatar,
            user: req.user.id
        })

       const post =  await newPost.save();

       res.json(post);
        
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }



})

//@route  GET api/post
//@desc   Get all posts
//@access Private

router.get("/", auth, async (req, res)=>{
    try {
        const posts = await Post.find().sort({date: -1});

        res.json(posts);

    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
})

//@route  GET api/post/:post_id
//@desc   Get single post by id
//@access Private

router.get("/:post_id", auth, async (req, res)=>{
    try {
        const post = await Post.findById(req.params.post_id);
        if(!post) return res.status(404).json({msg: "Post not found"});


        res.json(post);

    } catch (err) {
        console.error(err.message);
        if(err.kind === "ObjectId"){
            return res.status(400).json({msg : "Post not found."});
        }
        res.status(500).send("Server Error")
    }
    }
)



//@route  DELETE api/post/:post_id
//@desc   Delete selected posts
//@access Private

router.delete("/:post_id", auth, async (req, res)=>{
    try {
        const post = await Post.findById(req.params.post_id);
        if(!post) return res.status(400).json({msg : "Post not found."});
        //Check user
        if(post.user.toString() !== req.user.id) return res.status(401).json({ msg: "User not authorized"});

        await post.remove();

        res.json({ msg: "Post removed."})


    } catch (err) {
        console.error(err.message);
        if(err.kind === "ObjectId"){
            return res.status(400).json({msg : "Post not found."});
        }
        res.status(500).send("Server Error")
    }
})

//@route  PUT api/post/like/:post_id
//@desc   Adding like to a  post
//@access Private

router.put("/like/:post_id", auth, async (req, res) => {
    try {
        const post = await Post.findById(req.params.post_id);

        if(!post) return res.status(400).json({msg : "Post not found."});
        
        if(post.likes.filter(like => like.user.toString() === req.user.id).length > 0){
            return res.status(400).json({ msg: "Post already liked."})
        }

        post.likes.unshift({user: req.user.id});

        await post.save();

        res.json(post.likes);
        
    } catch (err) {
        console.error(err.message);
        if(err.kind === "ObjectId"){
            return res.status(400).json({msg : "Post not found."});
        }
        res.status(500).send("Server Error")
    }
    }
)


//@route  PUT api/post/unlike/:post_id
//@desc   Unliking to a  post
//@access Private

router.put("/unlike/:post_id", auth, async (req, res) => {
    try {

        const post = await Post.findById(req.params.post_id);

        if(!post) return res.status(400).json({msg : "Post not found."});

        const user = post.likes.filter(like => like.user.toString() === req.user.id);
        // console.log(user);
        const removedId = post.likes.indexOf(user);

        post.likes.splice(removedId, 1);
        // console.log(post);
        await post.save();
        res.json(post);
        
    } catch (err) {
        console.error(err.message);
        if(err.kind === "ObjectId"){
            return res.status(400).json({msg : "Post not found."});
        }
        res.status(500).send("Server Error")
    }
})

    //@route  DELETE api/post/:post_id/comment/:comment_id
    //@desc   deleting a comment from a post
    //@access Private

    router.delete("/:post_id/comment/:comment_id", auth, async (req, res) => {
        try {
            console.log(req.user)
            const post = await Post.findById(req.params.post_id);

            if(!post) return res.status(400).json({msg : "Post not found."});
    
            const comment = post.comments.filter(comment => comment._id.toString() === req.params.comment_id);     
            
            if(comment.length === 0) return res.status(400).json({msg : "Comment not found."});

            if(comment[0].user.toString() !== req.user.id) return res.status(401).json({ msg: "User is not authorized"})
            
            const removedId = post.comments.indexOf(comment);
    
            post.comments.splice(removedId, 1);
            // console.log(post);
            await post.save();
            res.json(post);

        } catch (err) {
            console.error(err.message);
            if(err.kind === "ObjectId"){
                return res.status(400).json({msg : "Post not found."});
            }
            res.status(500).send("Server Error")  
        }
    })  


    //@route  PUT api/post/comments/:post_id
    //@desc   Commenting a post
    //@access Private

    router.put("/comment/:post_id", [auth, 
        [
        check("text", "Comment is required")
            .not()
            .isEmpty()
        ]
    ], async (req, res)=>{

        const errors = validationResult(req);

        if(!errors.isEmpty()){ return res.status(400).json( { errors : errors.array()})};

        try {
            
            const post = await Post.findById(req.params.post_id).populate("user", ["name", "avatar"]);
            
            if(!post) return res.status(400).json({msg : "Post not found."});
            console.log(post)
            
            const newComment = {
            user: req.user.id,
            text: req.body.text,
            name: post.user.name,
            avatar: post.user.avatar
            }

            post.comments.unshift(newComment);
            await post.save();
            res.json(post);

        } catch (err) {
            console.error(err.message);
            if(err.kind === "ObjectId"){
                return res.status(400).json({msg : "Post not found."});
            }
            res.status(500).send("Server Error")    
        }


    })

module.exports = router;