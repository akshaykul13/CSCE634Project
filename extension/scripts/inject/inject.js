/**
 * Listener to confirm that given tab has Langauger loaded.
 */
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {    
    if (request.msgId == 'isLangaugerLoaded') {
        sendResponse(true);
    }
});

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    // flag to designate type of message
    if (request.msgId != 'bootLangauger') {
        return;
    } 

    jQuery(function($){
        Langauger.setConfig(makeConfig(request.config));
        Langauger.boot();
    });
});

/*
 * Maps chrome extension config to Langauger config
 */
function makeConfig(config){
    console.log(config);
    // Override standardSuccesCallback to also play audio.
    var extensionSuccessCallback = function(translation, expanded) {
        console.log("extension callback");
        Langauger.callbacks.standardSuccessCallback(translation, expanded);
        console.log(Langauger.config.vocalize);
        if (Langauger.config.vocalize) {
            console.log('sending message vocalize');
            // vocalize must be run from background.js
            chrome.runtime.sendMessage({msgId: "vocalize", text: translation, targetLang: Langauger.config.target});
        }
    }
    var ret = {
        source: config.sourceLang,
        target: config.targetLang,
        engine: Langauger.engines.googleTranslateFree, // TODO: make this an option in the UI
        successCallback: extensionSuccessCallback,
        googleApiKey: config.googleApiKey,
        googleTranslateJsonp: false,
        vocalize: config.vocalize
    }
    return ret;
}