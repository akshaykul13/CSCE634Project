$(document).ready(function() {

    var host ="http://localhost";
    //var host = "http://ec2-52-1-223-254.compute-1.amazonaws.com";
    var defaultTargetLang = "Spanish";
    $('#preferencesWidget').hide();
    $('#loginWidget').hide();            
    $('#signupMessage').hide();

    // Initialize the options
    chrome.storage.sync.get(['loggedInUserID', 'languagerEnabled', 'langaugerTargetLang', 'wordReplacementEnabled', 'wordReplacementQuizLevel', 'mcqQuizEnabled', 'mcqQuizFrequency'], function(data) {
        if(data.loggedInUserID && data.loggedInUserID != -1) {
            $('#preferencesWidget').show();
            $('#loginWidget').hide();            
        } else {
            $('#preferencesWidget').hide();
            $('#loginWidget').show();
        }        
        $('#extensionEnabled').prop('checked', data.languagerEnabled);  
        $('#targetLangSelect').val(data.langaugerTargetLang || defaultTargetLang);
        $('#wordReplacementCheckbox').prop('checked', data.wordReplacementEnabled);       
        if(data.wordReplacementEnabled) {
            $('#wordReplacementLevelDiv').show();
            $('#wordReplacementLevel').val(data.wordReplacementQuizLevel);
        } else {
            $('#wordReplacementLevelDiv').hide();
        }
        $('#mcqQuizCheckbox').prop('checked', data.mcqQuizEnabled);
        if(data.mcqQuizEnabled) {
            $('#mcqQuizFrequencyDiv').show();
            $('#mcqQuizFrequency').val(data.mcqQuizFrequency);
        } else {
            $('#mcqQuizFrequencyDiv').hide();
        }
        updateRecentWords(data.loggedInUserID);
    });   

    function updateRecentWords(id) {
        var object = new Object();            
        object.id = id;
        console.log(object);
        var jsonString = JSON.stringify(object);
        $.ajax({
            type: 'GET',     
            data: 'jsonString='+jsonString, 
            url: host+'/CSCE634Project/extension/php/getrecentwords.php',     
            success: function(JSONObject) {     
                var recentWords = JSON.parse(JSONObject);   
                var html = '<tbody>';
                for(i = 0; i < recentWords.length; i++) {
                    var translation = translateString(recentWords[i].word, 'en', recentWords[i].language);
                    var row = '<tr><td>'+recentWords[i].word+'</td><td>'+codeToLanguage(recentWords[i].language)+'</td><td>'+translation+'</td><td><div class="progress" style="margin-bottom:0px;"><div class="progress-bar progress-bar-success progress-bar-striped" role="progressbar" aria-valuenow="'+recentWords[i].mastery+'" aria-valuemin="0" aria-valuemax="100" style="width: '+recentWords[i].mastery+'%;">'+recentWords[i].mastery+'%</div></div></td></tr>';
                    html = html + row;              
                }
                html = html + '</tbody>';
                $('.tablesorter-blackice').append(html);
            }
        });
    }

    function codeToLanguage(code) {
        var language;
        switch(code) {
            case 'zh':
                language = 'Chinese';
                break;
            case 'fr':
                language = 'French';
                break;
            case 'de':
                language = 'German';
                break;
            case 'ru':
                language = 'Russian';
                break;
            case 'es':
                language = 'Spanish';
                break;
            default:
                language = 'Spanish';
        }
        return language;
    }
    
    ////////////////////////////////////////////////////////////////////////
    // Login & Registration                                               //
    ////////////////////////////////////////////////////////////////////////
    
    $('#register_button').click(function(){
        var userObject = new Object();
        var firstname = $('#register_firstname').val();
        userObject.firstname = firstname;
        var lastname = $('#register_lastname').val();
        userObject.lastname = lastname;
        var email = $('#register_emailid').val();
        userObject.email = email;
        var password = $('#register_password').val();
        userObject.password = password;
        console.log(userObject);
        var jsonString = JSON.stringify(userObject);
        $.ajax({
            type: 'POST',     
            data: 'jsonString='+jsonString, 
            url: host+'/CSCE634Project/extension/php/register.php',      
            success: function(data) {     
                console.log(data);
                $('#signupMessage').show();
            }
        });
    });
  
    $('#login_button').click(function(){
        var userObject = new Object();    
        var email = $('#login_emailid').val();
        userObject.email = email;
        var password = $('#login_password').val();
        userObject.password = password;
        console.log(userObject);
        var jsonString = JSON.stringify(userObject);
        $.ajax({
            type: 'GET',     
            data: 'jsonString='+jsonString, 
            url: host+'/CSCE634Project/extension/php/login.php',     
            success: function(JSONObject) {     
                console.log(JSONObject);  
                if(JSONObject.status == "Error"){
                    $('#loginStatus').html(JSONObject['reason']);
                }else{
                    chrome.storage.sync.set({'loggedInUserID': JSON.parse(JSONObject)[0].id});       
                    $('#preferencesWidget').show();
                    $("#preferencesWidget").find(".username").text("Welcome Back, "+JSON.parse(JSONObject)[0].firstname )
                    $('#loginWidget').hide();
                }
            }
        });
    });
   
    $('.form').find('input, textarea').on('keyup blur focus', function(e) {
        var $this = $(this),
        label = $this.prev('label');
        if (e.type === 'keyup') {
            if ($this.val() === '') {
                label.removeClass('active highlight');
            } else {
                label.addClass('active highlight');
            }
        } else if (e.type === 'blur') {
            if ($this.val() === '') {
                label.removeClass('active highlight');
            } else {
                label.removeClass('highlight');
            }
        } else if (e.type === 'focus') {
            if ($this.val() === '') {
                label.removeClass('highlight');
            } else if ($this.val() !== '') {
                label.addClass('highlight');
            }
        }
    });   

    $('.tab a').on('click', function(e) {
        e.preventDefault();
        $('#signupMessage').hide();
        $(this).parent().addClass('active');
        $(this).parent().siblings().removeClass('active');
        target = $(this).attr('href');
        $('.tab-content > div').not(target).hide();
        $(target).fadeIn(600);
    });


    ////////////////////////////////////////////////////////////////////////
    // Preferences                                                        //
    //////////////////////////////////////////////////////////////////////// 

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
                chrome.storage.sync.set({'wordReplacementEnabled': wordReplacementQuiz});
                if(wordReplacementQuiz) {
                    $('#wordReplacementLevelDiv').show();
                } else {
                    $('#wordReplacementLevelDiv').hide();
                }
            }
        });                
    });

    $('#wordReplacementLevel').change(function() {           
        chrome.storage.sync.set({'wordReplacementQuizLevel': $('#wordReplacementLevel').val()});
    });

    $('#mcqQuizCheckbox').click(function() {
        chrome.storage.sync.get(['languagerEnabled', 'mcqQuizEnabled'], function(data) {
            if(data.languagerEnabled) {
                var mcqQuiz = $('#mcqQuizCheckbox').prop('checked');
                chrome.storage.sync.set({'mcqQuizEnabled': mcqQuiz});     
                if(mcqQuiz) {
                    $('#mcqQuizFrequencyDiv').show();
                } else {
                    $('#mcqQuizFrequencyDiv').hide();
                }           
            }
        });                
    });

    $('#mcqQuizFrequency').change(function() {           
        chrome.storage.sync.set({'mcqQuizFrequency': $('#mcqQuizFrequency').val()});
    });

    $('#logoutButton').click(function() {
        chrome.storage.sync.set({'loggedInUserID': -1});       
        $('#preferencesWidget').hide();
        $('#loginWidget').show();
    });

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
});