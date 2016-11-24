function sendSms(to, body) {
  // this is a function that connects Twilio acount and send message to my phone number. modified from code here -- https://www.twilio.com/blog/2016/02/send-sms-from-a-google-spreadsheet.html
 var messagesUrl = "https://api.twilio.com/2010-04-01/Accounts/YOUR-Twilio-Account/Messages.json";
  var payload = {
  "To": to,
  "Body" : body,
  "From" : "Your-Twilio-Number"
  
};
  var options = {
  "method" : "post",
  "payload" : payload
};
  options.headers = {    
  "Authorization" : "Basic " + Utilities.base64Encode("YOURACCOUNTSID:YOURAUTHTOKEN")
};
  UrlFetchApp.fetch(messagesUrl, options);
}



function realTimeChecking(Tickers, SendFlag, phoneNumber) {
  // read data from google spreadchart "WatchingList" and send alerts for buy, sell and stoploss
  // get sheets
  var Tickers = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(Tickers);  // Sheet "Tickers" saves the stock prices and buy, sell, ans stop prices
  var SendFlag = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SendFlag); // Sheet "SendFlag" marks "sent" for each critiria being satisfied, prevents sending same message multiple times.
  // get data
  var startRow = 4;  // skip the rows for description 
  var numRows = Tickers.getLastRow() - startRow +1;  // get the last row number
  var numColumns = Tickers.getLastColumn() ;
  var columnHeadTickers = Tickers.getRange(2, 1, 1, numColumns) 
  var dataRangeTickers = Tickers.getRange(startRow, 1, numRows, numColumns) 
  var dataRangeSendFlag = SendFlag.getRange(startRow, 1, numRows, numColumns) 
  var columnNameTickers = columnHeadTickers.getValues();
  var columnNames = columnNameTickers[0]
  var dataTickers = dataRangeTickers.getValues();
  var dataSendFlag = dataRangeSendFlag.getValues();
  // text message header
  var textStop = "STOP, at, CurP:\n";
  var textBuy = "BUY, at, CurP:\n";
  var textSell = "SELL, at, CurP:\n";
  // column name dictionary
  var nameDict = {}
  
  // give column names to an integer number, used later for indexing the values.
  for (var jj = 0; jj < numColumns+1 ; jj++){
    nameDict[columnNames[jj]] = jj;
  }
  
  
  // check each stock' (each row) real time price and compare with their buy, sell and stop loss value
  for (i in dataTickers){
    var row = dataTickers[i];   // note in javascript, indexing starts from 0, whereas google sheet starts from 1
    var rowFlag = dataSendFlag[i];
    
    // initialized some mark variables
    var buyFlag = 0;
    var numBuyPrices = 0;
    var sellFlag = 0;
    var numSellPrices = 0;
    var stopFlag = 0;
    
    // checking stop loss condition: row[8] saves the stop loss prices
    if (row[nameDict["StopLoss"]] != ""){  // check if stop loss is exist, and if the message has been sent
      if(Number(row[nameDict["CurrentPrice"]]) <= Number(row[nameDict["StopLoss"]]) * 1.02) {   // check if the current price is smaller than stop loss price
        stopFlag = stopFlag + 1;  // used later for buyMessage
        if (rowFlag[nameDict["StopLoss"]] == ""){
        textStop = textStop.concat(row[nameDict["**Symbols"]],":XX", row[nameDict["StopLoss"]], ", ", row[nameDict["CurrentPrice"]], "\n");   // Message body
        SendFlag.getRange(startRow + Number(i), nameDict["StopLoss"]+1).setValue("Sent");  //  Set "sent" mark to sheet "sentFlag"
        }
      }
    }
    
    // checking sell conditions
    for (var ii = 0; ii<2; ii++){  // Two possible sell prices
      if (row[nameDict["Sell2"]-ii] != "" ){ // check if 'Sell price' is exist,
        numSellPrices = numSellPrices + 1;
        if(row[nameDict["CurrentPrice"]] >= row[nameDict["Sell2"]-ii] * 0.96) {  // check if the current price is smaller than stop loss price
          sellFlag = sellFlag + 1;  // label which sell price should be 
        }
      }
    }
    if (sellFlag === 1 && rowFlag[nameDict["Sell1"]] == ""){   // check satisfing which sell price and make sure message has not been sent.
      textSell = textSell.concat(row[nameDict["**Symbols"]],":$", numSellPrices.toString(), ":1$ ", row[nameDict["Sell1"]], ", ", row[nameDict["CurrentPrice"]], "\n");  // text body
      SendFlag.getRange(startRow + Number(i), nameDict["Sell1"]+1).setValue("Sent");   // Set "sent" mark to sheet "sentFlag"
    } else if (sellFlag === 2 && rowFlag[nameDict["Sell2"]] == ""){
      textSell = textSell.concat(row[nameDict["**Symbols"]],":$", numSellPrices.toString(), ":2$ ", row[nameDict["Sell2"]], ", ", row[nameDict["CurrentPrice"]], "\n");
      SendFlag.getRange(startRow + Number(i), nameDict["Sell2"]+1).setValue("Sent");
    }
    
    // checking buy conditions
    if (stopFlag === 0){   // if the current price is lower than stop loss price, do not buy!!!
      for (var ii = 0; ii<4; ii++){ // Four possible buy prices
        numBuyPrices = numBuyPrices + 1;  // counting the number of buy prices
        if (row[nameDict["Buy4"]-ii] != "" ){   // make sure there is a buy price in the cell.
          if(row[nameDict["CurrentPrice"]] <= row[nameDict["Buy4"]-ii] * 1.02) {  // check satisfing this buy price
            buyFlag = buyFlag + 1;
          }
        }
      }
      if (buyFlag === 1 && rowFlag[nameDict["Buy1"]] == ""){  // check satisfing which buy price and make sure message has not been sent.
        textBuy = textBuy.concat(row[nameDict["**Symbols"]],":[", numBuyPrices.toString(), ":1] ", row[nameDict["Buy1"]], ", ", row[nameDict["CurrentPrice"]], "\n");  // text body
        SendFlag.getRange(startRow + Number(i), nameDict["Buy1"]+1).setValue("Sent"); // Set "sent" mark to sheet "sentFlag"
      } else if (buyFlag === 2 && rowFlag[nameDict["Buy2"]] == ""){
        textBuy = textBuy.concat(row[nameDict["**Symbols"]],":[", numBuyPrices.toString(), ":2] ", row[nameDict["Buy2"]], ", ", row[nameDict["CurrentPrice"]], "\n");
        SendFlag.getRange(startRow + Number(i), nameDict["Buy2"]+1).setValue("Sent");
      } else if (buyFlag === 3 && rowFlag[nameDict["Buy3"]] == ""){
        textBuy = textBuy.concat(row[nameDict["**Symbols"]],":[", numBuyPrices.toString(), ":3] ", row[nameDict["Buy3"]], ", ", row[nameDict["CurrentPrice"]], "\n");
        SendFlag.getRange(startRow + Number(i), nameDict["Buy3"]+1).setValue("Sent");
      } else if (buyFlag === 4 && rowFlag[nameDict["Buy4"]] == ""){
        textBuy = textBuy.concat(row[nameDict["**Symbols"]],":[", numBuyPrices.toString(), ":4] ", row[nameDict["Buy4"]], ", ", row[nameDict["CurrentPrice"]], "\n");
        SendFlag.getRange(startRow + Number(i), nameDict["Buy4"]+1).setValue("Sent");
      }
    }
    
  }
  if (textStop.length > 17){   // see if there is a new message (not including header) 
    sendSms(phoneNumber, textStop);  // send the message to the phone number
  }
  if (textSell.length > 17){
    sendSms(phoneNumber, textSell);
  }
  if (textBuy.length > 17){
    sendSms(phoneNumber, textBuy);
  }

}

