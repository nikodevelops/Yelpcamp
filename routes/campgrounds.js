var express = require("express");
var router = express.Router();
var campground = require("../models/campground");

router.get("/", function(req, res) {
  campground.find({}, function(err, allcampgrounds) {
    req.user;
    if (err) {
      console.log(err);
    } else {
      res.render("campgrounds/index", {
        campgrounds: allcampgrounds
      });
    }
  });
});
//CREATE ROUTE
router.post("/", isLoggedIn, function(req, res) {
  //get data from form
  var name = req.body.name;
  var image = req.body.image;
  var desc = req.body.description;
  var author = {
    id: req.user._id,
    username: req.user.username
  };
  var newCampground = { name: name, image: image, description: desc, author };

  //create a new campground and save to DB
  campground.create(newCampground, function(err, newlyCreated) {
    if (err) {
      console.log(err);
    } else {
      console.log("Campground added!");
      console.log(newlyCreated);
      res.redirect("/campgrounds");
    }
  });
  // redirect back to campgrounds page
});
//SHOW FORM TO CREATE NEW CAMPGROUND
router.get("/new", isLoggedIn, function(req, res) {
  res.render("campgrounds/new");
});

//shows more info about a specific campground
router.get("/:id", function(req, res) {
  //find the campground with the valid id
  campground
    .findById(req.params.id)
    .populate("comments")
    .exec(function(err, foundCampground) {
      if (err) {
        console.log(err);
      } else {
        res.render("campgrounds/show", { campground: foundCampground });
      }
    });
  //render show template with that campground
});
//edit campground route
router.get("/:id/edit", checkUser, function(req, res) {
  //is user logged in
  if (req.isAuthenticated()) {
    campground.findById(req.params.id, function(err, foundCampground) {
      if (err) {
        console.warn(err);
        res.redirect("/campgrounds");
      } else {
        res.render("campgrounds/edit", { campground: foundCampground });
      }
    });
  }
});

//update campground route
router.put("/:id", checkUser, function(req, res) {
  campground.findByIdAndUpdate(req.params.id, req.body.campground, function(
    err,
    updatedCampground
  ) {
    if (err) {
      console.warn(err);
      res.redirect("/campgrounds");
    } else {
      res.redirect("/campgrounds/" + req.params.id);
    }
  });
});

//destroy route
router.delete("/:id", checkUser, function(req, res) {
  campground.findByIdAndRemove(req.params.id, function(err) {
    if (err) {
      console.warn(err);
    } else {
      res.redirect("/campgrounds");
    }
  });
});
function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  } else {
    res.redirect("/login");
  }
}
function checkUser(req, res, next) {
  if (req.isAuthenticated()) {
    campground.findById(req.params.id, function(err, foundCampground) {
      if (err) {
        console.warn(err);
        res.redirect("back");
      } else {
        //does user own campground
        if (foundCampground.author.id.equals(req.user._id)) {
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

module.exports = router;
