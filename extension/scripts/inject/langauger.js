var Langauger = Langauger || function(){};

// Default options
Langauger.config = {};

Langauger.currentJob = {
    text: '',
    translation: '',
    range: null,
    x:0,
    y:0
};

Langauger.init = function(){
	rangy.init();
	console.log("init");

    var isLangaugerBox = function(target) {
        var target = jQuery(target);
        return (target.attr('id') == 'Langauger-box' || target.parents('#Langauger-box').length);
    }
	// clear result box on any click (mousedown)
  	jQuery('body').mousedown(function(event){
    	// only act on left clicks (on osx, ctrlKey triggers contextMenu too)
    	if (event.which != 1 || event.ctrlKey) {
      		return true;
    	}    	   	   
        
        // if we get this far, dismiss box
        if (jQuery('#Langauger-box').length) {
            // Clear active selection.
            rangy.getSelection().removeAllRanges();
            Langauger.hideTooltip();
        }
  	});

  	// display translation of selection (mouseup)
  	jQuery('body').mouseup(function(event){
    	if (event.which != 1 || event.ctrlKey) {
      		return true;
    	}
    	chrome.storage.sync.get(['loggedInUserID', 'languagerEnabled'], function(data) {
            if(data.languagerEnabled) {
                window.setTimeout(function(){
                    Langauger.translateListener(event, data.loggedInUserID);
                }, 10);    
            }
        });  
	});
};

Langauger.boot = function(){
    if (!Langauger.running) {
        Langauger.running = true;
        Langauger.init();
        chrome.storage.sync.get(['languagerEnabled', 'wordReplacementEnabled', 'wordReplacementQuizLevel'], function(data) {
            if(data.languagerEnabled && data.wordReplacementEnabled) {
                Langauger.wordReplacementQuiz(2);
            }
        });        
        window.getSelection().removeAllRanges()
    }
}

Langauger.setConfig = function(config){
    var defaultConfig = {
        googleTranslateJsonp: true,
        engine: Langauger.engines.googleTranslateFree,
        successCallback: Langauger.callbacks.standardSuccesCallback,
        errorCallback: Langauger.callbacks.standardErrorCallback,
    };

    Langauger.config = jQuery.extend({}, defaultConfig, config);    
    return;
}

//============================================================================
// Listener
//============================================================================


Langauger.translateListener = function(event, id){
    // only pay attention to left-clicks
    if (event.button!==0) {
        return false;
    }

    Langauger.processSelection(id);
}

Langauger.processSelection = function(id) {

    // no text is selected
    if (rangy.getSelection().isCollapsed){
        return;
    }

    // if there is a selection, push it to its bounding limits
    var r = rangy.getSelection().getRangeAt(0);
    Langauger.expandToWordBoundary(r);
    rangy.getSelection().setSingleRange(r);

    var currentJob = Langauger.currentJob;
    currentJob.range = r;

    // Instead of currentJob.range.toString(), we use the native method as its closer
    // to what the user expects than the rangy version.
    var selection = currentJob.range.nativeRange.toString();

    if (typeof selection !== 'undefined' && /\S/.test(selection) && /\D/.test(selection)){
        currentJob.text = Langauger.filterSelection(selection);
        var rects = currentJob.range.nativeRange.getClientRects();

        // In Chrome, these are ordered by top ascending, so we take the last one.
        // This corresponds to the "most specific" "bottom-most" rectangle, which should
        // contain the end of the selection and not much else.
        // To debug, try calling:
        //   Langauger.drawRectangles(rects);

        // Ocasionally, the range will end at the beginning of a node that doesn't actually
        // contain any of the selected text (just in case?). In this case, we need to position the tooltip
        // relative to the penultimate node. We check for this via range.endOffset property,
        // which specifies how many characters of the end node are included in the selection.
        // See https://dl.dropbox.com/u/29440342/screenshots/HKANHFEW-2014.06.16-11-14-06.png
        var lastIndex =  (currentJob.range.endOffset == 0) ? rects.length - 2 : rects.length - 1;

        // Align the tooltip under the last rectangle.
        currentJob.y = rects[lastIndex].bottom;
        currentJob.x = rects[lastIndex].left;

        // Each inline span element gets its own rectangle too, so we must align
        // tooltip with the left-most rectangle.
        // See https://dl.dropbox.com/u/29440342/screenshots/MPABGIGR-2014.06.16-12-09-53.png
        for (var i = 0; i < lastIndex; i++) {
          if (currentJob.x > rects[i].left) {
            currentJob.x = rects[i].left;
          }
        }

        //send request to Google
        Langauger.invokeTranslationEngine(currentJob);
        //save the word in the database
        Langauger.saveWord(currentJob.text, id);
    }
}

