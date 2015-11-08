var _ = require('underscore');
var nlp = require('nlp_compromise');
var WordConfusionTeacher = require('./teachers/word_confusion');

var Parser = function () {

    this.lessonDeltas = [];

    // Edit Threshold is a measure of how likely it is to choose any given
    // edit to insert an error into the output text. Higher threshold means 
    // more likely to insert more errors.
    this.chooseEditThreshold = 0.65;

    this.addMistakes = function addMistakes(tokens) {
        var teacher = new WordConfusionTeacher();
        var possibleErrors = teacher.getPossibleErrors(tokens);
        _.each(possibleErrors, function(editItem) {
            if (!this._isEditConflict(editItem)) {
                if (Math.random() >= this.chooseEditThreshold) {
                    this.lessonDeltas.push(editItem);
                }
            }
        }, this);
    };

    this.getEditedText = function getEditedText(inputText) {
        var outputText = '';
        var tokens = this.parseToTokens(inputText);
        this.addMistakes(tokens);
        for (var i=0; i<tokens.length; i++) {
            var editItem = _.find(this.lessonDeltas, function(editItem) {
                return editItem.startIndex === i;
            });
            if (editItem) {
                outputText += ' ' + editItem.editText;
                i = editItem.endIndex;
            } else {
                outputText += ' ' + tokens[i].text;
            }
        }
        return outputText;
    };

    this.parseToTokens = function parseToTokens(inputText) {
        var tokens = [],
            charIndex = 0;
        _.each(nlp.tokenize(inputText), function(sentence) {
            _.each(sentence.tokens, function(token) {
                token.startIndex = inputText.indexOf(token.text, charIndex);
                tokens.push(token);
                charIndex = token.startIndex + token.text.length;
            });
        });
        return tokens;
    };

    /**
     * Return whether or not the given editItem would conflict with any editItems
     * already selected to be used in output text. We don't want to edit the same
     * portion of source text in multiple different ways
     * @param {EditItem} editItem
     * @returns {boolean}
     */
    this._isEditConflict = function (editItem) {
        var conflictingItem = _.find(this.lessonDeltas, function(chosenEditItem) {
            return ((chosenEditItem.startIndex <= editItem.startIndex &&
                editItem.startIndex <= chosenEditItem.endIndex) ||
                (editItem.startIndex <= chosenEditItem.startIndex &&
                chosenEditItem.startIndex <= editItem.endIndex));
        });
        return !_.isUndefined(conflictingItem);
    };
};

module.exports = Parser;
