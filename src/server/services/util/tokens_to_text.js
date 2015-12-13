var _ = require('underscore');

/**
 * Recombine a list of tokens into a string output
 * @param {Array.<nlp.Token>} tokens
 * @returns {string}
 */
module.exports = function tokensToText(tokens) {
    var tokenTexts = _.map(tokens, function (token) {
        return token.text;
    });
    return tokenTexts.join(' ');
};
