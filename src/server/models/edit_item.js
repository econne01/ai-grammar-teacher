var Class = require('../../3p/inheritance_class');

var EditItem = Class.extend({

    /**
     * Constructor method
     * @param {number} startIndex: index of the token in original text where edit begins
     * @param {number} endIndex: index of the token in original text where edit ends
     * @param {string} editText: the replacement text for the edited portion of original text
     * @param {string} errorType: label for the type of lesson being taught with this edit
     */
    init : function (startIndex, endIndex, editText, errorType) {
        this.startIndex = startIndex;
        this.endIndex = endIndex;
        this.editText = editText;
        this.errorType = errorType;
    }
});

module.exports = EditItem;
