var ChromeLangauger = {};
var currentTabID;

var host ="http://localhost";
//var host = "http://ec2-52-1-223-254.compute-1.amazonaws.com";

var settings = new Store("settings", {
    "sourceLang": "en",
    "targetLang": "fr",
    "engine": "google_free",
    "googleApiKey": "",
    "vocalize": true
});

ChromeLangauger.capitalize = function(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
};


ChromeLangauger.setBadge = function(tabId, lang) {
    chrome.browserAction.setBadgeText({
        text: ChromeLangauger.capitalize(lang),
        tabId: tabId
    });
}

ChromeLangauger.removeBadge = function(tabId) {
    chrome.browserAction.setBadgeText({
        text: "",
        tabId: tabId
    });
}

ChromeLangauger.settings = function(settings){
    var ret = {
        sourceLang: settings.get('sourceLang'),
        targetLang: settings.get('targetLang'),
        googleApiKey: settings.get('googleApiKey'),
        vocalize: settings.get('vocalize')
    };
    return ret;
}

ChromeLangauger.activate = function(tab) {	
	chrome.tabs.sendMessage(tab.id, { msgId: "isLangaugerLoaded" }, function(result) {
        // not already loaded
        if (typeof(result) == "undefined") {
            chrome.storage.sync.get(['languagerEnabled', 'langaugerTargetLang'], function(data) {
                if(data.languagerEnabled) {
                    ChromeLangauger.setBadge(tab.id, data.langaugerTargetLang.substring(0,2));
                } else {
                    ChromeLangauger.removeBadge(currentTabID);
                }            
            });

            var files = ["scripts/inject/jquery.min.js", "scripts/inject/rangy-core.js", "scripts/inject/parser.js", "scripts/inject/langauger.js"];
            for (var i = 0; i < files.length; i++) {
                chrome.tabs.executeScript(tab.id, {file: files[i]});
            }
            chrome.tabs.insertCSS(tab.id, {file: "css/langauger.css"});
            chrome.tabs.executeScript(tab.id, {file: "scripts/inject/inject.js"}, function(){
                chrome.tabs.sendMessage(tab.id, {
                    msgId: "bootLangauger",
                    config: ChromeLangauger.settings(settings)
                });
            });
            // The initial click on the browserAction (Langauger icon) will activate it on the current tab.
             // Subsequet clicks will display the settings popup, which includes a CSS file to clean it up.
            chrome.browserAction.setPopup({
                tabId: tab.id,
                popup: 'popup.html'
            });
        } else {
          // langauger is already activated, but might need to be re-triggered (eg in case of context menu)
            chrome.tabs.sendMessage(tab.id, {
                msgId: "bootLangauger",
                config: ChromeLangauger.settings(settings)
            });
        }
    });
};

chrome.browserAction.onClicked.addListener(ChromeLangauger.activate);


ChromeLangauger.play = function(url) {
    if (typeof(ChromeLangauger.currentlyPlaying) !== "undefined") {
        ChromeLangauger.currentlyPlaying.pause();
    }
    ChromeLangauger.currentlyPlaying = new Audio(url);
    ChromeLangauger.currentlyPlaying.play();
}

/**
 * Listens for vocalization requests from content scripts.
 * This must be done in background.js since otherwise html5 audio doesn't work cross-domain.
 */
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    // flag to designate type of message
    if (request.msgId != 'vocalize') {
        return;
    }

    // Try to play the text (note that there's a 100 char limit; should
    // chunk on sentences.
    var text = encodeURIComponent(request.text);
    var targetLang = getCodeForVocalize(request.targetLang);
    var url = 'https://translate.google.com/translate_tts?ie=UTF-8&tl='
            + settings.get('targetLang')
            + '&total=1&idx=0&textlen=77&client=t&prev=input&q='
            + text;
    // Voice RSS API, r = -5 slows the speed (http://www.voicerss.org/api/documentation.aspx)
    var url1 = 'http://api.voicerss.org/?key=6e069bbaccb64cedac38c4b63c325dd4&src=' + text + '&hl=' + targetLang + '&r=-5';
    console.log("vocalizing", url1);
    ChromeLangauger.play(url1);
});

function getCodeForVocalize(lang) {
    var code;
    switch(lang) {
        case 'Chinese':
            code = 'zh-cn';
            break;
        case 'French':
            code = 'fr-fr';
            break;
        case 'German':
            code = 'de-de';
            break;
        case 'Russian':
            code = 'ru-ru';
            break;
        case 'Spanish':
            code = 'es-es';
            break;
        case 'zh':
            code = 'zh-cn';
            break;
        case 'fr':
            code = 'fr-fr';
            break;
        case 'de':
            code = 'de-de';
            break;
        case 'ru':
            code = 'ru-ru';
            break;
        case 'es':
            code = 'es-es';
            break;
        default:
            code = 'es-es';
            break;
    }
    return code;
}


chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    // flag to designate type of message
    if (request.msgId != 'toggleExtension') {
        return;
    }
    chrome.storage.sync.get(['languagerEnabled', 'langaugerTargetLang'], function(data) {
        if(data.languagerEnabled) {
            ChromeLangauger.setBadge(currentTabID, data.langaugerTargetLang.substring(0,2));
        } else {
            ChromeLangauger.removeBadge(currentTabID);
        }
    });    
});

chrome.tabs.onUpdated.addListener(function(tabId , info) {
    console.log(info);
    if (info.status == "complete") {
        currentTabID = tabId;
        ChromeLangauger.activate({id: tabId});
        mcqQuiz(tabId);
    }
});

function mcqQuiz(tabId) {
    chrome.storage.sync.get(['loggedInUserID', 'languagerEnabled', 'langaugerTargetLang', 'mcqQuizEnabled'], function(data) {
        if(data.languagerEnabled && data.mcqQuizEnabled) {
            var object = new Object();            
            object.id = data.loggedInUserID;
            object.language = getLanguageCode(data.langaugerTargetLang);
            var jsonString = JSON.stringify(object);
            $.ajax({
                type: 'GET',     
                data: 'jsonString='+jsonString, 
                url: host+'/CSCE634Project/extension/php/mcqquiz.php',     
                success: function(JSONObject) {     
                    var result = JSON.parse(JSONObject);
                    console.log(result);
                    chrome.tabs.sendMessage(tabId, {
                        msgId: "showMCQQuiz",
                        word: result[0].word,
                        language: result[0].language,
                        options: result[1]
                    });
                }
            });   
        }
    });
}

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    // flag to designate type of message
    if (request.msgId != 'saveLangaugerWord') {
        return;
    }
    console.log("Saving Word");
    console.log(request);
    chrome.storage.sync.get(['langaugerTargetLang'], function(data) {
        var object = new Object();            
        object.id = request.id;
        object.text = request.text;        
        object.language = getLanguageCode(data.langaugerTargetLang);
        var jsonString = JSON.stringify(object);
        $.ajax({
            type: 'POST',     
            data: 'jsonString='+jsonString, 
            url: host+'/CSCE634Project/extension/php/saveword.php',     
            success: function(JSONObject) {     
                console.log(JSONObject);              
            }
        });   
    });    
});

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    // flag to designate type of message
    if (request.msgId != 'updateMastery') {
        return;
    }
    console.log("Updating Mastery");
    chrome.storage.sync.get(['langaugerTargetLang'], function(data) {
        var object = new Object();            
        object.id = request.id;
        object.word = request.word;        
        object.language = getLanguageCode(data.langaugerTargetLang);
        var jsonString = JSON.stringify(object);
        $.ajax({
            type: 'POST',     
            data: 'jsonString='+jsonString, 
            url: host+'/CSCE634Project/extension/php/updatemastery.php',     
            success: function(JSONObject) {     
                console.log(JSONObject);              
            }
        });   
    });    
});

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    // flag to designate type of message
    if (request.msgId != 'getContextualSentences') {
        return;
    }
    console.log("Getting Contextual Sentences");    
    chrome.tabs.query(
        {currentWindow: true, active : true},
        function(tabArray){
            currentTabID = currentTabID || tabArray[0].id;
        }
    );  
    chrome.storage.sync.get(['langaugerTargetLang'], function(data) {
        var object = new Object();                    
        object.word = request.word;        
        object.language = getLanguageCodeForContextual(data.langaugerTargetLang);
        console.log(object);
        var jsonString = JSON.stringify(object);
        $.ajax({
            type: 'GET',     
            data: 'jsonString='+jsonString, 
            url: host+'/CSCE634Project/extension/php/getcontextualsentences.php',     
            success: function(JSONObject) {     
                if(JSONObject) {
                    var result = JSON.parse(JSONObject);
                    chrome.tabs.sendMessage(currentTabID, {
                        msgId: "showContextualSentences",
                        sentences: result,
                        targetLang: data.langaugerTargetLang
                    });           
                }                
            }
        });   
    });    
});

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
        default:
            code = 'es';
            break;
    }
    return code;
}

function getLanguageCodeForContextual(language) {
    var code;
    switch(language) {
        case 'Chinese':
            code = 'zho';
            break;
        case 'French':
            code = 'fra';
            break;
        case 'German':
            code = 'deu';
            break;
        case 'Russian':
            code = 'rus';
            break;
        case 'Spanish':
            code = 'spa';
            break;
        default:
            code = 'spa';
            break;
    }
    return code;
}


