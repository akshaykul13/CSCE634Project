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
    //Langauger.showMessage('BabelFrog is activated. Select a phrase to translate it. Alt-click a link to translate its text.');
    window.getSelection().removeAllRanges()
  }
  //Langauger.processSelection();
}

document.addEventListener('DOMContentLoaded', function() {
	Langauger.boot();
});	