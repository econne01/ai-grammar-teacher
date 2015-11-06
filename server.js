var bodyParser = require('body-parser');
var express = require('express');
var http = require('http');
var router = require('./src/server/router');

// @todo - set variables in config file
var env = 'develop';
var developMode = (env === 'develop');

var app = express();
app.set('port', 8888);
app.use(bodyParser.json()); // support json-encoded request bodies
app.use(bodyParser.urlencoded({ extended: true }));

// Static assets
if (developMode) {
    app.use(express.static(__dirname + '/src/client'));
}

app.use(function(request, response, next) {
    console.log('Time: %d', Date.now());
    next();
});

app.get('', function(request, response) {
    response.sendfile(__dirname + '/src/client/index.html');
});

// use routes
app.use('/', router);

http.createServer(app).listen(app.get('port'), function() {
  console.log('Listening on localhost:' + app.get('port'));
});

