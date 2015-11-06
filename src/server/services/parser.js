var express = require('express');

var Parser = function () {

    this.addMistakes = function addMistakes(inputText) {
        console.log('Received input to parser');
        return inputText;
    };
};

module.exports = new Parser();
