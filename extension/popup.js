$(document).ready(function() {

    var defaultTargetLang = "Spanish";
    $('#preferencesWidget').hide();
    $('#loginWidget').hide();            

    // Initialize the options
    chrome.storage.sync.get(['loggedInUserID', 'languagerEnabled', 'langaugerTargetLang', 'wordReplacementEnabled', 'wordReplacementQuizLevel'], function(data) {
        if(data.loggedInUserID) {
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
    });   
    
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
            url: 'http://localhost/CSCE634Project/extension/php/register.php',      
            success: function(data) {     
                console.log(data);
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
            url: 'http://localhost/CSCE634Project/extension/php/login.php',     
            success: function(JSONObject) {     
                console.log(JSONObject);  
                if(JSONObject.status == "Error"){
                    $('#loginStatus').html(JSONObject['reason']);
                }else{
                    chrome.storage.sync.set({'loggedInUserID': JSON.parse(JSONObject)[0].id});       
                    $('#preferencesWidget').show();
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