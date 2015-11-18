$(document).ready(function() {
    $('#button').click(function() {
        chrome.runtime.sendMessage({msgId: "toggleExtension"});
    });
});