/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

 //publish this content to the following url via HTTP GET + query string
var serviceUrl = 'http://localhost:8080/services/eventing?content=';

const ENABLE_AHREF=true;
const ENABLE_BUTTONS=true;
const ENABLE_RADIO=true;
const ENABLE_KEYPRESS=true;


(function (funcName, baseObj) {
    // The public function name defaults to window.docReady
    // but you can pass in your own object and own function name and those will be used
    // if you want to put them in a different namespace
    funcName = funcName || "docReady";
    baseObj = baseObj || window;
    var readyList = [];
    var readyFired = false;
    var readyEventHandlersInstalled = false;

    // call this when the document is ready
    // this function protects itself against being called more than once
    function ready() {
        if (!readyFired) {
            // this must be set to true before we start calling callbacks
            readyFired = true;
            for (var i = 0; i < readyList.length; i++) {
                // if a callback here happens to add new ready handlers,
                // the docReady() function will see that it already fired
                // and will schedule the callback to run right after
                // this event loop finishes so all handlers will still execute
                // in order and no new ones will be added to the readyList
                // while we are processing the list
                readyList[i].fn.call(window, readyList[i].ctx);
            }
            // allow any closures held by these functions to free
            readyList = [];
        }
    }

    function readyStateChange() {
        if (document.readyState === "complete") {
            ready();
        }
    }

    // This is the one public interface
    // docReady(fn, context);
    // the context argument is optional - if present, it will be passed
    // as an argument to the callback
    baseObj[funcName] = function (callback, context) {
        if (typeof callback !== "function") {
            throw new TypeError("callback for docReady(fn) must be a function");
        }
        // if ready has already fired, then just schedule the callback
        // to fire asynchronously, but right away
        if (readyFired) {
            setTimeout(function () {
                callback(context);
            }, 1);
            return;
        } else {
            // add the function and context to the list
            readyList.push({fn: callback, ctx: context});
        }
        // if document already ready to go, schedule the ready function to run
        if (document.readyState === "complete") {
            setTimeout(ready, 1);
        } else if (!readyEventHandlersInstalled) {
            // otherwise if we don't have event handlers installed, install them
            if (document.addEventListener) {
                // first choice is DOMContentLoaded event
                document.addEventListener("DOMContentLoaded", ready, false);
                // backup is window load event
                window.addEventListener("load", ready, false);
            } else {
                // must be IE
                document.attachEvent("onreadystatechange", readyStateChange);
                window.attachEvent("onload", ready);
            }
            readyEventHandlersInstalled = true;
        }
    }
})("docReady", window);


document.querySelector('body').addEventListener('click', function(event) {
  if (ENABLE_BUTTONS &&  event.target.tagName.toLowerCase() === 'button') {
    // do your action on your 'li' or whatever it is you're listening for
		handleEvent(event);
  } else if (ENABLE_BUTTONS && event.target.tagName.toLowerCase() === 'input') {
	    var type = event.target.getAttribute('type') === 'button' || 'submit'; // Submit is the default
        if (type) {
            handleEvent(event);
        } 
  } else if (ENABLE_AHREF && event.target.tagName.toLowerCase() === 'a') {
	    handleEvent(event);
  } else if (ENABLE_RADIO && event.target.tagName.toLowerCase() === 'input') {
	    var type = event.target.getAttribute('type') === 'radio'; 
        if (type) {
            handleEvent(event);
        }
  } 
  
});

document.querySelector('body').addEventListener('keyup', function(event) {
  if (ENABLE_KEYPRESS &&  event.target.tagName.toLowerCase() === 'input') {
    // do your action on your 'li' or whatever it is you're listening for
		handleEvent(event);
  } 
  
});


//does this on doc start
docReady(function () {
   /* // code here
    //find all buttons
    var buttons = document.getElementsByTagName('button');
    for (var i = 0; i < buttons.length; i++) {
        var button = buttons[i];
        var type = button.getAttribute('type') || 'submit'; // Submit is the default
        if (type) {
            button.addEventListener("click", handleEvent);
        }
    }

	//all inputs buttons
    buttons = document.getElementsByTagName('input');
    for (var i = 0; i < buttons.length; i++) {
        var button = buttons[i];
        var type = button.getAttribute('type') === 'button'; // Submit is the default
        if (type) {
            button.addEventListener("click", handleEvent);
        }
    }
	//TODO links 
*/
});



function isEmpty(str) {
    return (!str || 0 === str.length);
}

function callbackHttpEvent(error, event, statusCode) {
    window.console && window.console.log(JSON.stringify(event) + ' failed to send to server ' + error + ' status code was ' + statusCode);
}

