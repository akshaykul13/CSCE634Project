$(document).ready(function() {
    // Initialize the on-off extension switch
    chrome.storage.sync.get(['languagerEnabled'], function(data) {
         $('#myonoffswitch').prop('checked', data.languagerEnabled);       
    });    

    $('#myonoffswitch').click(function() {
        chrome.storage.sync.get(['languagerEnabled'], function(data) {
            chrome.storage.sync.set({'languagerEnabled': !data.languagerEnabled});       
        });        
        chrome.runtime.sendMessage({msgId: "toggleExtension"});
    });
});