/* 1. main algorithm for calculating optimal Combo */
function optCombo(item_prices, Thresh){
  console.assert(Thresh > 0, "Threshold is invalid ...");
  var optTotalPrice = 0;
  var optComboItems = [];

  // Directly output the results when the total price is less or equal than Thresh
  sumPrice = item_prices.reduce((a, b) => a + b, 0);
  if (sumPrice <= Thresh)
  {
    optTotalPrice = sumPrice;
    for (var i = 0; i < item_prices.length; i++)
    {
      optComboItems.push([i, item_prices[i]])
    }
    return {"optTotalPrice": optTotalPrice, "optComboItems": optComboItems};
  }

  // Else, item_prices * 100 -> integer (cents)
  item_num = item_prices.length;
  for (var i = 0; i < item_num; i++)
  {
      item_prices[i] *= 100;
      item_prices[i] = parseInt(item_prices[i]);
  }
  Thresh *= 100;
  Thresh = parseInt(Thresh);

  // Start DP population. See: https://www.wandouip.com/t5i192040/
  var states = [];
  for (var i = 0; i < item_num; i++)
  {
    states.push(Array(2*Thresh+1).fill(0));
  }
  states[0][0] = 1;
  states[0][item_prices[0]] = 1;

  for (var i = 1; i < item_num; i++)
  {
    for (var j = 0; j < 2*Thresh; j++)
    {
      if (states[i-1][j] == 1)
      {
        states[i][j] = states[i-1][j];
      }
    }

    for (var j = 0; j < 2*Thresh; j++)
    {
      if (states[i-1][j] == 1)
      {
        states[i][j+item_prices[i]] = 1;
      }
    }
  }
    

  // Retrieve optPrice
  for (var k = Thresh; k < 2*Thresh+1; k++)
  {
    if (states[item_num-1][k] == 1)
    {
      optTotalPrice = k;
      break;
    }
  }
  if (k == 2*Thresh+1)
  {
    console.log("no valid Combo ...");
    return;
  }
      
  // Retrieve optCombo
  for (var i = item_num-1; i > 0; i--)
  {
    if (k - item_prices[i] >= 0 && states[i-1][k-item_prices[i]] == 1)
    {
      optComboItems.push([i, item_prices[i]]);
      k = k - item_prices[i];
    }
  }
  if (j != 0)
  {
    optComboItems.push([0, item_prices[0]]);
  }

  // Convert back to floating number
  for (var i = 0; i < optComboItems.length; i++)
  {
    optComboItems[i][1] /= 100.0;
  }   
  optTotalPrice /= 100.0;
  
  return {"optTotalPrice": optTotalPrice, "optComboItems": optComboItems}

}

/* 2. set up popup panel every time */
function setPanel(items_info)  
{
  // set default html contents for bag items
  for (var step=0; step < items_info.length; step++)
  {
    // item sku
    var sku = items_info[step][2];  
    // default content
    document.getElementById("items_block").innerHTML += `<div class="item" id=${sku}>  
                                                                <div class="item_name"> 
                                                                  ${items_info[step][0]}
                                                                </div>
                                                                <div class="item_price">
                                                                  ${items_info[step][1]}
                                                                </div>
                                                                <div class="item_opt">
                                                                  <select name="item_${sku}_priority" id="item_${sku}_priority">
                                                                    <option value="">--Priority--</option>
                                                                    <option value="Required">Required</option>
                                                                    <option value="Optional">Optional</option>
                                                                  </select>
                                                                </div>
                                                                </div>`;
  }
  // enable listeners for bag items to monitor any changes.
  var query_items = [];
  for (var step=0; step < items_info.length; step++)
  {
    var sku = items_info[step][2];  // item sku
    var query_item = "item_" + sku + "_priority";
    query_items.push(query_item);
    var selectElement = document.querySelector("#" + query_item);
    console.log("selected element:", selectElement);
    selectElement.addEventListener('change', (event) => {
      var key = event.target.id;
      var val = event.target.value;
      var obj = {};
      obj[key] = val;
      chrome.storage.sync.set(obj);
      console.log("Save user changes for ", key);
    });
  }

  // enable listeners for check boxes to monitor any changes.
  var query_discount_options = ["promo_thresh_check", "shipping_thresh_check"];
  for (var idx in query_discount_options)
  {
    // enable listeners to monitor any changes.
    var query_discount_option = query_discount_options[idx];
    var checkbox = document.querySelector("#" + query_discount_option);
    checkbox.addEventListener('change', (event) => {
      var key = event.target.id;
      var val = event.target.checked;
      var obj = {};
      obj[key] = val;
      chrome.storage.sync.set(obj); 
      console.log("Save user changes for ", key);
    });
  }

  // load possible history of bag items
  chrome.storage.sync.get(query_items, function(data){
    console.log("query items data:", data);
    for (var k in data) {
      var v = data[k];
      var selectElement = document.querySelector("#" + k);
      selected_option = v;  // return the value of option that has been stored before
      if (selected_option === "Required")
      {
        selectElement.options[1].selected = true;
      }
      else if (selected_option === "Optional")
      {
        selectElement.options[2].selected = true;
      }
      else
      {
        selectElement.options[0].selected = true;
      }
    }
  });
  
  // load possible history of check boxes
  chrome.storage.sync.get(query_discount_options, function(data){
    console.log("query discount options data:", data);
    for (var k in data) {
      var v = data[k];
      var checkbox = document.querySelector("#" + k);
      check_status = v;  // return the check status (true/false) that has been stored before
      if (check_status)
      {
        checkbox.checked = true;
      }
      else
      {
        checkbox.checked = false;
      }
    }
  });
  
}

