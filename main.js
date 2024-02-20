// Script Properties
// CHAT_STATUS :=  initial
// SPREADSHEET_ID := <Google Sheet ID>
// TELEGRAM_TOKEN := <Telegram Bot Token>
// WEBHOOK_URL := <This scripts deployed url>
// USR_NAME := <Your Telegram Username>
// LATEST_SEM := <Current Semester you want to mark attendance for>
// SUBJECT_TO_MARK := none

// Function to register webhook progmatically on each deployment
function registerWebhook() {
  const scriptProps = PropertiesService.getScriptProperties();
  const key = scriptProps.getProperty("TELEGRAM_TOKEN");
  const url1 = scriptProps.getProperty("WEBHOOK_URL");
  let url = `https://api.telegram.org/bot${key}/getWebhookInfo`;
  let response = UrlFetchApp.fetch(url);
  let content = response.getContentText();
  let jsn = JSON.parse(content);
  if (!jsn.result || jsn.result.url.trim().length > 0) {
    console.log(jsn);
    return;
  }
  url = `https://api.telegram.org/bot${key}/setWebhook`;
  const options = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    muteHttpExceptions: true,
    payload: JSON.stringify({
      url: url1,
    }),
  };
  response = UrlFetchApp.fetch(url, options);
  content = response.getContentText();
  console.log(content);
}

function doPost(e) {
  if (!e.postData || !e.postData.contents) {
    return;
  }

  let data = JSON.parse(e.postData.contents);
  let message = data.message.text;
  let chatId = String(data.message.chat.id);
  let name = data.message.chat.first_name + " " + data.message.chat.last_name;
  const userData = data.message.from;
  Logger.log(userData);

  const propertiesService = PropertiesService.getScriptProperties();
  let chatDialogStatus = propertiesService.getProperty("CHAT_STATUS");
  let TELEGRAM_TOKEN = propertiesService.getProperty("TELEGRAM_TOKEN");
  let WEBHOOK_URL = propertiesService.getProperty("WEBHOOK_URL");
  let ssId = propertiesService.getProperty("SPREADSHEET_ID");
  let lastest_sem = propertiesService.getProperty("LATEST_SEM");
  let sub_to_mark = propertiesService.getProperty("SUBJECT_TO_MARK");

  usrName = propertiesService.getProperty("USR_NAME");

  // To restrict the bot so that only one person can use it.
  if (userData.username != usrName) {
    sendMessage(
      'Please go to the github repo ( "https://github.com/pranshu314/telegram-attendance-bot.git" ) and follow the steps to use it on your own.',
      chatId,
    );
    return;
  }

  // Check to see if the message is empty
  if (!message || message.toString().trim().length == 0) {
    sendMessage("Use only commands given", chatId);
    return;
  }

  let msg = "";
  const COMMANDS =
    "\n/new_sem :- Start of a new semester\n/add_subject :- Add a new course subject\n/mark :- Mark the Attendance\n/percentage :- Get Attendance Percentage\n/can_skip :- Get the number of lectures you can skip according to current attendance\n/help :- Get the list of commands";

  try {
    if (message == "/start" || message == "/help") {
      sendMessage("You have the following options :- " + COMMANDS, chatId);
      return;
    } else if (message == "/new_sem" && chatDialogStatus == "initial") {
      propertiesService.setProperty("CHAT_STATUS", "new_sem");
      sendMessage("Give the name for the Ongoing SEM", chatId);
      return;
    } else if (message == "/add_subject" && chatDialogStatus == "initial") {
      propertiesService.setProperty("CHAT_STATUS", "add_subject");
      sendMessage("What is the name of the subject you want to add", chatId);
      return;
    } else if (message == "/mark" && chatDialogStatus == "initial") {
      propertiesService.setProperty("CHAT_STATUS", "mark_step1");
      mark_step1(chatId, ssId, lastest_sem);
      return;
    } else if (message == "/percentage" && chatDialogStatus == "initial") {
      propertiesService.setProperty("CHAT_STATUS", "percentage");
      getPercentage(chatId, ssId, lastest_sem);
      return;
    } else if (message == "/can_skip" && chatDialogStatus == "initial") {
      propertiesService.setProperty("CHAT_STATUS", "can_skip");
      getCanSkip(chatId, ssId, lastest_sem);
      return;
    } else if (chatDialogStatus == "new_sem") {
      newSem(chatId, ssId, message);
      propertiesService.setProperty("LATEST_SEM", message);
      propertiesService.setProperty("CHAT_STATUS", "initial");
      return;
    } else if (chatDialogStatus == "add_subject") {
      addSubject(chatId, ssId, lastest_sem, message);
      propertiesService.setProperty("CHAT_STATUS", "initial");
      return;
    } else if (chatDialogStatus == "mark_step1") {
      mark_step2(chatId, ssId, lastest_sem, message);
      propertiesService.setProperty("SUBJECT_TO_MARK", message);
      propertiesService.setProperty("CHAT_STATUS", "mark_step2");
      return;
    } else if (chatDialogStatus == "mark_step2") {
      mark_step3(chatId, ssId, lastest_sem, message, sub_to_mark);
      propertiesService.setProperty("SUBJECT_TO_MARK", "none");
      propertiesService.setProperty("CHAT_STATUS", "initial");
    } else if (chatDialogStatus == "percentage") {
      sendMessage("Hello from after percentage", chatId);
      propertiesService.setProperty("CHAT_STATUS", "initial");
      return;
    } else if (chatDialogStatus == "can_skip") {
      sendMessage("Hello from after can_skip", chatId);
      propertiesService.setProperty("CHAT_STATUS", "initial");
      return;
    } else {
      sendMessage(
        "The given command was not found use /help to get the list of all the commands ",
        chatId,
      );
      return;
    }
  } catch (e) {
    sendMessage("\nError: " + e, chatId);
    return;
  }
}

