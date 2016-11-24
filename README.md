# RealTime Stock Data and Alerts send to CellPhone via SMS
This a Google app script (based on Javascript) that allows fetching realtime stock data from Google Finance and sending price alerts after passing certain BUY ro SELL values.

The link below is a demo Google sheet with this script:
https://docs.google.com/spreadsheets/d/1vGBjToFXKiZmxlN9UHaTyukcU9BUYwVb5jq91epI1Uo/edit?usp=sharing

When editing, please keep the following things in mind:
* Do not change the name of sheets, "Tickers", "SendFlag", and the names of columns, like "Buy1" "Buy2", "Sell1" etc. 
     ..* (If you need to change them, you have to change them in the script too.)
* This script sends you a message once the target price is reached and it refeshes sending alerts everyday. In the same day, you would not receive the same message twice. But you may recieve the same alerts in different days. However, if you update the blue section daily, like "BuyAt1", "BuyAt2", etc., you would not receive duplicated alerts if you have these values set (not equal to 0 or empty). 
* Do not totally rely on this app, sometimes google service breaks. If this happens, check the triggers in Step5. Everytime you make a change to the script, renew the triggers, making sure they are not gray.

In this Google spreadsheet, do the following modifications:
![alt tag](https://cloud.githubusercontent.com/assets/10473229/20608250/f58e7b2c-b234-11e6-83e1-c056b1c440cd.png)
