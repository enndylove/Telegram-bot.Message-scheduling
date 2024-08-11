# Telegram Bot - Message Scheduling <img src="https://img.shields.io/static/v1?label=💕 JavaScript&message=Telegram Bot ✨&color=ffffff" />

This is a simple Telegram bot that allows users to schedule messages to be sent at a specified time. This can be useful for reminders, announcements, or any other type of scheduled communication on Telegram.

## Features

- **Schedule Messages:** Users can schedule messages to be sent at a specific time.
- **Multiple Schedules:** Ability to handle multiple scheduled messages from different users.
- **Easy to Use:** Simple commands to schedule and manage your messages.
- **Persistent Storage:** Scheduled messages are saved, ensuring they are sent even if the bot restarts.

![](https://i.ibb.co/WyBPTqz/300x300-logo.png)

## Getting Started

### Prerequisites

###### To run this project, you need to have Node.js installed on your machine. You can download and install Node.js from [here](https://nodejs.org/en).

### Installation
1. Clone the repository:
```shell
git clone https://github.com/enndylove/Telegram-bot.Message-scheduling.git
```
2. Navigate to the project directory:
```shell
cd Telegram-bot.Message-scheduling
```
3. Install the required dependencies:
```shell
npm install
```

### Environment
1. Create a file named .env and add the following code:
```text
// .env file

TOKEN_ID="YOUR_TOKEN_ID"
ADMINS_ID=["YOUR_CHAT_ID", "ETC_CHAT_ID"]
GROUP_CHAT_ID="YOUR_GROUP_CHAT_ID"
SECRET_MESSAGE="YOUR_SECRET_MESSAGE"
```
2. Set your key for all these states. Example and documentation contains in .env.example file:
```text
// .env.example file

// get YOUR_TOKEN_ID from your bot in https://t.me/BotFather
TOKEN_ID="YOUR_TOKEN_ID"

// for get "YOUR_CHAT_ID" - send bot command "/about", or click to button "ℹ️ Information about you"
// @example [393503921, 2019136452]
ADMINS_ID=["YOUR_CHAT_ID", "ETC_CHAT_ID"]

// how to get "YOUR_GROUP_CHAT_ID"? Just add bot to group and insert the command "/about@tagname_bot"
// @example "-4180731322"
GROUP_CHAT_ID="YOUR_GROUP_CHAT_ID"

// set "YOUR_SECRET_MESSAGE" (this message send to bot for take admin status)
// @example "0005EDF1CDDB4A5583DB1A310B1A776A"
SECRET_MESSAGE="YOUR_SECRET_MESSAGE"
```

### Run the project (local starting)
```shell
node app.js
```

## Run this project to run permanently on the server
1. Upload this project to a cdn server, with the possibility of connecting via an ftp server
2. Now connect to your server through the console (ssh connection)
```shell
ssh username@host_name
```
```shell
username@host_name password: my_password_for_connect123
```
###### or
```shell
ssh username@ip_address:port
```
```shell
username@ip_address password: my_password_for_connect123
```
3.1 Install `pm2` package for server ( [npm pm2 documentation](https://www.npmjs.com/package/pm2) )
```shell
npm install pm2 -g
```
###### or
3.2 Install `pm2` package for server ( [yarn pm2 documentation](https://classic.yarnpkg.com/en/package/@socket.io/pm2) )
````shell
yarn add @socket.io/pm2
````
4. pm2, starting a bot on the server:
```shell
pm2 start app.js
```

### Example of console output 
```text
┌─────┬─────────────────┬─────────────┬─────────┬─────────┬──────────┬────────┬──────┬───────────┬──────────┬──────────┬──────────┬──────────┐
│ id  │ name            │ namespace   │ version │ mode    │ pid      │ uptime │ ↺    │ status    │ cpu      │ mem      │ user     │ watching │
├─────┼─────────────────┼─────────────┼─────────┼─────────┼──────────┼────────┼──────┼───────────┼──────────┼──────────┼──────────┼──────────┤
│ 4   │ app             │ default     │ 1.0.0   │ fork    │ 164618   │ 2s     │ 1670 │ online    │ 0%       │ 41.8mb   │ unitech  │ disabled │
└─────┴─────────────────┴─────────────┴─────────┴─────────┴──────────┴────────┴──────┴───────────┴──────────┴──────────┴──────────┴──────────┘
host metrics | cpu: 1.6% 42.9º | mem free: 52.0% | wlp0s20f3: ⇓ 0mb/s ⇑ 0mb/s | disk: ⇓ 0.199mb/s ⇑ 0mb/s /dev/nvme0n1p3 88.25% |
```

### Managing apps pm2:
```shell
$ pm2 stop     <app_name|namespace|id|'all'|json_conf>
$ pm2 restart  <app_name|namespace|id|'all'|json_conf>
$ pm2 delete   <app_name|namespace|id|'all'|json_conf>
```

### Send schedule message media to group
```javascript
/**
 * Sends a message to the group chat with media (photo, document, or video)
 * @param {string} message - The text of the message
 * @param {object} media - The media object (photo, document, or video)
 * @example
 * sendMessageToGroupWithMedia("Hello!", { type: "photo", content: "file_id" })
 */
async function sendMessageToGroupWithMedia(message, media) {
  if (media.type === "photo") {
    app.sendPhoto(groupChatId, media.content, { caption: message });
  } else if (media.type === "document") {
    app.sendDocument(groupChatId, media.content, { caption: message });
  } else if (media.type === "video") {
    app.sendVideo(groupChatId, media.content, { caption: message });
  } else {
    app.sendMessage(groupChatId, message);
  }
}
```
### Definition of the message type, and json information example
```javascript
if (msg.caption && scheduledPosts[chatId].awaitingPost && scheduledPosts[chatId].postType === "post_photo") {
    const postId = msg.message_id;
    let captionText = msg.caption;
    let media = {};
    media.type = "photo";
    media.content = msg.photo[msg.photo.length - 1].file_id;

    scheduledPosts[chatId] = {
      awaitingPost: "await-date",
      post: {
        id: postId,
        text: captionText,
        media: media,
      },
    };
} 
```

### Regex to test send time message
```javascript
const dateRegex = /^(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2})$/;
```
#### An example of using a regular data expression and setting the time of sending a message according to Ukrainian time
```javascript
if(dateRegex.test(message)) {
    const [year, month, day, hour, minute] = message.match(dateRegex);
    
    const today = new Date();
    
    const utcOffset = today.getMonth() >= 3 && today.getMonth() < 10 ? 3 : 2;
    
    const scheduledDate = new Date(year, month - 1, day, hour, minute);
    
    const currentTime = new Date();
    
    const ukraineTime = new Date(
        currentTime.getTime() + utcOffset * 60 * 60 * 1000,
    );
    
    const delay = scheduledDate.getTime() - ukraineTime.getTime();
    
    console.log(
        `Scheduled date: ${scheduledDate}, Current time: ${ukraineTime}, Delay: ${delay}`,
    );
} else {
    app.sendMessage(
        chatId,
        "Please send the date and time in the correct format: YYYY-MM-DD HH:MM (24-hour format) 📅",
    );
}
```

### Get admin status after sending a secret message
```javascript
// @example .env file:

/* 
SECRET_MESSAGE=98794794bbd603a5b9fe9cb8db87dd7e
*/

app.on("message", (msg) => {
  const chatId = msg.chat.id;
  if (
    msg.text === process.env.SECRET_MESSAGE &&
    !admins.includes(chatId)
  ) {
    admins.push(chatId);
    app.sendMessage(chatId, "👋 Hello Admin, you are ready make post?");
  }
});
```

### Checking for an administrator
```javascript
// @example .env file:

/* 
ADMINS_ID=[393503921, 2019136452]
*/
let admins = process.env.ADMINS_ID;

if (admins.includes(chatId)) {
    app.sendMessage(chatId, "✅ Yes, you are an admin and you can use this bot.");
} else {
    app.sendMessage(chatId, "❌ Sorry, only admins can use this bot.");
}
```
#### Starting to create a bot and install commands: 
```javascript
// @example .env file:

/* 
TOKEN_ID=3ae21e434741863eed5d6d35364e3e3599f6d298
*/

require('dotenv').config()
const TelegramBot = require("node-telegram-bot-api");

const token = process.env.TOKEN_ID;
const app = new TelegramBot(token, { polling: true });

const commands = [
    { command: "/start", description: "🔥 Start to work" },
    { command: "/clearpost", description: "📢 Clear post information" },
    { command: "/about", description: "🪪 About you or about your group" },
];
app.setMyCommands(commands);
```

## License
#### This project is licensed under the [MIT License](https://github.com/enndylove/Telegram-bot.Message-scheduling/blob/main/LICENSE).

### Delicious coffee to you friends ☕