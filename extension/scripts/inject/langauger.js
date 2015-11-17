var Langauger = Langauger || function(){};

Langauger.init = function(){
	rangy.init();
	console.log("init");
	// clear result box on any click (mousedown)
  	jQuery('body').mousedown(function(event){
  		console.log("MOUSEDOWN", event); 
    	// only act on left clicks (on osx, ctrlKey triggers contextMenu too)
    	if (event.which != 1 || event.ctrlKey) {
      		return true;
    	}    	   	   
  	});

  	// display translation of selection (mouseup)
  	jQuery('body').mouseup(function(event){
  		console.log("MOUSEUP", event);
    	if (event.which != 1 || event.ctrlKey) {
      		return true;
    	}
    	      
      	window.setTimeout(function(){
        	console.log(event);
      	}, 10);    
	});
};

Langauger.boot = function(){
  if (!Langauger.running) {
    Langauger.running = true;
    Langauger.init();
    //Langauger.showMessage('Langauger is activated. Select a phrase to translate it. Alt-click a link to translate its text.');
    window.getSelection().removeAllRanges()
  }
  //Langauger.processSelection();
}

/*document.addEventListener('DOMContentLoaded', function() {
	Langauger.boot();
});	*/

Langauger.setConfig = function(config){
  var defaultConfig = {
    googleTranslateJsonp: true,
    engine: Langauger.engines.googleTranslateFree,
    successCallback: Langauger.callbacks.standardSuccesCallback,
    errorCallback: Langauger.callbacks.standardErrorCallback,
  };

  Langauger.config = jQuery.extend({}, defaultConfig, config);
  console.log("running Langauger.setConfig");
  console.log(Langauger.config);

  return;
}

//============================================================================
// Callbacks
//============================================================================

Langauger.callbacks = {};

/**
 * Handles displaying results from translation engine.
 * @param {string} text - The results from the translation engine.
 * @param {array} expanded - The array of html strings to display on expansion.
 */
Langauger.callbacks.standardSuccessCallback = function(translation, expanded) {
  
};

/**
 * Handles displaying error from translation engine.
 * @param {string} errorMessage - The error message from the translation engine.
 */
Langauger.callbacks.standardErrorCallback = function(errorMessage){
}



//============================================================================
// Translation engines
//============================================================================

Langauger.engines = {};

// Potentially illegitimate use of non-public API; but many other extensions use it too.
Langauger.engines.googleTranslateFree = function(sourceText){
  jQuery.ajax({
    url:'https://translate.google.com/translate_a/single',
    type: 'GET',
    dataType: 'json',
    success: function(response){

      if (response && response.sentences && response.sentences.length > 0) {
        var ret = [];
        var expandRet = [];
        for (var i = 0; i < response.sentences.length; i++) {
          ret.push(response.sentences[i].trans);
        }
        ret = ret.join(" ");

        // google translate sends us definitions only if a single word is searched for
        if (response.dict) {
          for (var i = 0; i < response.dict.length; i++) {
            var def = response.dict[i],
                base = def.base_form,
                type = def.pos,
                terms = def.terms.join(", ");

            // Special case: omit definitions that are identical to translation.
            if (terms != ret) {
              expandRet.push("<em>(" + type + ")</em> " + def.terms.join(", "));
            }
          }
        }
        if (expandRet.length) {
          expandRet = ["<ul class='dict'><li>" + expandRet.join("</li><li>") + "</li></ul>"];
        }
        Langauger.config.successCallback(ret, expandRet);
        return;
      }

      // Google Translate reports 200 in case of error messages
      if (response.error){
        Langauger.config.errorCallback('Google Translate Error ' + response.error.code + ': <br/>' + response.error.message);
      }
      else {
        Langauger.config.errorCallback('Google Translate: unable to parse response.');
      }
    },
    error: function(xhr, status){
      Langauger.config.errorCallback("Google Translate XHR error: <br/>"  + status);
    },
    data: {
      // appear as the official Google Translate chrome extension
      client:'gtx',
      hl:'en-US',
      source:'bubble',
      tk: (Math.floor((new Date).getTime() / 36E5) ^ 123456) + "|" + (Math.floor((Math.sqrt(5) - 1) / 2 * ((Math.floor((new Date).getTime() / 36E5) ^ 123456) ^ 654321) % 1 * 1048576)),
      dt: 'bd',
      dt: 't',
      dj: 1,
      sl: Langauger.config.source,
      tl: Langauger.config.target,
      q: sourceText
    }
  });
}