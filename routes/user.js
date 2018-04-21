const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const passport = require('passport');

//bring in user model
let User = require('../models/user');

//register form
router.get('/register', function(req, res) {
  res.render('register');
});

//register process
router.post('/register', function(req, res) {
  const name = req.body.name;
  const email = req.body.email;
  const username = req.body.username;
  const password = req.body.password;
  const password2 = req.body.password2;

  req.checkBody('name', 'Name is required').notEmpty();
  req.checkBody('email', 'Email is required').notEmpty();
  req.checkBody('email', 'Email is not valid').isEmail();
  req.checkBody('username', 'UserName is required').notEmpty();
  req.checkBody('password', 'Password is required').notEmpty();
  req.checkBody('password2', 'Password2 is required').notEmpty();
  req.checkBody('password2', 'Passwords do not match').equals(req.body.password);

  let errors = req.validationErrors();

  if (errors) {
    res.render('register', {
      errors : errors
    });
  } else {
    User.find({'username': username}, function(err, user) {
      if (err) {
        console.log('Signup error');
        return;
      }
      if (user.length == 0) {
        let newUser = new User({
          name : name,
          email : email,
          username : username,
          password : password
        });
        bcrypt.genSalt(10, function(err, salt) {
          bcrypt.hash(newUser.password, salt, function(err, hash) {
            if (err) {
              console.log(err);
            }
            newUser.password = hash;
            newUser.save(function(err) {
              if (err) {
                console.log(err);
                return;
              } else {
                passport.authenticate('local')(req, res, function () {
                  req.flash('success', 'You are now registered! Thank you!');
                  res.redirect('/');
                });
              }
            });
          });
        });
      } else {
        req.flash('danger', 'This username has already been registered...');
        res.redirect('/users/register');
      }
    });
  }
});

//login form
router.get('/login', function(req, res) {
  res.render('login');
});

//login process
router.post('/login', function(req, res, next) {
  passport.authenticate('local', {
    successRedirect : '/',
    failureRedirect : '/users/login',
    failureFlash : true
  })(req, res, next);
});

//logout
router.get('/logout', function(req, res) {
  req.logout();
  req.flash('success', 'You are logged out!');
  res.redirect('/users/login');
});

//account page
router.get('/account', function(req, res) {
  res.render('account');
});

module.exports = router;
