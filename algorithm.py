import sys,os
import numpy as np
# # 5 20
# # 18 19 17 6 7
# def optimal_combo(item_prices, X):
#     item_num = len(item_prices)
#     dp =  (X+1) * [10000]
#     combos = (X+1) * [[]]
#     for i in range(item_num):
#         cur_price = item_prices[i]
#         for j in range(X, -1, -1):
#             if j > cur_price:
#                 min_idx = 0 if dp[j] <= dp[int(round(j-cur_price))]+cur_price else 1
#                 dp[j] = dp[j] * (1 - min_idx) + (dp[int(round(j-cur_price))]+cur_price) * min_idx
#                 if min_idx:
#                     combos[j] = []
#                     combos[j].extend(combos[int(round(j-cur_price))])
#                     combos[j].append(cur_price)
#             else:
#                 min_idx = 0 if dp[j] <= cur_price else 1 
#                 dp[j] = dp[j] * (1 - min_idx) + cur_price * min_idx
#                 if min_idx:
#                     combos[j] = []
#                     combos[j].append(cur_price)
    
#     return dp[X], combos[X], dp


def optCombos(item_prices, Thresh):
    # Make sure the Thresh is valid
    assert Thresh > 0

    # Directly output the results when the total price is less or equal than Thresh
    if sum(item_prices) <= Thresh:
        return sum(item_prices), item_prices

    # Else, item_prices * 100 -> integer (cents)
    item_num = len(item_prices)
    for i in range(item_num):
        item_prices[i] *= 100
        item_prices[i] = int(item_prices[i])
    Thresh *= 100
    Thresh = int(Thresh)

    # Start DP population. See: https://www.wandouip.com/t5i192040/
    states = np.zeros((item_num, 2*Thresh+1))
    states[0, 0] = True
    states[0, item_prices[0]] = True

    for i in range(1, item_num):
        for j in range(2*Thresh):
            if states[i-1, j] == True:
                states[i, j] = states[i-1, j]
        for j in range(2*Thresh - item_prices[i]):
            if states[i-1, j] == True:
                states[i, j+item_prices[i]] = True
    
    optPrice = 0
    optCombos = []
    for j in range(Thresh, 2*Thresh+1):
        if states[item_num-1, j] == True:
            optPrice = j
            break
    if j == 2*Thresh+1:
        print("no valid combos ...")
        return

    for i in range(item_num-1, 0, -1):
        if j - item_prices[i] >= 0 and states[i-1, j-item_prices[i]] == True:
            optCombos.append(item_prices[i])
            j = j - item_prices[i]
    if j != 0:
        optCombos.append(item_prices[0])

    # Convert back to floating number
    for i in range(len(optCombos)):
        optCombos[i] /= 100.0
    optPrice /= 100.0
    
    return optPrice, optCombos


if __name__ == "__main__":
    # item_prices = [18.38, 19.27, 17.11, 6.0, 7.6]
    # X = 70

    # item_prices = [5.49, 22.99, 35, 10.49]
    item_prices = [5, 22, 35, 10]
    Thresh = 40

    print(optCombos(item_prices, Thresh))