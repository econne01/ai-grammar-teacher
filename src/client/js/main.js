var getOutputText = function generateOutputText(inputText) {
    return inputText;
};

var setOutputText = function setOutputText(outputText) {
    var outputElem = $('#text-output');
    outputElem.text(outputText);
};

var onClick = function onClick() {
    var inputText = $('#text-input').text();
    var outputText = getOutputText(inputText);
    setOutputText(outputText);
    makeRequest('GET', 'http://localhost:8888/mistakify', { inputText: inputText });
};

var makeRequest = function makeRequest(method, url, params) {
    var xmlHttp = new XMLHttpRequest();
    var reqParams = JSON.stringify(params);
    xmlHttp.onreadystatechange = function() { 
        if (xmlHttp.readyState == 4 && xmlHttp.status == 200)
            setOutputText(xmlHttp.responseText);
    }
    xmlHttp.open('POST', url, true); // true for asynchronous 
    xmlHttp.setRequestHeader("Content-type", "application/json; charset=utf-8");
    xmlHttp.send(reqParams);
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
