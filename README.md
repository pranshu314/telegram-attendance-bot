# Telegram Bot to Track Attendance
This repo contains the code for a telegram bot to track attendance, which is hosted using google appscripts.
## How to setup the project
- Use [@BotFather in Telegram](https://t.me/BotFather) to create a telegram bot and copy its token.(TELEGRAM_TOKEN)
- Create a sheet named Template and add the value "Date" to A6, "Lecture" to B6, "Attendance" to C6
- Add /new_sem, /add_subject, /mark, /percentage, /can_skip, /help as the commands for the bot.
  - /new_sem:- Adds a new sheet that records the attendence freshly
  - /add_subject:- Adds a new subject in the sem
  - /mark:- Useed to mark present or absent for the added subjects
  - /percentage:- Gives out the present attendance percentage
  - /can_skip:- Give the user maximum number of classes he can skip while still maintaining above 85% attendance according to the number of classes he/she has addended till now
- Add a new spreadheet to your google account and copy its id.(SPREADSHEET_ID)
- Create a new Google AppScript.
- Add the following Script Properties
  - CHAT_STATUS :=  initial
  - SPREADSHEET_ID := <Google Sheet ID>
  - TELEGRAM_TOKEN := <Telegram Bot Token>
  - WEBHOOK_URL := <This scripts deployed url>
  - USR_NAME := <Your Telegram Username>
  - LATEST_SEM := <Current Semester you want to mark attendance for>
  - SUBJECT_TO_MARK := none
- Copy and paste the code in main.js to code.gs file in app script and deploy the script.
- Now you can use the telegram bot you have made to mark and track the attendance for your college.
