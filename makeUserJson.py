# -*- coding: utf-8 -*-
import json
from collections import OrderedDict
import pandas as pd
import numpy


"""
condition 구분 : 1000, 2000, 3000 번대
condition 별로 21명
테스트 계정이므로 name='testUser', birth='000000'으로 통일
"""

json_data = OrderedDict()

# read xlsx to dataframe
xlsx_dataframe = pd.read_excel("user_info.xlsx")

user_array = xlsx_dataframe.to_numpy()

for user in user_array:
    name = user[1]
    birth = user[3]
    testNumber = user[7]
    json_data[testNumber] = {
        'alarm':[{'order': 0}],
        'name':name, 
        'birth':birth
    }

with open('users.json', 'wt', encoding='utf-8') as make_file:
    json.dump(json_data, make_file, indent=4, ensure_ascii=False)