//on click event handler
function handleEvent(element) {
    var event = {};
	event.elementTag = '';
	event.outerText='';
	 event.elementId='';
    event.location = window.location.href;

    if (!isEmpty(element.currentTarget.id))
        event.elementId = element.currentTarget.id;
	if (!isEmpty(element.target.id))
        event.elementId = element.target.id;
	

    if (!isEmpty(element.currentTarget.name))
        event.elementName = element.currentTarget.name;
    if (!isEmpty(element.target.name))
        event.elementName = element.target.name;
	
	
    if (!isEmpty(element.currentTarget.localName))
        event.elementTag = element.currentTarget.localName;
	if (!isEmpty(element.target.tagName))
		event.elementTag =  event.elementTag +  ' ' + element.target.tagName
	
    if (!isEmpty(element.currentTarget.outerText))
        event.outerText = element.currentTarget.outerText;
	 if (!isEmpty(element.target.innerHTML))
        event.outerText = element.target.innerHTML;
	
	
	if (!isEmpty(element.target.value))
        event.outerText = event.outerText + ' '  +element.target.value;
	
	
    if (!isEmpty(element.currentTarget.type))
        event.elementType = element.currentTarget.type;
	
    if (!isEmpty(element.currentTarget.value))
        event.elementValue = element.currentTarget.value;
	if (!isEmpty(element.target.value))
        event.elementValue = element.target.value;
	
	
    event.timeStamp = (new Date).getTime();


    window.console && window.console.log(JSON.stringify(event) + ' was clicked');

    sendEvent(event);
}

//sends the event data to a web service
function sendEvent(event) {
    var theUrl = serviceUrl + JSON.stringify(event);
    var xmlHttp = new XMLHttpRequest();
    try {
        xmlHttp.onreadystatechange = function () {
            if (xmlHttp.readyState === 4 && xmlHttp.status === 200)
                callbackHttpEvent(xmlHttp.responseText, event, xmlHttp.status);
        };

        xmlHttp.onerror = function (e) {
            callbackHttpEvent(xmlHttp, event, xmlHttp.status);
        };

        xmlHttp.open("GET", theUrl, true); // true for asynchronous 
        xmlHttp.send(null);
    } catch (e) {
        callbackHttpEvent(xmlHttp, event, xmlHttp.status);
    }
}




/*
 * https://stackoverflow.com/a/5202999/1203182
 * overrides xhr requests to capture the fact that we loaded something
 */
function addXMLRequestCallback(callback) {
    var oldSend, i;
    var oldOpen;

    // create a callback queue
    XMLHttpRequest.callback = callback;
    // store the native send()
    oldSend = XMLHttpRequest.prototype.send;
    // override the native send()

    oldOpen = XMLHttpRequest.prototype.open;
    XMLHttpRequest.prototype.open = function () {
        this.injectedAction = arguments[0];
        this.injectedUrl = arguments[1];
        oldOpen.apply(this, arguments);
    };
    XMLHttpRequest.prototype.send = function () {
        // process the callback queue
        // the xhr instance is passed into each callback but seems pretty useless
        // you can't tell what its destination is or call abort() without an error
        // so only really good for logging that a request has happened
        // I could be wrong, I hope so...
        // EDIT: I suppose you could override the onreadystatechange handler though
        if (XMLHttpRequest.callback) {
            //TODO prevent triggering on our outbound requests
            XMLHttpRequest.callback(this, arguments);
        }
        // call the native send()
        oldSend.apply(this, arguments);
    }

}

// e.g.
addXMLRequestCallback(function (xhr, args) {
    var event = {};
    event.location = window.location.href;
    event.method = 'xhrRequest';
    event.target = xhr.injectedUrl;
    event.action = xhr.injectedAction;
    event.timeStamp = (new Date).getTime();


    window.console && window.console.log(JSON.stringify(event) + ' addXMLRequestCallback');
    if (event.target.indexOf(serviceUrl) === -1)
        sendEvent(event);
});

//history changes
window.addEventListener('popstate', function (e) {
    //this doesn't seem to be working
    console.log("location: " + document.location + ", state: " + JSON.stringify(e.state));
    var event = {};
    event.location = window.location.href;
    event.method = 'window.location change';
    event.target = document.location;
    event.action = JSON.stringify(e.state);
    event.timeStamp = (new Date).getTime();


    window.console && window.console.log(JSON.stringify(event) + ' popstate');

    sendEvent(event);
});

//this page just changed
window.addEventListener("beforeunload", function (e) {
    console.log("location: " + document.location + ", state: " + JSON.stringify(e));
    var event = {};
    event.location = window.location.href;
    event.method = 'window.location close or unload';
    event.target = document.location;
    event.action = JSON.stringify(e.state);
    event.timeStamp = (new Date).getTime();


    window.console && window.console.log(JSON.stringify(event) + ' beforeunload');

    sendEvent(event);
}, false);

//page level generic javascript error trap
window.addEventListener("error", function (error) {
    var event = {};
    event.location = window.location.href;
    event.method = 'window unhandled error message';
    event.target = document.location;
    event.action = JSON.stringify(error);
    event.timeStamp = (new Date).getTime();
    window.console && window.console.log(JSON.stringify(error) + ' error');
    sendEvent(event);
    return false;
});