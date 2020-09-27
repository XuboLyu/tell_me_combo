var xpos = null;
var ypos = null;

function getItemsInfo()
{
    tmp = document.getElementById("bag-items");
    console.log("bag items:", tmp);
    var num_items = document.getElementById("bag-items").getElementsByTagName("li").length;
    var items_list = document.getElementsByClassName("bag-item");
    let items_info = [];
    for (var step = 0; step < num_items; step++) 
    {
        var item_name = items_list[step].getElementsByClassName("title")[0].innerHTML;
        var item_price_checker = items_list[step].getElementsByClassName("price");
        var item_price = "$0";
        // console.log("item price length:" + item_price.length)
        // console.log("elements in price class:", item_price_checker)
        if (item_price_checker.length > 0)
        {
            var price_html = item_price_checker[0].innerText;
            // var tmp_html = item_price_checker[0].getElementsByTagName("p")[0].innerHTML;
            if (price_html.includes("$"))
            {
                // item_price = tmp_html;
                item_prices = price_html.split("$");
                item_price  = item_prices[item_prices.length - 1];
                console.log("proper price detected ...", item_price);
                item_price = "$" + item_price;
            }
            else
            {
                item_price =  "$0";
            }
        }
        items_info.push([item_name, item_price]);
    } 

    // Try to send a one-time message to popup
    chrome.runtime.sendMessage({greeting: "bag items", bag_items: items_info}, function(response){
    console.log(response.farewell);});
}

function getClickPosition(e) 
{
    // Get mouse co-ordinates relative to viewport (clientX / clientY)
    xpos = e.clientX;
    ypos = e.clientY;

    // Get the elements using mouse position
    var res = document.elementsFromPoint(xpos, ypos);
    var targ = res[0];

    // Try to send a one-time message to popup
    chrome.runtime.sendMessage({greeting: "user clicks", item: `${targ.textContent}`}, function(response){
        console.log(response.farewell);}); 

    getItemsInfo();
};

document.addEventListener("click", getClickPosition, false);
// setInterval(getItemsInfo, 2000);