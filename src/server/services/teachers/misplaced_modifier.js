var _ = require('underscore');
var nlp = require('nlp_compromise');
var BaseTeacher = require('./base_teacher');
var EditItem = require('../../models/edit_item');


var NOUN_REGEX = '[NN,NNP,NNPA,NNPS,NNS,PRP]';

var MisplacedModifierTeacher = BaseTeacher.extend({

    lessonDecription : 'Rearrange modifiers (ADJ, ADV or Phrase) in a sentence ' +
        'so they describe an unintended target (Noun, Verb).',

    modifierSentenceStructures : [
        // Any 2 prepositional phrases in a row
        /IN,[\w]+,IN,[\w]+/,
        // Only, Just, Nearly, Almost (Adjectives acting on verbs?) descriptors
        new RegExp(NOUN_REGEX + ',JJ,VB')
    ],
    modifierSentenceRules : {
        // Any 2 prepositional phrases in a row
        'swap_2_prepositions': {
            'sentenceStructure': /(IN,[\w]+),(IN,[\w]+)/,
            'newStructure': '$2,$1' 
        }
    },

    /**
     * Return list of possible edits to the text that could misplace a modifier
     * @override
     * @param {String} inputText
     * @returns {Array.<EditItem>} 
     */
    getPossibleErrors : function (inputText) {
        var errors = [];
        var sentences = nlp.pos(inputText).sentences;
        _.each(sentences, function(sentence) {
            var newSentence = this._alterModifierSentence(sentence);
            if (newSentence) {
                errors.push(newSentence);
            };
        }, this);
        return errors;
    },

    /**
     * Return whether given sentence has an appropriate sentence structure for creating
     * a misplaced modifier edit
     * @param {nlp.Sentence}
     * @returns {Boolean}
     */
    _alterModifierSentence : function (sentence) {
        var isMatchingStructure = false,
            structure = sentence.tags().join(),
            tokens = this.parseToTokens(sentence.text());
        _.find(this.modifierSentenceRules, function(modifierRule) {
            var modifierStructure = modifierRule.sentenceStructure;
            if (modifierStructure.test(structure)) {
                isMatchingStructure = true;
                var match = structure.match(modifierStructure);
                var matchStart = structure.search(modifierStructure);
                // @todo - this looks like a bug in case matchStart is 0...
                var startToken = this._getTokenCount(structure.slice(0, matchStart)) - 1;
                var endToken = startToken + this._getTokenCount(match[0]) - 1;
                var endCharIndex = matchStart;
                _.each(tokens.slice(startToken, endToken), function (token) {
                    endCharIndex += token.text.length;
                });

                var newSentence = '';
                _.each(tokens.slice(0, startToken), function(token) {
                    newSentence += token.text;
                });
                _.each(modifierRule.newStructure.split(','), function (structureMatchGroup) {
                    var tokenOffset = startToken;
                    structureMatchGroup = parseInt(structureMatchGroup.slice(1));
                    var groupCount = 1;
                    while (groupCount < structureMatchGroup) {
                        tokenOffset += this._getTokenCount(match[groupCount]); 
                        groupCount += 1;
                    }
                    _.each(tokens.slice(tokenOffset, tokenOffset + this._getTokenCount(match[structureMatchGroup])), function (token) {
                        newSentence += token.text;
                    });
                }, this);
                var editItem = new EditItem(matchStart, endCharIndex, newSentence, 'misplaced-modifier');
            }
            return isMatchingStructure;
        }, this);
        return isMatchingStructure;
    },

    /**
     * Get the number of tokens represented by a string of part-of-speech tags
     * @param {string} structure
     * @return {number}
     * @example _getTokenCount('IN,JJ,NN') => 3
     */
    _getTokenCount : function (structure) {
        return structure.split(',').length;
    }
});

module.exports = MisplacedModifierTeacher; 
