var express = require("express"),
  app = express(),
  bodyparser = require("body-parser"),
  mongoose = require("mongoose"),
  passport = require("passport"),
  methodOverride = require("method-override"),
  LocalStrategy = require("passport-local"),
  campground = require("./models/campground"),
  Comment = require("./models/comment"),
  User = require("./models/user"),
  seedDB = require("./seeds");
/*
seedDB();
*/
//requiring routes
var commentRoutes = require("./routes/comments"),
  campgroundRoutes = require("./routes/campgrounds"),
  authRoutes = require("./routes/index");

//Passport config

app.use(
  require("express-session")({
    secret: "Diego is the best and cutest cat",
    resave: false,
    saveUninitialized: false
  })
);
app.use(methodOverride("_method"));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

mongoose.connect("mongodb://localhost/yelp_camp");
app.use(bodyparser.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));

app.use(function(req, res, next) {
  res.locals.currentUser = req.user;
  next();
});
app.use("/", authRoutes);
app.use("/campgrounds/:id/comments", commentRoutes);
app.use("/campgrounds", campgroundRoutes);

app.listen(3000, function() {
  console.log("The yelpcamp server has started");
});
