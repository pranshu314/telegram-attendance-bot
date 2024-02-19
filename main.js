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

  usrName = propertiesService.getProperty("USR_NAME");

  if (userData.username != usrName) {
    sendMessage(
      'Please go to the github repo ( "https://github.com/pranshu314/telegram-attendance-bot.git" ) and follow the steps to use it on your own.',
      chatId,
    );
    return;
  }

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
    } else if (message == "/new_sem") {
      newSem(chatId);
    } else if (message == "/add_subject") {
      addSubject(chatId);
    } else if (message == "/mark") {
      mark(chatId);
    } else if (message == "/percentage") {
      getPercentage(chatId);
    } else if (message == "/can_skip") {
      getCanSkip(chatId);
    } else {
      sendMessage("Use only the commands given ", chatId);
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

function newSem(chatId) {
  sendMessage("New Sem Function", chatId);
  return;
}

function addSubject(chatId) {
  sendMessage("Add Subject Function", chatId);
  return;
}

function mark(chatId) {
  let reply_markup = {
    inline_keyboard: [
      [
        { text: "Button 1", callback_data: "button_1" },
        { text: "Button 2", callback_data: "button_2" },
      ],
      [
        { text: "Button 3", url: "https://example.com" },
        { text: "Button 4", url: "https://example.com" },
      ],
    ],
  };
  sendMessage("Mark Function", chatId, reply_markup);
  return;
}

function getPercentage(chatId) {
  sendMessage("Get Percentage Function", chatId);
  return;
}

function getCanSkip(chatId) {
  sendMessage("Get Can Skip Function", chatId);
  return;
}
