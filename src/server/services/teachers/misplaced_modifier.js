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
        new RegExp('.*' + NOUN_REGEX + ',JJ,VB.*')
    ],

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
            if (this._hasModifierSentenceStructure(sentence)) {
                var editItem = new EditItem(0, 10, 'TESTTEST -', 'misplaced-modifier');
                errors.push(editItem);
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
    _hasModifierSentenceStructure : function (sentence) {
        var isMatchingStructure = false,
            structure = sentence.tags().join(),
            tokens = this.parseToTokens(sentence.text());
        _.find(this.modifierSentenceStructures, function(modifierStructure) {
            if (modifierStructure.test(structure)) {
                isMatchingStructure = true;
                var matchStart = structure.search(modifierStructure);
                var startToken = structure.slice(0, matchStart).split(',').length;
            }
            return isMatchingStructure;
        });
        return isMatchingStructure;
    }
});

module.exports = MisplacedModifierTeacher; 
