import pandas as pd
import numpy
import json
from collections import OrderedDict


xlsx_dataframe = pd.read_excel("words.xlsx", header=None)
words_array =xlsx_dataframe.to_numpy()

print(words_array)

# 0, 6, 11... is column string

json_data = OrderedDict()
word_json = OrderedDict()

for i in range(0, int(len(words_array)/6)):
    word_json = OrderedDict()
    word_json[0] = {
                "word":0,
                "meaning":0
            }
    for j in range(1,6):
        word = words_array[i*6 + j][0]
        meaning = words_array[i*6 + j][1]
        
        # 1 2 3 4 5       6
        # 7 8 9 10 11     12
        # 13 14 15 16 17  18
        word_json[j] = {
            "word":word,
            "meaning":meaning
        }
    dayString = "day" + str(i+1)
    json_data[dayString] = word_json


with open("words.json", 'w', encoding='utf-8') as make_file:
    json.dump(json_data, make_file, indent=4, ensure_ascii=False)