function sendMessage(text, chat_id, reply_markup) {
  const scriptProps = PropertiesService.getScriptProperties();
  const key = scriptProps.getProperty("TELEGRAM_TOKEN");
  const url = `https://api.telegram.org/bot${key}/sendMessage`;
  const options = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    muteHttpExceptions: true,
    payload: JSON.stringify({
      text,
      chat_id,
      reply_markup,
    }),
  };
  const response = UrlFetchApp.fetch(url, options);
  const content = response.getContentText();
  if (!response.getResponseCode().toString().startsWith("2")) {
    console.log(content);
  }
  return ContentService.createTextOutput("OK").setMimeType(
    ContentService.MimeType.TEXT,
  );
}

function newSem(chatId, ssId, message) {
  let sheet = SpreadsheetApp.openById(ssId);
  let template_sheet = sheet.getSheetByName("Template");
  sheet.insertSheet(message, { template: template_sheet });

  sendMessage("Added a new sheet " + message, chatId);
  return;
}

// =FLOOR((A$2*100/85)-(COUNTIFS($B$5:$B,A$1,$C$5:$C,-1)+A$2),1)
function addSubject(chatId, ssId, lastest_sem, message) {
  let sheet = SpreadsheetApp.openById(ssId).getSheetByName(lastest_sem);
  let subjects = sheet.getRange("1:1").getValues();
  let filtered_subjects = [];

  let filtered_count = [];
  let filtered_percent = [];
  let filtered_skip = [];
  let char_value = "";

  for (let i = 0; i < subjects[0].length; i++) {
    if (subjects[0][i] == "") {
      break;
    }
    filtered_subjects.push(subjects[0][i]);
    char_value = String.fromCharCode(97 + i);
    filtered_count.push(`=COUNTIF($B$5:$B,${char_value}1)`);
    filtered_percent.push(
      `=SUMIFS($C5:$C,$B5:$B,${char_value}1,$C$5:$C,1)/${char_value}$2*100`,
    );
    filtered_skip.push(
      `=FLOOR((${char_value}$2*100/85)-(COUNTIFS($B$5:$B,${char_value}$1,$C$5:$C,-1)+${char_value}$2),1)`,
    );
  }
  filtered_subjects.push(message);

  columnLetter = String.fromCharCode(96 + filtered_subjects.length);
  let range = "A1:" + columnLetter + "1";
  sheet.getRange(range).setValues([filtered_subjects]);

  let columnLetter1 = String.fromCharCode(97 + filtered_subjects.length);

  let total_counts_formula = `=COUNTIF($B$5:$B,${columnLetter}1)`;
  filtered_count.push(total_counts_formula);
  filtered_count.push('=TEXTJOIN(" ",TRUE,"Total","Attendance")');
  let range2 = "A2:" + columnLetter1 + "2";
  sheet.getRange(range2).setFormulas([filtered_count]);

  let percent_formula = `=SUMIFS($C5:$C,$B5:$B,${columnLetter}1,$C$5:$C,1)/${columnLetter}$2*100`;
  filtered_percent.push(percent_formula);
  filtered_percent.push('=TEXTJOIN(" ",TRUE,"Percentage","Attendance")');
  let range3 = "A3:" + columnLetter1 + "3";
  sheet.getRange(range3).setFormulas([filtered_percent]);

  let skip_formula = `=FLOOR((${columnLetter}$2*100/85)-(COUNTIFS($B$5:$B,${columnLetter}$1,$C$5:$C,-1)+${columnLetter}$2),1)`;
  filtered_skip.push(skip_formula);
  filtered_skip.push('=TEXTJOIN(" ",TRUE,"Available","Bunk")');
  let range4 = "A4:" + columnLetter1 + "4";
  sheet.getRange(range4).setFormulas([filtered_skip]);

  sendMessage("Added the Subject '" + message + "'", chatId);
  return;
}

