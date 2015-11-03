var express = require('express');
var http = require('http');

// @todo - set variables in config file
var env = 'develop';
var developMode = (env === 'develop');

var app = express();
app.set('port', 8888);

// Static assets
if (developMode) {
    app.use(express.static(__dirname + '/src'));
}

app.use(function(request, response, next) {
    console.log('Time: %d', Date.now());
    next();
});

app.get('', function(request, response) {
    response.sendfile(__dirname + '/src/index.html');
});

http.createServer(app).listen(app.get('port'), function() {
  console.log('Listening on localhost:' + app.get('port'));
});

