// var BaseClass = require('../../../3p/duh');
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
     * @param {string} inputText
     * @returns {Array.<EditItem>} 
     */
    getPossibleErrors : function (inputText) {
        return [];
    }
});

module.exports = BaseTeacher;
