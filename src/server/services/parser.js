var WordConfusionTeacher = require('./teachers/word_confusion');

var Parser = function () {

    this.lessonDeltas = [];

    this.addMistakes = function addMistakes(inputText) {
        var teacher = new WordConfusionTeacher();
        this.lessonDeltas = teacher.getPossibleErrors(inputText);
        return inputText;
    };
};

module.exports = new Parser();
