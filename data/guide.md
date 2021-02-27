# Import
Import sẽ không xoá dữ liệu cũ!
```
cd ~/Desktop

mongoimport --uri mongodb+srv://assmin:iamassmin0@cluster0.rh9ld.mongodb.net/familywatch --collection userdata --type csv --headerline --file import.csv
```
# Export 

```
cd ~/Desktop

mongoexport --uri mongodb+srv://assmin:iamassmin0@cluster0.rh9ld.mongodb.net/familywatch --collection userdata --type csv --fieldFile fields.txt --out export.csv
```