function runRealTimeChecking(){
  // run the realtime checking code
  realTimeChecking("Tickers", "SendFlag","Your-Cell-Phone-Number");
}

function morningClean(){   // clean "SendFlag" every morning, so sending alerts every new day.
  var Tickers = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Tickers");  // Sheet "Tickers" saves the stock prices and buy, sell, ans stop prices
  var SendFlag = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("SendFlag"); // Sheet "SendFlag" marks "sent" for each critiria being satisfied, prevents sending same message multiple times.
  // get data
  var startRow = 4;  // skip the rows for description 
  var numRows = Tickers.getLastRow() - startRow + 1;  // get the last row number
  var numColumns = Tickers.getLastColumn() ;
  var dataRangeTickers = Tickers.getRange(startRow, 1, numRows, numColumns) 
  var dataRangeSendFlag = SendFlag.getRange(startRow, 1, numRows, numColumns) 
  var dataRangeSendFlagForClean = SendFlag.getRange(startRow, 4, numRows, 10) 
  dataRangeSendFlagForClean.clearContent();
  dataRangeTickers.sort([{column: 1, ascending: true}, {column: 2, ascending: true}])
  Tickers.getRange(startRow, 1, numRows, 3).copyTo(SendFlag.getRange(startRow, 1, numRows, 3)) 
}
