const dotenv = require("dotenv");
dotenv.config();
var express = require("express");
var passport = require("passport");
const bcrypt = require("bcrypt");

var postgresDB = require("../db/postgres");
var router = express.Router();

/* Passport Strategies Imports */
const LocalStrategy = require("passport-local").Strategy;

const CLIENT_URL = process.env.CLIENT_URL;

/* Passport Strategy Local */
passport.use(
  new LocalStrategy(
    { usernameField: "cedula" },
    async (cedula, password, done) => {
      try {
        const userFound = await postgresDB.query(
          "SELECT * FROM users WHERE id = $1",
          [cedula]
        );
        if (userFound.rows.length === 0) {
          done(null, false);
        } else {
          bcrypt.compare(
            password,
            userFound.rows[0].secret_password,
            (err, result) => {
              if (err) throw err;
              if (result === true) {
                const user = userFound.rows[0];
                done(null, user);
              } else {
                done(null, false);
              }
            }
          );
        }
      } catch (error) {
        done(error);
      }
    }
  )
);

router.post("/local", (req, res, next) => {
  passport.authenticate("local", (err, user, info) => {
    if (err) throw err;
    if (!user) {
      res.send({ message: "No user Exists" });
    } 
    else {
      req.logIn(user, (err) => {
        if (err) throw err;
        res.send({ message: "Succesfully Authenticated" });
      });
    }
  })(req, res, next);
});


router.get("/login/success", (req, res, next) => {
  if (req.user) {
    res.status(200).json({
      success: true,
      message: "succesful",
      user: req.user,
    });
  }
});

router.post("/logout", function (req, res, next) {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    res.redirect(CLIENT_URL);
    console.log("user logout successfully done", req.user);
  });
});

router.get("/login/failed", (req, res, next) => {
  res.status(401).json({
    success: false,
    message: "failure",
  });
});


passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});

module.exports = router;
