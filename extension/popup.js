$(document).ready(function() {

    var defaultTargetLang = "Spanish";

    console.log("Calling PHP");
    jQuery.ajax({
        url:'http://localhost/CSCE634Project/extension/php/test.php',
        type: 'GET',
        success: function(response){
            console.log(response);
        }
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