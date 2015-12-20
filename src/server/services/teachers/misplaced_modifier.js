var _ = require('underscore');
var nlp = require('nlp_compromise');
var BaseTeacher = require('./base_teacher');
var EditItem = require('../../models/edit_item');
var tokensToText = require('../util/tokens_to_text');


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
        var sentences = this.parseToSentences(inputText);
        _.each(sentences, function(sentence) {
            var editItems = this._alterModifierSentence(sentence);
            _.each(editItems, function (editItem) {
                editItem.startIndex += sentence.startIndex;
                editItem.endIndex += sentence.startIndex;
            });
            Array.prototype.push.apply(errors, editItems);
        }, this);
        return errors;
    },

    /**
     * Return whether given sentence has an appropriate sentence structure
     * (ie, Part of Speech tags) for creating a misplaced modifier edit
     * @param {nlp.Sentence}
     * @returns {Boolean}
     */
    _alterModifierSentence : function (sentence) {
        var editItems = [],
            sentenceStructure = sentence.tags().join(),
            tokens = this.parseToTokens(sentence.text());
        _.find(this.modifierSentenceRules, function(modifierRule) {
            var modifierStructure = modifierRule.sentenceStructure;
            if (modifierStructure.test(sentenceStructure)) {
                var match = sentenceStructure.match(modifierStructure);

                // Get matching tokens
                var matchedTokens = this._getMatchingTokens(modifierStructure, tokens);

                // Get start/end char indexes
                var startTokenIndex = this._getTokenCount(sentenceStructure.slice(0, match.index));
                var leadingCharCount = tokensToText(tokens.slice(0, startTokenIndex)).length,
                    startCharIndex = sentence.text().indexOf(matchedTokens[0].text, leadingCharCount);
                var endCharIndex = startCharIndex + tokensToText(matchedTokens).length;

                // Alter tokens to new POS structure
                var editedTokens = this._editTokens(match, modifierRule.newStructure, matchedTokens);

                // Create EditItem
                var editedText = tokensToText(editedTokens);
                editItems.push(new EditItem(startCharIndex, endCharIndex, editedText, 'misplaced-modifier'));
            }
        }, this);
        return editItems;
    },

    /**
     * Map the matched POS tags to matched tokens and
     * return list of adjusted tokens according to the new POS structure
     * @param {regExp Match object} regExpMatch: eg. ['IN,NN,IN,PP', 'IN,NN', 'IN,PP']
     * @param {string} editPosStructure: eg. '$2,$1'
     * @param {Array.<nlp.Token>} tokens
     * @returns {Array.<nlp.Token>}
     */
    _editTokens : function (regExpMatch, editPosStructure, tokens) {
        // Map tokens to Groups of tokens (aligning with matched POS tag groups)
        // tokenMatchGroups format: {$1: [tokenIN, tokenPP], $2: [tokenIN, tokenNN]}
        var matchedTokenCount = 0;
        var tagMatchGroups = regExpMatch.slice(1);
        var tokenMatchGroups = _.reduce(tagMatchGroups, function (tokenMatchGroups, posTagMatchGroup, index) {
            // index starts at 0, but match group indexes start at 1
            var groupId = '$' + (index + 1).toString();
            var groupTokenCount = this._getTokenCount(posTagMatchGroup);
            tokenMatchGroups[groupId] = {};
            var groupTokens = tokens.slice(matchedTokenCount,
                                           matchedTokenCount + groupTokenCount);
            tokenMatchGroups[groupId].tokens = groupTokens;
            tokenMatchGroups[groupId].capitalized = /^[A-Z]/.test(groupTokens[0]);
            var punctuationMatch = _.last(groupTokens).text.match(/[,.;:\'\"?!-]+$/);
            tokenMatchGroups[groupId].punctuation = punctuationMatch && punctuationMatch[0];
            matchedTokenCount += groupTokenCount;
            return tokenMatchGroups;
        }, {}, this);

        // Rearrange token Groups according to editPosStructure
        var editedTokens = [];
        _.each(editPosStructure.split(','), function (groupId, index) {
            var origGroup = tokenMatchGroups['$' + (index +1).toString()];
            var newGroup = tokenMatchGroups[groupId];
            if (origGroup.capitalized) {
                newGroup.tokens[0].text[0] = newGroup.tokens[0].text[0].toUpper();
            }
            if (origGroup.punctuation) {
                _.last(newGroup.tokens).text += origGroup.punctuation;
            }
            Array.prototype.push.apply(editedTokens, newGroup.tokens);
        });
        return editedTokens;
    },

    /**
     * Return a subset of tokens that matches the given POS structure
     * @param {regExp} modifierStructure
     * @param {Array.<nlp.Token>} tokens
     * @returns {Array.<nlp.Token>}
     * @example _getMatchingTokens(/(IN,[\w]+)/, [Token1, Token2, Token3]) => [Token2, Token3]
     */
    _getMatchingTokens : function (modifierStructure, tokens) {
        var tokenPosStructure = this._getTokenPosStructure(tokens);
        var match = tokenPosStructure.match(modifierStructure),
            matchedPosStructure = match[0];
        var matchStartTagIndex = this._getTokenCount(tokenPosStructure.slice(0, match.index));
        var matchTokenCnt = this._getTokenCount(matchedPosStructure);
        return tokens.slice(matchStartTagIndex,
                            matchStartTagIndex + matchTokenCnt);
    },

    /**
     * Get the POS tag sequence representing structure of the given list of tokens
     * @param {Array.<nlp.Token>} tokens
     * @returns {string}
     */
    _getTokenPosStructure : function (tokens) {
        var tokenTags = _.map(tokens, function (token) { return token.pos.tag; });
        return tokenTags.join(',');
    },

    /**
     * Get the number of tokens represented by a string of part-of-speech tags
     * @param {string} structure
     * @returns {number}
     * @example _getTokenCount('IN,JJ,NN') => 3
     */
    _getTokenCount : function (structure) {
        // Remove leading ','
        if (structure.slice(0,1) === ',') {
            structure = structure.slice(1);
        }
        // Remove trailing ','
        if (structure.slice(-1) === ',') {
            structure = structure.slice(0,-1);
        }
        // If empty string, return 0
        if (structure === '') {
            return 0;
        }
        return structure.split(',').length;
    }
});

module.exports = MisplacedModifierTeacher; 
