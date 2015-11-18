$(document).ready(function() {

    var defaultTargetLang = "Spanish";

    // Initialize the options
    chrome.storage.sync.get(['languagerEnabled', 'langaugerTargetLang', 'wordReplacementEnabled', 'wordReplacementQuizLevel'], function(data) {
        $('#extensionEnabled').prop('checked', data.languagerEnabled);  
        $('#targetLangSelect').val(data.langaugerTargetLang || defaultTargetLang);
        $('#wordReplacementCheckbox').prop('checked', data.wordReplacementEnabled);       
        if(data.wordReplacementEnabled) {
            $('#wordReplacementLevelDiv').show();
            $('#wordReplacementLevel').val(data.wordReplacementQuizLevel);
        } else {
            $('#wordReplacementLevelDiv').hide();
        }
    });    

    $('#extensionEnabled').click(function() {
        chrome.storage.sync.get(['languagerEnabled'], function(data) {
            chrome.storage.sync.set({'languagerEnabled': !data.languagerEnabled});       
        });        
        chrome.runtime.sendMessage({msgId: "toggleExtension"});
    });

    $('#targetLangSelect').change(function() {           
        chrome.storage.sync.set({'langaugerTargetLang': $('#targetLangSelect').val()});
        chrome.runtime.sendMessage({msgId: "toggleExtension"});
    });

    $('#wordReplacementCheckbox').click(function() {
        chrome.storage.sync.get(['languagerEnabled', 'wordReplacementEnabled'], function(data) {
            if(data.languagerEnabled) {
                var wordReplacementQuiz = $('#wordReplacementCheckbox').prop('checked');
                console.log(wordReplacementQuiz);
                chrome.storage.sync.set({'wordReplacementEnabled': wordReplacementQuiz});
                if(wordReplacementQuiz) {
                    $('#wordReplacementLevelDiv').show();
                } else {
                    $('#wordReplacementLevelDiv').hide();
                }
            }
        });                
    });
});