/* Re-organize chosen items on popup panel (only triggered by `best combo` button) */
// function updatePanel(items_info, optCombo){
//   console.log("The best combo items:", optCombo["optComboItems"]);
//   optComboItems = optCombo["optComboItems"];
//   var optComboIndices = [];
//   var otherIndices = [];
//   document.getElementById("items_block").innerHTML = "";
//   document.getElementById("items_block").innerHTML += `<p class="items-in-bag">
//                                                         <span> ITEMS IN BAG </span>
//                                                       </p>`
//   /* First we show chosen optimal Combo */
//   for (var i = 0; i < optComboItems.length; i++)
//   {
//     console.log("I'm in the loop of optCombo ...");
//     tmpIndex = optComboItems[i][0];
//     optComboIndices.push(tmpIndex);
//     id = (tmpIndex + 1).toString();
//     document.getElementById("items_block").innerHTML += `<div class="item" id=${id}>
//                                                           <div class="item_name"> 
//                                                             ${items_info[tmpIndex][0]}
//                                                           </div>
//                                                           <div class="item_price">
//                                                             ${items_info[tmpIndex][1]}
//                                                           </div>
//                                                           <div class="item_opt">
//                                                             <select name="item-priority" id="item-priority">
//                                                               <option value="">--Priority--</option>
//                                                               <option value="Required">Required</option>
//                                                               <option value="Optional">Optional</option>
//                                                             </select>
//                                                           </div>
//                                                           </div>`
//   }
//   /* Then we show the remainng items */
//   for (var step=0; step < items_info.length; step++)
//   {
//     if (!optComboIndices.includes(step))
//     {
//       otherIndices.push(step);
//       id = (step + 1).toString();
//       document.getElementById("items_block").innerHTML += `<div class="item" id=${id}>
//                                                           <div class="item_name"> 
//                                                             <strike>${items_info[step][0]}</strike>
//                                                           </div>
//                                                           <div class="item_price">
//                                                             <strike>${items_info[step][1]}</strike>
//                                                           </div>
//                                                           <div class="item_opt">
//                                                             <select name="item-priority" id="item-priority">
//                                                               <option value="">--Priority--</option>
//                                                               <option value="Required">Required</option>
//                                                               <option value="Optional">Optional</option>
//                                                             </select>
//                                                           </div>
//                                                           </div>`
//     }
//   }

//   console.log("optComboIndices:", optComboIndices);
//   console.log("otherIndices:", otherIndices);


// }







let calCombo = document.getElementById('best_combo');
let promo_thresh = document.getElementById('promo_thresh');
let shipping_thresh = document.getElementById('shipping_thresh');



var msg_rd;
chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
  chrome.tabs.sendMessage(tabs[0].id, {greeting: "retrieve bag items"}, function(response) {
    console.log(response.farewell);
    msg_rd = JSON.parse(response.attach);
    console.log("msg_rd:", msg_rd);
    chrome.storage.sync.set({bag_items: msg_rd}, function(){console.log("The newest bag items has been saved to local");});

    // setPanel has to be here (we need to wait until the response occurs)
    setPanel(msg_rd);
  });
});



// chrome.storage.sync.get('bag_items', function(data){
//   if (data)
//   {
//     setPanel(data.bag_items);
//   }

//   var items_info = data.bag_items;
//   var item_prices = [];
//   for (var step=0; step < items_info.length; step++)
//   {
//     tmp = items_info[step][1];
//     item_prices.push(parseFloat(tmp.substring(1)));
//     console.log(item_prices);
//   }
//   var Thresh = 30;

//   calCombo.onclick = function(){
//     res = optCombo(item_prices, Thresh);
//     console.log("optTotalPrice:", res["optTotalPrice"]);
//     console.log("optComboItems:", res["optComboItems"]);
//     updatePanel(items_info, res);
    
//     // once a click happens, we retain the new popup interface
//     chrome.runtime.sendMessage({greeting: "popup update", flag: true}, function(response){
//       console.log(response.farewell);});
//   }
// });