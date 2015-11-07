var parser = require('../services/parser');

var sampleInputText = 'Dick and Jane were two children who had a series of books ' +
    'written about them that were used to help real children learn to read ' + 
    'from the 1930\'s to 1970\'s. In 2005, there was a movie made about ' +
    'Dick and Jane, starring Jim Carrey. In the movie, Dick and Jane resort to ' +
    'bank robbery to make a living. Their movie characters sure seem different than the ' +
    'original children\'s books.';

console.log('testing. Hello? World?');
var outputText = parser.addMistakes(sampleInputText);
console.log('InputText = \n', sampleInputText);
console.log('OutputText = \n', outputText);
console.log(parser.lessonDeltas);
