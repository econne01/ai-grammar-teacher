var express = require('express');
var router = express.Router();
var nlp = require('nlp_compromise');
var parser = require('./services/parser');

router.post('/mistakify', function(request, response) {
    var inputText = request.body.inputText;
    var pos = nlp.pos(inputText)
    var outputText = parser.getEditedText(inputText);
    response.type('txt').send(outputText);
});


module.exports = router;
