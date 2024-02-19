function setWebhook() {
  let url =
    "https://api.telegram.org/bot${TELEGRAM_TOKEN}/setWebhook?url=${WEBHOOK_URL}";
  let response = UrlFetchApp.fetch(url);
  Logger.log(response.getContentText());
}

function doPost(e) {
  let data = JSON.parse(e.postData.contents);
  let msg = data.message.text;
  let chatId = String(data.message.chat.id);
  let name = data.message.chat.first_name + " " + data.message.chat.last_name;
  const userData = data.message.from;
}
