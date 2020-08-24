# -*- coding: utf-8 -*-
import json
from collections import OrderedDict

json_data = OrderedDict()

"""
condition 구분 : 1000, 2000, 3000 번대
condition 별로 20명
테스트 계정이므로 name='testUser', birth='000000'으로 통일
"""
numberList = [1000, 2000, 3000]

for bigNumber in numberList:
    for smallNumber in range(0, 20):
        testNumber = bigNumber + smallNumber
        json_data[testNumber] = {'alarm':[{'order': 0}],'name':'testUser', 'birth':123456}
    testNumber = bigNumber + 998
    json_data[testNumber] = {'alarm':[{'order': 0}],'name':'testUser', 'birth':123456}
    testNumber = bigNumber + 999
    json_data[testNumber] = {'alarm':[{'order': 0}],'name':'testUser', 'birth':123456}

# print(json.dumps(json_data, indent=4))

with open('users.json', 'w') as make_file:
    json.dump(json_data, make_file, indent=4)