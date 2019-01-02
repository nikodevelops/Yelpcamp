var express = require("express");
var router = express.Router({ mergeParams: true });
var campground = require("../models/campground");
var Comment = require("../models/comment");

//Comments New
router.get("/new", isLoggedIn, function(req, res) {
  campground.findById(req.params.id, function(err, campground) {
    if (err) {
      console.warn(err);
    } else {
      console.log(campground);
      res.render("comments/new", { campground: campground });
    }
  });
});

//Comments Create
router.post("/", isLoggedIn, function(req, res) {
  campground.findById(req.params.id, function(err, campground) {
    if (err) {
      console.warn(err);
      res.redirect("/campgrounds");
    } else {
      Comment.create(req.body.comment, function(err, comment) {
        if (err) {
          console.warn(err);
        } else {
          //add username and id to comment
          comment.author.id = req.user._id;
          comment.author.username = req.user.username;
          //save comment
          comment.save();
          campground.comments.push(comment);
          campground.save();
          res.redirect("/campgrounds/" + campground._id);
        }
      });
    }
  });
});
//comments edit route
router.get("/:comments_id/edit", checkCommentUser, function(req, res) {
  Comment.findById(req.params.comments_id, function(err, foundComment) {
    if (err) {
      console.warn(err);
      res.redirect("back");
    } else {
      res.render("comments/edit", {
        campground_id: req.params.id,
        comment: foundComment
      });
    }
  });
});
//comments update
router.put("/:comments_id", checkCommentUser, function(req, res) {
  Comment.findByIdAndUpdate(req.params.comments_id, req.body.comment, function(
    err,
    updatedComment
  ) {
    if (err) {
      console.warn(err);
      res.redirect("back");
    } else {
      res.redirect("/campgrounds/" + req.params.id);
    }
  });
});
//comment destroy route
router.delete("/:comments_id", checkCommentUser, function(req, res) {
  //findByIdAndremove
  Comment.findByIdAndRemove(req.params.comments_id, function(err) {
    if (err) {
      console.warn(err);
      res.redirect("back");
    } else {
      res.redirect("/campgrounds/" + req.params.id);
    }
  });
});

//middleware
function checkCommentUser(req, res, next) {
  if (req.isAuthenticated()) {
    Comment.findById(req.params.comments_id, function(err, foundComment) {
      if (err) {
        console.warn(err);
        res.redirect("back");
      } else {
        //does user own comment?
        if (foundComment.author.id.equals(req.user._id)) {
          next();
        } else {
          res.redirect("back");
        }
      }
    });
  } else {
    res.redirect("back");
  }
}

function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  } else {
    res.redirect("/login");
  }
}
module.exports = router;