function mark_step1(chatId, ssId, lastest_sem) {
  let sheet = SpreadsheetApp.openById(ssId).getSheetByName(lastest_sem);
  let subjects = sheet.getRange("1:1").getValues();
  let key_obj = [];
  for (let i = 0; i < subjects[0].length; i++) {
    if (subjects[0][i] == "") {
      break;
    }
    key_obj.push([{ text: subjects[0][i] }]);
  }

  let reply_markup = {
    keyboard: key_obj,
    one_time_keyboard: true,
    resize_keyboard: true,
  };
  sendMessage(
    "Select the subject you want to mark attendance for.",
    chatId,
    reply_markup,
  );
  return;
}

function mark_step2(chatId, ssId, lastest_sem, message) {
  let reply_markup = {
    keyboard: [[{ text: "Present" }, { text: "Absent" }]],
    one_time_keyboard: true,
    resize_keyboard: true,
  };

  let sheet = SpreadsheetApp.openById(ssId).getSheetByName(lastest_sem);
  let flag_sub_check = 0;
  let subjects = sheet.getRange("1:1").getValues();
  for (let i = 0; i < subjects[0].length; i++) {
    if (subjects[0][i] == "") {
      return;
    }
    if (subjects[0][i] == message) {
      flag_sub_check = 1;
      break;
    }
  }

  if (flag_sub_check == 0) {
    sendMessage("Select a correct subject please.", chatId);
    return;
  }
  sendMessage(
    "Select whether to mark Present or Absent for the subject " + message,
    chatId,
    reply_markup,
  );
  return;
}

function mark_step3(chatId, ssId, lastest_sem, message, sub_to_mark) {
  let sheet = SpreadsheetApp.openById(ssId).getSheetByName(lastest_sem);
  let date = new Date();
  date.setHours(0, 0, 0, 0);

  if (message == "Present") {
    sheet.appendRow([date, sub_to_mark, 1]);
    sendMessage("Marked " + sub_to_mark + " " + message, chatId);
  } else if (message == "Absent") {
    sheet.appendRow([date, sub_to_mark, -1]);
    sendMessage("Marked " + sub_to_mark + " " + message, chatId);
  } else {
    sendMessage("Please choose an option", chatId);
  }

  return;
}

function getPercentage(chatId, ssId, lastest_sem) {
  let reply_markup = {
    keyboard: [
      [
        { text: "Button 7", callback_data: "button_1" },
        { text: "Button 8", callback_data: "button_2" },
      ],
      [
        { text: "Button 9", url: "https://example.com" },
        { text: "Button 10", url: "https://example.com" },
      ],
    ],
    one_time_keyboard: true,
    resize_keyboard: true,
  };
  sendMessage("Get Percentage Function", chatId, reply_markup);
  return;
}

function getCanSkip(chatId) {
  sendMessage("Get Can Skip Function", chatId);
  return;
}
