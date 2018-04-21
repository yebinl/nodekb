const express = require('express');
const router = express.Router();

//bring in models
let Article = require('../models/article');

//bring in user models
let User = require('../models/user');

//add /articles/add route
router.get('/add', function(req, res) {
    res.render('add_article', {
    	title : "Add article",
    });
});

//add submit post route
router.post('/add', ensureAuthenticated, function(req, res) {
	req.checkBody('title', 'Title is required').notEmpty();
	req.checkBody('body', 'Body is required').notEmpty();
	//get errors
	let errors = req.validationErrors();
	if (errors) {
		res.render('add_article', {
			title : 'Add Article',
			errors : errors
		});
	} else {
		let article = new Article();
		article.title = req.body.title;
		article.author = req.user._id;
		article.body = req.body.body;
		article.save(function(err) {
			if (err) {
				console.log(err);
				return;
			} else {
				req.flash('success', 'Article Added');
				res.redirect('/');
			}
		});
	}
});

//edit single article
router.get('/edit/:id', ensureAuthenticated, function(req, res) {
	Article.findById(req.params.id, function(err, article) {
    if (article.author != req.user._id) {
      req.flash('danger', 'Not Autherized');
      res.redirect('/users/login');
    } else {
      if (err) {
  			console.log(err);
  			return;
  		} else {
  			res.render('edit_article', {
  				title : 'Edit Article',
  				article : article
  			});
  		}
    }
	});
});

//update submit
router.post('/edit/:id', ensureAuthenticated, function(req, res) {
	let article = {};
	article.title = req.body.title;
	article.author = req.user._id;
	article.body = req.body.body;

	let query = {_id:req.params.id};
	Article.update(query, article, function(err) {
			if(err) {
				console.log(err);
				return;
			} else {
				req.flash('success', 'Article Modified');
				res.redirect('/');
			}
	});
});
//get single article
router.get('/:id', function(req, res) {
	Article.findById(req.params.id, function(err, article) {
    User.findById(article.author, function(err, user) {
      res.render('article', {
  			article:article,
        author : user.username,
  		});
    });
	});
});

//delete request
router.delete('/:id', ensureAuthenticated, function(req, res) {
  if(!req.user._id) {
    res.status(500).send();
  }
	let query = {_id:req.params.id};
  Article.findById(req.params.id, function(err, article) {
    if (article.author != req.user._id) {
      res.status(500).send();
    } else {
      Article.remove(query, function(err) {
        if(err) {
          console.log(err);
          return;
        }
          res.send('Success');
      });
    }
  });
});

//search route
router.post('/search', function(req, res) {
    Article.find({'title' : req.body.search}, function(err, articles) {
      if (err) {
  			console.log(err);
  		} else if (articles.length != 0){
    		res.render('search', {
    			title : req.body.search + ' found',
  				articles : articles,
  			});
  		} else {
        req.flash('danger', 'The title you searched not exist.');
        res.redirect('/');
      }
  	});
});

//check login authenticate
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  } else {
    req.flash('danger', 'Please login');
    res.redirect('/users/login');
  }
}

module.exports = router;
