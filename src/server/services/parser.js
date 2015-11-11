var _ = require('underscore');
var WordConfusionTeacher = require('./teachers/word_confusion');

var Parser = function () {

    this.lessonDeltas = [];

    // Edit Threshold is a measure of how likely it is to choose any given
    // edit to insert an error into the output text. Higher threshold means 
    // more likely to insert more errors.
    this.chooseEditThreshold = 0.65;

    this.addMistakes = function addMistakes(inputText) {
        var teacher = new WordConfusionTeacher();
        var possibleErrors = teacher.getPossibleErrors(inputText);
        _.each(possibleErrors, function(editItem) {
            if (!this._isEditConflict(editItem)) {
                if (Math.random() >= this.chooseEditThreshold) {
                    this.lessonDeltas.push(editItem);
                }
            }
        }, this);
    };

    this.clear = function clear() {
        this.lessonDeltas = [];
    };

    this.getEditedText = function getEditedText(inputText) {
        var outputText = '';
        this.clear();
        this.addMistakes(inputText);

        var parsedCharIndex = 0;
        _.each(this.lessonDeltas, function (editItem) {
            outputText += inputText.slice(parsedCharIndex, editItem.startIndex);
            outputText += editItem.editText;
            parsedCharIndex = editItem.endIndex;
        });
        // Add any remaining input Text until the end of input
        outputText += inputText.slice(parsedCharIndex);
        return outputText;
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
