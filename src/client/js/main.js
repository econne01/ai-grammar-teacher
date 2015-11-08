var getOutputText = function generateOutputText(inputText) {
    return inputText;
};

var makeRequest = function makeRequest(method, url, params) {
    var xmlHttp = new XMLHttpRequest();
    var reqParams = JSON.stringify(params);
    xmlHttp.onreadystatechange = function() {
        if (xmlHttp.readyState == 4 && xmlHttp.status == 200) {
            var response = JSON.parse(xmlHttp.response);
            showEditDeltas(response.editItems);
        }
    }
    xmlHttp.open('POST', url, true); // true for asynchronous
    xmlHttp.setRequestHeader("Content-type", "application/json; charset=utf-8");
    xmlHttp.send(reqParams);
};

var onClick = function onClick() {
    var inputText = $('#text-input').text();
    var outputText = getOutputText(inputText);
    makeRequest('GET', 'http://localhost:8888/mistakify', { inputText: inputText });
};

var showEditDeltas = function showEditDeltas(editItems) {
    // Highlight edit changes on Input Text
    var inputElement = $('#text-input'),
        inputText = inputElement.text(),
        inputHtml = '',
        charIndex = 0,
        outputElement = $('#text-output'),
        outputHtml = '';
    for (var i=0; i<editItems.length; i++) {
        var editItem = editItems[i],
            origText = inputText.slice(editItem.startIndex, editItem.endIndex);
        inputHtml += inputText.slice(charIndex, editItem.startIndex);
        outputHtml += inputText.slice(charIndex, editItem.startIndex);

        inputHtml += '<span class="delta-red">' + origText + '</span>';
        outputHtml += '<span class="delta-green">' + editItem.editText + '</span>';
        charIndex = editItem.endIndex;
    }
    // Add any remaining text after last editItem
    inputHtml += inputText.slice(charIndex);
    outputHtml += inputText.slice(charIndex);
    inputElement.html(inputHtml);
    outputElement.html(outputHtml);
};

/**
 * Only paste in plain text, nothing formatted or images or
 * crazy stuff like that
 */
$('div[contenteditable]').on('paste',function(e) {
    e.preventDefault();
    var pastedText = (e.originalEvent || e).clipboardData.getData('text/plain');
    $(this).text(pastedText);
});
