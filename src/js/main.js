var getOutputText = function generateOutputText(inputText) {
    return inputText;
};

var onClick = function onClick() {
    var inputText = $('#text-input').val();
    var outputText = getOutputText(inputText);
    var outputElem = $('#text-output');
    outputElem.text(outputText);
};

