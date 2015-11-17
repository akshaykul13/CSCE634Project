/**
 * Listener to confirm that given tab has Langauger loaded.
 */
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    console.log("asking if loaded");
    console.log(request);
    if (request.msgId == 'isLangaugerLoaded') {
    sendResponse(true);
  }
});

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  // flag to designate type of message
  if (request.msgId != 'bootLangauger') {
    return;
  }

  /**
   * Run BabelFish.
   **/
  jQuery(function($){
    Langauger.setConfig(makeConfig(request.config));
    Langauger.boot();
  });

});

/*
 * Maps chrome extension config to Langauger config
 */
function makeConfig(config){

  // Override standardSuccesCallback to also play audio.
  var extensionSuccessCallback = function(translation, expanded) {
    Langauger.callbacks.standardSuccessCallback(translation, expanded);
    if (Langauger.config.vocalize) {
      console.log('sending message vocalize');
      // vocalize must be run from background.js
      chrome.runtime.sendMessage({msgId: "vocalize", text: Langauger.currentJob.text});
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