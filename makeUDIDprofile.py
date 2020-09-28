import pandas
import numpy
import pymysql

xl_file = '피험자 정보_0928.xlsx'

#read excel file to dataframe
userDataFrame = pandas.read_excel(xl_file)

#convert dataFrame to ndarray
userNdArray = userDataFrame.to_numpy()

#convert ndarray to list
userList = userNdArray.tolist()

# print(userList)

iosUserList = []

for user in userList:
    # if user is iOS usre
    if user[1][0:3] == "iOS":
        temp = [user[4], user[0], "ios"]
        iosUserList.append(temp)

print(len(iosUserList))
print(iosUserList)

with open("udid-device.txt", "w", encoding="utf-8") as file:
    header = "Device ID	Device Name\tDevice Platform\n"
    file.write(header)

    for item in iosUserList:
        buffer = str(item[0]) + "\t" + item[1] + "\t" + item[2] + "\n"
        file.write(buffer)
        

