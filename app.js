const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const expressValidator = require('express-validator');
const flash = require('connect-flash');
const session = require('express-session');
const passport = require('passport');
const config = require('./config/database');

//connect to the database MongoDB
mongoose.connect(config.database);
let db = mongoose.connection;

//check for connection
db.once('open', function(){
	console.log('Connected to MongoDB');
});

//check for db errors
db.on('error', function(err){
	console.log(err);
});

//init app
const app = express();

//bring in models
let Article = require('./models/article');

//load view engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

//set public folder
app.use(express.static(path.join(__dirname, 'public')));

//bodyParser middleware
//parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({extended : false}));
//parse application/json
app.use(bodyParser.json());

//express session middleware
app.use(session({
	secret : 'keyboard cat',
	resave : true,
	saveUninitialized : true,
	//cookie : {
		//secure : true
	//}
}));

//express messages middleware
app.use(require('connect-flash')());
app.use(function (req, res, next) {
	res.locals.messages = require('express-messages')(req, res);
	next();
});

//express validator middleware
app.use(expressValidator({
	errorFormatter : function(param, msg, value) {
		var namespace = param.split('.');
		var root = namespace.shift();
		var formParam = root;

		while(namespace.length) {
			formParam += '[' + namespace.shift() + ']';
		}
		return {
			param : formParam,
			msg : msg,
			value : value
		};
	}
}));

//passport config
require('./config/passport')(passport);
app.use(passport.initialize());
app.use(passport.session());
app.get('*', function(req, res, next) {
	res.locals.user = req.user || null;
	next();
});








//home page
app.get('/', function(req, res) {
	 Article.find({}, function(err, articles) {
    if (err) {
			console.log(err);
		} else {

			res.render('index', {
				title : 'All Blogs',
				articles : articles,
			});
		}
	});
});

let article = require('./routes/article');
let user = require('./routes/user');
app.use('/articles', article);
app.use('/users', user);

//port listening
app.listen(3000, function () {
	console.log('Server is starting on port 3000...');
});
