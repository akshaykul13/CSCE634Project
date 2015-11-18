$(document).ready(function() {

    $('#button').click(function() {
        chrome.storage.sync.get(['languagerEnabled'], function(data) {
            chrome.storage.sync.set({'languagerEnabled': !data.languagerEnabled});       
        });        
        chrome.runtime.sendMessage({msgId: "toggleExtension"});
    });
});