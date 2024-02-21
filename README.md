# Telegram Bot to Track Attendance
This repo contains the code for a telegram bot to track attendance, which is hosted using google appscripts.

## Demonstration
### Video

### Google Sheet just after the video
<img width="479" alt="image" src="https://github.com/pranshu314/telegram-attendance-bot/assets/110905434/2c2c0a80-647e-409f-8133-9c16fcf02598">

## Working
- The /new_sem command is used to add a new semester/ new sheet marking the attendance.
  - It asks for the name of the new semester and makes a sheet with that name.
  - It also sets the LATEST_SEM property to the same name
- The /add_subject command is used to add new subjects to the semester
  - It asks for the subject name and appends it to the 1st row of the LATEST_SEM sheet
  - It also appends the formula to calculate the total classes to row 2, percentage attendance for that subject to row 3, can_skip value to row 4.
- The /mark command is used to mark the attendance
  - It prompts the user to select the subject to mark attendance for. (subjests in option are the ones added using /add_subject)
  - Then it asks whether to mark Present or Absent.
  - For present it adds a row to LATEST_SEM sheet with Date, Subject_Name, 1 while for absent with Date, Subject_Name, -1
- The /percentage command is used to get the percentage attendance for all the subjects in the sem
- The /can_skip command is used to get the maximum number of classes user can skip given the amount of classes attended till now considering 85% attendance to be mandatory for all the subjects in the sem

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
  - SPREADSHEET_ID := Google Sheet ID
  - TELEGRAM_TOKEN := Telegram Bot Token
  - WEBHOOK_URL := This scripts deployed url
  - USR_NAME := Your Telegram Username
  - LATEST_SEM := Current Semester you want to mark attendance for
  - SUBJECT_TO_MARK := none
- Copy and paste the code in main.js to code.gs file in app script and deploy the script.
- Now you can use the telegram bot you have made to mark and track the attendance for your college.
