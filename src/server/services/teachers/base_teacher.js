var _ = require('underscore');
var nlp = require('nlp_compromise');
var Class = require('../../../3p/inheritance_class');

/**
 * Teacher classes are intended to highlight certain cases or types of
 * errors in grammar or writing. This is the BaseTeacher class, that
 * declares the generic process of how to use any child class.
 * The basic idea is that a Teacher will accept some text as input,
 * and determine how many instances of that class's error type could be
 * inserted into the text.
 */
var BaseTeacher = Class.extend({
    lessonDescription : 'NONE. This is the Base class. Subclasses should override',

    /**
     * Search through given input text for examples of a writing mistake
     * that could be inserted into text.
     * @param {Array.<token>} tokens
     * @returns {Array.<EditItem>} 
     */
    getPossibleErrors : function (inputText) {
        return [];
    },

    /**
     * Use NLP to parse an input string into tokens. Modify tokens to add character start_index
     * where token text is located within larger inputText string
     * @param inputText
     * @returns {Array}
     */
    parseToTokens : function parseToTokens(inputText) {
        var tokens = [],
            charIndex = 0,
            sentences = nlp.pos(inputText).sentences;
        _.each(sentences, function(sentence) {
            _.each(sentence.tokens, function(token) {
                token.startIndex = inputText.indexOf(token.text, charIndex);
                tokens.push(token);
                charIndex = token.startIndex + token.text.length;
            });
        });
        return tokens;
    }
});

module.exports = BaseTeacher;
