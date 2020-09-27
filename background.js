chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    console.log(sender.tab ?
                "from a content script:" + sender.tab.url :
                "from the extension");
    

    if (request.greeting == "bag items"){
      sendResponse({farewell: "item names received by popup ..."});
      chrome.storage.sync.set({bag_items: request.bag_items});
      console.log("items in bag: " + request.bag_items)
    }

    if (request.greeting == "user clicks"){
        sendResponse({farewell: "click report received by popup ..."});
        console.log("the item name is: " + request.item);
    }
});

 
chrome.runtime.onInstalled.addListener(
    function() 
    {
        chrome.tabs.query({"currentWindow": true, //Filters tabs in current window
                            "status": "complete", //The Page is completely loaded
                            "windowType": "normal",
                            "url": ["https://*.shoppersdrugmart.ca/*", "http://*.shoppersdrugmart.ca/*"]}, function(tabs) 
                            {
                                
                                for(var i in tabs) 
                                {
                                    // Filter by url if needed; that would require "tabs" permission
                                    // Note that injection will simply fail for tabs that you don't have permissions for
                                    chrome.tabs.executeScript(tabs[i].id, {file: "content_script.js"});
                                    console.log("queried tabs:", tabs[i]);    
                                }
                            }
                        );
        // storage API set variables that can be globally accessed.
        chrome.storage.sync.set({color: '#3aa757'}, function(){console.log("The color is green.");});
        chrome.declarativeContent.onPageChanged.removeRules(undefined, 
            function() 
            {
                chrome.declarativeContent.onPageChanged.addRules([{
                conditions: [new chrome.declarativeContent.PageStateMatcher({pageUrl: {hostContains: '.shoppersdrugmart', pathContains: 'shoppingbag'},})],
                actions: [new chrome.declarativeContent.ShowPageAction()]}]);
            }
        );
    }
);