Langauger.invokeTranslationEngine = function(currentJob){
    Langauger.config.engine(currentJob.text);
}

Langauger.saveWord = function(text, id) {
    // Check for word, if sentence return
    if(text.indexOf(" ") != -1) {
        return;
    }
    chrome.runtime.sendMessage({msgId: "saveLangaugerWord", id: id, text: text});
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
    console.log(translation);
    console.log(expanded);
    var currentJob = Langauger.currentJob,
        text = currentJob.text;

    //TODO: simplify this
    currentJob.translation = translation;

    var fromCode = Langauger.config.source,
        toCode = Langauger.config.target,        
        gtUrl = Langauger.getGoogleTranslateUrl(fromCode, toCode, currentJob.text);

    if (expanded.length) {
        currentJob.translation = currentJob.translation + "<div class='ellipsis'>…</div>";
    }

    expanded = expanded || [];
    expanded.push('<a target="_blank" href="' + gtUrl + '">G</a>');

    console.log("Langauger has received translation for the following text:");
    console.log(text);

    chrome.runtime.sendMessage({msgId: "getContextualSentences", word: translation, language: Langauger.config.target});

    Langauger.showTooltipExpanded(currentJob.translation, expanded, currentJob.x, currentJob.y);
};

/**
 * Handles displaying error from translation engine.
 * @param {string} errorMessage - The error message from the translation engine.
 */
Langauger.callbacks.standardErrorCallback = function(errorMessage){
    console.log("Google Error");
    console.log(expanded);
}

//============================================================================
// Tooltip/message helpers
//============================================================================

Langauger.getGoogleTranslateUrl = function(fromCode, toCode, query) {
    query = encodeURIComponent(query);
    return "https://translate.google.com#" + fromCode + "/" + toCode + "/" + query;
}

/**
 * Display Langauger tooltip with click to expand.
 * @param {string} text - The contents of the tooltip.
 * @param {expanded} html - The html or jquery div to show in initially collapsed state.
 * @param {int} x - The x-coordinate of tooltip, relative to screen.
 * @param {int} y - The y-coordinate of tooltip, relative to screen.
 */
Langauger.showTooltipExpanded = function(translation, expanded, x, y){
    Langauger.hideTooltip();

    var el = jQuery('<div id="Langauger-box" class="Langauger-box">').html(translation);

    if (expanded) {
        jQuery('<div class="expanded collapsed">').append(expanded).appendTo(el);
    }

    Langauger.drawOverlay(el, x -5, y + 3);
};

Langauger.drawOverlay = function(el, x, y){
    x = x + jQuery(document).scrollLeft();
    y = y + jQuery(document).scrollTop();

    // if body positioned relative or absolute; then need to account for its offsets
    if (jQuery.css(document.body, "position") != "static") {
        x = x - jQuery('body').offset().left;
        y = y - jQuery('body').offset().top;
    }

    el.css( { 'left': x + 'px', 'top':  y + 'px' }).appendTo('body')
}

Langauger.hideTooltip = function() {
    jQuery('#Langauger-box').remove();
}

Langauger.showMessage = function(message) {
    Langauger.showTooltipExpanded(message, null, 10, 10);
    jQuery('.Langauger-box').fadeOut(5000 || 0, function(){
        jQuery(this).remove();
    });
}

//============================================================================
// Translation engines
//============================================================================

Langauger.engines = {};

// Potentially illegitimate use of non-public API; but many other extensions use it too.
Langauger.engines.googleTranslateFree = function(sourceText){
    chrome.storage.sync.get(['langaugerTargetLang'], function(data) {
        console.log(data);
        switch(data.langaugerTargetLang) {
            case 'Chinese':
                Langauger.config.target = 'zh';
                break;
            case 'French':
                Langauger.config.target = 'fr';
                break;
            case 'German':
                Langauger.config.target = 'de';
                break;
            case 'Russian':
                Langauger.config.target = 'ru';
                break;
            case 'Spanish':
                Langauger.config.target = 'es';
                break;
            default:
                Langauger.config.target = 'es';
                break;
        }
        console.log('Translating to ' + Langauger.config.target);
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
    });
}

//============================================================================
// Rangy helpers
//============================================================================

//
Langauger.filterSelection = function(text) {
    // collapse multiple blank lines
    return text.replace(/\n\s*\n/g, '\n\n');
}

