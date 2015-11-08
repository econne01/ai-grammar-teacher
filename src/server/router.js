var express = require('express');
var router = express.Router();
var nlp = require('nlp_compromise');
var Parser = require('./services/parser');

router.post('/mistakify', function(request, response) {
    var inputText = request.body.inputText;
    var pos = nlp.pos(inputText)
    var parser = new Parser();
    var outputText = parser.getEditedText(inputText);
    response.json({
        'editItems': parser.lessonDeltas
    });
});


module.exports = router;
