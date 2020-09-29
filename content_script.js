// var xpos = null;
// var ypos = null;

// function getClickPosition(e) 
// {
//     // Get mouse co-ordinates relative to viewport (clientX / clientY)
//     xpos = e.clientX;
//     ypos = e.clientY;

//     // Get the elements using mouse position
//     var res = document.elementsFromPoint(xpos, ypos);
//     var targ = res[0];

//     // Try to send a one-time message to popup
//     // chrome.runtime.sendMessage({greeting: "user clicks", item: `${targ.textContent}`}, function(response){
//     //     console.log(response.farewell);}); 
// };

function getItemsInfo()
{
    var res = [];

    if (document.getElementById("bag-items") == null)
    {
        console.log("No items found in your bag!");
    }
    else
    {
        var items_num = document.getElementById("bag-items").getElementsByTagName("li").length;
        var items_list = document.getElementsByClassName("bag-item");
        for (var step = 0; step < items_num; step++) 
        {
            var item_name = items_list[step].getElementsByClassName("title")[0].innerHTML;
            var item_price_checker = items_list[step].getElementsByClassName("price");
            var item_price = "$0";
            if (item_price_checker.length > 0)
            {
                var price_html = item_price_checker[0].innerText;
                if (price_html.includes("$"))
                {
                    var item_prices = price_html.split("$");
                    item_price  = item_prices[item_prices.length - 1];
                    console.log("proper price detected ...", item_price);
                    item_price = "$" + item_price;
                }
                else
                {
                    item_price =  "$0";
                }
            }
            var item_id = items_list[step].getElementsByClassName("sku")[0].innerText.split(":")[1].trim();  // a string
            res.push([item_name, item_price, item_id]);
        } 
    }
    return res;
}

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    console.log(sender.tab ?
                "from a content script:" + sender.tab.url :
                "from the popup");
    
    // the pop up asks for the newest bag items
    if (request.greeting == "retrieve bag items"){
        var msg_st = getItemsInfo();
        sendResponse({farewell: "The request of retrieving bag items from popup is confirmed by content script. Please check the attach for your result.", attach: JSON.stringify(msg_st)});
    }
});