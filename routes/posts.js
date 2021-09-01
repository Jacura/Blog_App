const express = require("express");
const router = express.Router({ mergeParams: true });
const Post = require("../models/post");
const middleware = require("../middleware");

router.get("/", async(req, res) => {
  
   //Get all posts from DB
   try {

    let posts =await Post.find({});
    res.render("posts/index", {
      posts: posts.reverse(),
      currentUser: req.user,
    });
    
  } catch (error) {
    console.log(error)
    return res.status(500).json({
      message: "Something Went Wrong",
    });
    
  }
  
});

//CREATE- add new post to DB
router.post("/", middleware.isLoggedIn, (req, res) => {
  // add new post
  let name = req.body.name;
  let imageUrl = req.body.image;
  let desc = req.body.description;
  let createdAt = req.body.createdAt;
  let author = {
    id: req.user._id,
    username: req.user.username,
  };

  let newPost = {
    name: name,
    image: imageUrl,
    description: desc,
    author: author,
    createdAt:createdAt
  };
  //Save to database
  Post.create(newPost, (err, newlyCreated) => {
    if (err) {
      console.log("Error in inserting into DB");
    } else {
      res.redirect("/posts");
    }
  });
});


router.get("/publish", middleware.isLoggedIn, (req, res) => {
  res.render("posts/new");
});

// render show template with given id
router.get("/:id", function (req, res) {
  //find the post with provided id
  Post.findById(req.params.id)
    .populate("comments")
    .exec((err, foundPost) => {
      if (err) {
        console.log("Error occurced in finding ID");
      } else {
        //render show template with that post
        res.render("posts/show", { post: foundPost });
      }
    });
});

//Edit post by Id
router.get("/:id/edit", middleware.checkPostOwnership, (req, res) => {
  Post.findById(req.params.id, (err, foundPost) => {
    res.render("Posts/edit", { post: foundPost });
  });
});

//UPDATE POST ROUTE
router.put("/:id", middleware.checkPostOwnership, (req, res) => {
  //find and update
  Post.findByIdAndUpdate(req.params.id, req.body.post, (err, updatedPost) => {
    if (err) {
      console.log(err);
    } else {
      res.redirect("/posts/" + req.params.id);
    }
  });
});

//DESTROY POST ROUTE
router.delete("/:id", middleware.checkPostOwnership, (req, res) => {
  Post.findByIdAndRemove(req.params.id, (err) => {
    if (err) {
      res.redirect("/posts");
    } else {
      res.redirect("/posts");
    }
  });
});

module.exports = router;
