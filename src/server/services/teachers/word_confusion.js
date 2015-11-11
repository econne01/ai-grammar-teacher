var _ = require('underscore');
var BaseTeacher = require('./base_teacher');
var EditItem = require('../../models/edit_item');

var WordConfusionTeacher = BaseTeacher.extend({

    lessonDecription : 'Swap words that are commonly mispelled or confused ' +
        'such as there-their or affect-effect.',

    // List of lists. What words are often confused for each other
    confusionWords : [
        ['accept', 'except'],
        ['affect', 'effect'],
        ['allude', 'elude'],
        ['allusion', 'illusion'],
        ['ascent', 'assent'],
        ['baited', 'bated'],
        ['breath', 'breathe'],
        ['complement', 'compliment'],
        ['desert', 'dessert'],
        ['elicit', 'illicit'],
        ['its', 'it\'s'],
        ['lead', 'led'],
        ['passed', 'past'],
        ['principal', 'principle'],
        ['than', 'then'],
        ['there', 'their', 'they\'re'],
        ['to', 'too', 'two'],
        ['whose', 'who\'s'],
        ['your', 'you\'re']
    ],

    /**
     * Search through given input text for examples of frequently confused words.
     * Return list of possible edits to the text that could swap in an incorrect word.
     * @override
     * @param {Array.<token>} tokens
     * @returns {Array.<EditItem>} 
     */
    getPossibleErrors : function (inputText) {
        var errors = [],
            tokens = this.parseToTokens(inputText);
        _.each(tokens, function(token, tokenIndex) {
            var wordList = this._getConfusionWordList(token.normalised);
            if (!_.isUndefined(wordList)) {
                _.each(wordList, function(confusionWord) {
                    if (confusionWord !== token.normalised) {
                        var startIndex = token.startIndex,
                            endIndex = startIndex + token.text.length;
                        // @todo - handle capitalizd words and punctuation
                        var editItem = new EditItem(startIndex, endIndex, confusionWord, 'word-confusion');
                        errors.push(editItem);
                    }
                });
            }
        }, this);
        return errors;
    },

    _getConfusionWordList : function (word) {
        return _.find(this.confusionWords, function(wordList) {
            if (_.contains(wordList, word)) {
                return wordList;
            }
        });
    }
});

module.exports = WordConfusionTeacher; 
