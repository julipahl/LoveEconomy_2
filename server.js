var express = require('express');
var app = express();
var router = express.Router();
var path = require('path');
var logger = require('morgan');
var session = require('express-session');
var cookieParser = require('cookie-parser');
var cors = require('cors');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(cookieParser());
app.use(cors());

app.use(session({
    secret: '123456cat',
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 1800000 } // time im ms: 60000 - 1 min, 1800000 - 30min, 3600000 - 1 hour
   }))

// Mount routers
app.use('/', router);

app.use(express.static(path.join(__dirname,"src")));
app.use(express.static(path.join(__dirname,'build')));

//home page
// router.get('/',function(req,res){
router.get('/', (req, res) => {
        res.sendFile(`${__dirname}/src/index.html`);
});
// local_business page
router.get('/', (req, res) => {
    res.sendFile(`${__dirname}/src/local_deals.html`);
});
// Users page
router.get('/', (req, res) => {
    res.sendFile(`${__dirname}/src/Users.html`);
});

app.listen(process.env.PORT || 3000);

console.log('Running at Port 3000');
