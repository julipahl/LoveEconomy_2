var express = require('express');
var app = express();
var router = express.Router();
var path = require('path');

// Mount routers
app.use('/', router);

app.use(express.static(path.join(__dirname,"src")));
app.use(express.static(path.join(__dirname,'build')));




app.listen(process.env.PORT || 3000);

console.log('Running at Port 3000');