// helper function for translateListener, pushes a range to its boundaries
Langauger.expandToWordBoundary = function(range){
  // TODO: find a cleaner (unicode aware) way of doing this.

  var nonBoundaryPattern = /[^\s:!.,\"\(\)«»%$]/, // any character except punctuation or space
      startNodeValue = range.startContainer.nodeValue,  //text contents of startContainer
      endNodeValue = range.endContainer.nodeValue,  //text contents of endContainer
      start = range.startOffset, //position of start of selection in startContainer; runs between 0 and length-1
      end = range.endOffset; //position of end of selection in endContainer; runs between 1 and length

  if (startNodeValue) {
    while (start > 0 && nonBoundaryPattern.test(startNodeValue[start-1])){
      start--;
    }
  }
  if (endNodeValue) {
    while (end < endNodeValue.length && nonBoundaryPattern.test(endNodeValue[end])){
      end++;
    }
  }
  range.setStart(range.startContainer,start);
  range.setEnd(range.endContainer,end);
  return range;
};

//============================================================================
// Word Replacement Quiz
//============================================================================

Langauger.wordReplacementQuiz = function(difficulty) {
    
    // Translate text
    function translate(from, to, text, cb) {
        cb(translateString(text, 'en', getLanguageCode(to)));
    }

    // Split Functions
    function splitByWord(difficulty, language) {
      $('p').each(function() {
        var word = $(this).getWord(difficulty);
        if(!word) {
            return;
        }
        var that = this;
        translate('en', language, word, function (translatedWord) {
          $(that).html($(that).html().replace(/<\/*.+?>/g, '').replace(new RegExp("\\b" + word + "\\b", 'i'), "<span class='translate_14385' style='background-color: #FFFAB0; color: #000000' data-original=\"" + word + "\">" + translatedWord + "</span>"));
        });
      });
    }

    function splitBySentence(difficulty, probability, language) {
      $('p').each(function() {
        var rand = Math.random() * 10;
        if (rand < probability) {
          var sentence = $(this).getSentence(difficulty);
          if(!sentence) {
            return;
        }
          var that = this;
          translate('en', language, sentence, function (translatedSentence) {
            $(that).html($(that).html().replace(/<\/*.+?>/g, '').replace(sentence, "<span class='translate_14385' style='background-color: #FFFAB0; color: #000000' data-original=\"" + sentence + "\">" + translatedSentence + "</span>"));            
          });
        }
      });
    }

    chrome.storage.sync.get(['langaugerTargetLang'], function(data) {
        if (difficulty == 1) {
          splitByWord('easy', data.langaugerTargetLang);
        } else if (difficulty == 2) {
          splitByWord('hard', data.langaugerTargetLang);
        } else if (difficulty == 3) {
          splitBySentence('easy', 4, data.langaugerTargetLang);
        } else if (difficulty == 4) {
          splitBySentence('medium', 6, data.langaugerTargetLang);
        } else if (difficulty == 5) {
          splitBySentence('hard', 11, data.langaugerTargetLang);
        }
    });    
}

//============================================================================
// MCQ Quiz
//============================================================================

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    // flag to designate type of message
    if (request.msgId != 'showMCQQuiz') {
        return;
    }     
    console.log(request);
    Langauger.mcqQuiz(request.word, request.language, request.options);

});

Langauger.mcqQuiz = function(word, language, options) {
    var translatedWord;
    chrome.storage.sync.get(['langaugerTargetLang', 'mcqQuizFrequency'], function(data) {
        var randomNumber = Math.floor((Math.random() * 10) + 1);
        if(randomNumber > 2 * data.mcqQuizFrequency) {
            console.log('not showing mcq');
            return;
        }
        translatedWord = translateString(word, 'en', getLanguageCode(data.langaugerTargetLang));        
        var innerDiv = '<span class="question">'+translatedWord+'</span><ul class="answers">';
        var option1 = '<div><input class="langaugerRadio" type="radio" name="q" value="1" id="q1"><label for="q1">'+word+'</label></div>';
        var optionsArray = [];
        optionsArray.push(option1);        
        for(i = 0; i < options.length; i++) {
            optionsArray.push('<div><input class="langaugerRadio" type="radio" name="q" value="'+(i+2)+'" id="q'+(i+2)+'"><label for="q'+(i+2)+'">'+options[i].word+'</label></div>');
        }
        shuffle(optionsArray);                       
        innerDiv = innerDiv + optionsArray[0] + optionsArray[1] + optionsArray[2] + optionsArray[3] + '</ul>';
        innerDiv = innerDiv + '<div id="mcqCorrectAnswer" style="display:none;margin-top: 100px;padding:20px;">Correct Answer</div>';
        innerDiv = innerDiv + '<div id="mcqWrongAnswer" style="display:none;margin-top: 100px;padding:20px;">Incorrect Answer</div>';
        innerDiv = innerDiv + '<button class="langauger-btn-style" type="button" id="submitMCQQuiz">Submit</button>';
        innerDiv = innerDiv + '<a title="Close" class="close" id="closeMCQQuiz">X</a>';
        var el = jQuery('<div id="Langauger-mcq-box" class="Langauger-box" style="width:200px">').html(innerDiv);
        el.css( { 'left': ($('body').width()-225) + 'px', 'top':  '20px' }).appendTo('body');
    });    
}

$('body').on('click', '#submitMCQQuiz', function(){
    console.log('submit clicked');
    var optionSelected = $("#Langauger-mcq-box input[type='radio']:checked").val();    
    if(optionSelected == 1) {
        $("#mcqCorrectAnswer").show();
        $("#mcqWrongAnswer").hide();
        var word = $("#Langauger-mcq-box input[type='radio']:checked").next().text();
        chrome.storage.sync.get(['loggedInUserID'], function(data) {
            chrome.runtime.sendMessage({msgId: "updateMastery", id: data.loggedInUserID, word: word});
        });
    } else {
        $("#mcqWrongAnswer").show();
        $("#mcqCorrectAnswer").hide();
    }
    $('#submitMCQQuiz').hide();
});

$('body').on('click', '#closeMCQQuiz', function(){
    $('#Langauger-mcq-box').hide();
});

//============================================================================
// Contextual Sentences
//============================================================================

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    // flag to designate type of message
    if (request.msgId != 'showContextualSentences') {
        return;
    }     
    console.log(request);
    Langauger.contextualSentences(request.sentences, request.targetLang);

});

Langauger.contextualSentences = function(sentences, targetLang) {
    var innerDiv = '<ol>';    
    var sentencesArray = [];
    for(i = 0; i < sentences.length; i++) {
        innerDiv = innerDiv + '<div style="margin-top:20px"><div>'+sentences[i]+'</div>';
        innerDiv = innerDiv + '<span style="text-align:center;">&#x296f;</span>'
        innerDiv = innerDiv + '<div>'+translateString(sentences[i], getLanguageCode(targetLang), 'en')+'</div><div>';
    }
    innerDiv = innerDiv + '</ol>';    
    innerDiv = innerDiv + '<a id="closeContextualSentencesButton" class="close">X</a>';
    var el = jQuery('<div id="Langauger-contextual-box" class="Langauger-box" style="width:300px">').html(innerDiv);
    var x = $('body').width() - 325;
    var y = 25;
    x = x + jQuery(document).scrollLeft();
    y = y + jQuery(document).scrollTop();
    el.css({ 'left': x + 'px', 'top':  y + 'px' }).appendTo('body');
}

$('body').on('click', '#closeContextualSentencesButton', function(){
    $('#Langauger-contextual-box').hide();
});



function shuffle(o){
    for(var j, x, i = o.length; i; j = Math.floor(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
    return o;
}

function getLanguageCode(language) {
    var code;
    switch(language) {
        case 'Chinese':
            code = 'zh';
            break;
        case 'French':
            code = 'fr';
            break;
        case 'German':
            code = 'de';
            break;
        case 'Russian':
            code = 'ru';
            break;
        case 'Spanish':
            code = 'es';
            break;
        case 'zh':
            code = 'zh';
            break;
        case 'fr':
            code = 'fr';
            break;
        case 'de':
            code = 'de';
            break;
        case 'ru':
            code = 'ru';
            break;
        case 'es':
            code = 'es';
            break;
        default:
            code = 'es';
            break;
    }
    return code;
}

function translateString(sourceText, sourceLang, destLang) {    
    var translation;
    jQuery.ajax({
        url:'https://translate.google.com/translate_a/single',
        type: 'GET',
        dataType: 'json',
        async: false,
        success: function(response){    
            console.log(response);        
            if (response && response.sentences && response.sentences.length > 0) {
                var ret = [];
                var expandRet = [];
                for (var i = 0; i < response.sentences.length; i++) {
                    ret.push(response.sentences[i].trans);
                }
                ret = ret.join(" ");                
                translation =  ret;
            }

            // Google Translate reports 200 in case of error messages
            if (response.error){
                console.log(response);
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
            sl: sourceLang,
            tl: destLang,
            q: sourceText
        }
    });    
    return translation;
}