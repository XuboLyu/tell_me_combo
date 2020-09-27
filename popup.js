/* show items on popup panel */
function setItemsOnPanel(items_info)  
{
  console.log("item_info:", items_info)
  // document.getElementById("items_block").innerHTML = "";
  for (var step=0; step < items_info.length; step++)
  {
    id = (step + 1).toString();
    document.getElementById("items_block").innerHTML += `<div class="item" id=${id}>
                                                                <div class="item_name"> 
                                                                  ${items_info[step][0]}
                                                                </div>
                                                                <div class="item_price">
                                                                  ${items_info[step][1]}
                                                                </div>
                                                                <div class="item_opt">
                                                                  <select name="item_${id}_priority" id="item_${id}_priority">
                                                                    <option value="">--Priority--</option>
                                                                    <option value="Required">Required</option>
                                                                    <option value="Optional">Optional</option>
                                                                  </select>
                                                                </div>
                                                                </div>`;
  }

  /* enable the callback functions for all `select` elements to save every USER changes */
  for (var step=0; step < items_info.length; step++)
  {
    id = (step + 1).toString();
    var query_ref = "#item_" + id + "_priority";
    var selectElement = document.querySelector(query_ref);
    selectElement.addEventListener('change', (event) => {
      var key = event.target.id;
      var val = event.target.value;
      chrome.storage.sync.set({key: val});
      console.log("Save user changes for ", key);
    });
  }

  /* enable the callback functions for the other input elements to save every USER changes */
  var inputIds = ["promo_thresh", "promo_thresh_check", "shipping_thresh", "shipping_thresh_check"];
  for (var idx in inputIds)
  {
    query_ref = "#" + inputIds[idx];
    selectElement = document.querySelector(query_ref);
    selectElement.addEventListener('change', (event) => {
      key = event.target.id;
      val = event.target.value;
      chrome.storage.sync.set({key: val});
      console.log("Save user changes for ", key);
    });
  }
}

/* Re-organize chosen items on popup panel */
function updateItemsOnPanel(items_info, optCombo){
  console.log("The best combo items:", optCombo["optComboItems"]);
  optComboItems = optCombo["optComboItems"];
  var optComboIndices = [];
  var otherIndices = [];
  document.getElementById("items_block").innerHTML = "";
  document.getElementById("items_block").innerHTML += `<p class="items-in-bag">
                                                        <span> ITEMS IN BAG </span>
                                                      </p>`
  /* First we show chosen optimal Combo */
  for (var i = 0; i < optComboItems.length; i++)
  {
    console.log("I'm in the loop of optCombo ...");
    tmpIndex = optComboItems[i][0];
    optComboIndices.push(tmpIndex);
    id = (tmpIndex + 1).toString();
    document.getElementById("items_block").innerHTML += `<div class="item" id=${id}>
                                                          <div class="item_name"> 
                                                            ${items_info[tmpIndex][0]}
                                                          </div>
                                                          <div class="item_price">
                                                            ${items_info[tmpIndex][1]}
                                                          </div>
                                                          <div class="item_opt">
                                                            <select name="item-priority" id="item-priority">
                                                              <option value="">--Priority--</option>
                                                              <option value="Required">Required</option>
                                                              <option value="Optional">Optional</option>
                                                            </select>
                                                          </div>
                                                          </div>`
  }
  /* Then we show the remainng items */
  for (var step=0; step < items_info.length; step++)
  {
    if (!optComboIndices.includes(step))
    {
      otherIndices.push(step);
      id = (step + 1).toString();
      document.getElementById("items_block").innerHTML += `<div class="item" id=${id}>
                                                          <div class="item_name"> 
                                                            <strike>${items_info[step][0]}</strike>
                                                          </div>
                                                          <div class="item_price">
                                                            <strike>${items_info[step][1]}</strike>
                                                          </div>
                                                          <div class="item_opt">
                                                            <select name="item-priority" id="item-priority">
                                                              <option value="">--Priority--</option>
                                                              <option value="Required">Required</option>
                                                              <option value="Optional">Optional</option>
                                                            </select>
                                                          </div>
                                                          </div>`
    }
  }

  console.log("optComboIndices:", optComboIndices);
  console.log("otherIndices:", otherIndices);


}





/* main algorithm for calculating optimal Combo */
function optCombo(item_prices, Thresh) {
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


// let changeColor = document.getElementById('changeColor');
// chrome.storage.sync.get('color', function(data){
//   changeColor.style.backgroundColor = data.color;
//   changeColor.setAttribute('value', data.color);

//   changeColor.onclick = function(element) {
//       let color = element.target.value;
//       chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
//           chrome.tabs.executeScript(
//               tabs[0].id,
//               {code: 'document.body.style.backgroundColor = "' + color + '";'});
//       });
//   }
// });

let calCombo = document.getElementById('best_combo');
let promo_thresh = document.getElementById('promo_thresh');
let shipping_thresh = document.getElementById('shipping_thresh');



chrome.storage.sync.get('bag_items', function(data){
  if (data)
  {
    setItemsOnPanel(data.bag_items);
  }

  var items_info = data.bag_items;
  var item_prices = [];
  for (var step=0; step < items_info.length; step++)
  {
    tmp = items_info[step][1];
    item_prices.push(parseFloat(tmp.substring(1)));
    console.log(item_prices);
  }
  var Thresh = 30;

  calCombo.onclick = function(){
    res = optCombo(item_prices, Thresh);
    console.log("optTotalPrice:", res["optTotalPrice"]);
    console.log("optComboItems:", res["optComboItems"]);
    updateItemsOnPanel(items_info, res);
    
    // once a click happens, we retain the new popup interface
    chrome.runtime.sendMessage({greeting: "popup update", flag: true}, function(response){
      console.log(response.farewell);});
  }

  

});
    






