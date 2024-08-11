require('dotenv').config()
const TelegramBot = require("node-telegram-bot-api");

const token = process.env.TOKEN_ID;

const app = new TelegramBot(token, { polling: true });

let admins = process.env.ADMINS_ID;

const groupChatId = process.env.GROUP_CHAT_ID;

const commands = [
  { command: "/start", description: "🔥 Start to work" },
  { command: "/clearpost", description: "📢 Clear post information" },
  { command: "/about", description: "🪪 About you or about your group" },
];
app.setMyCommands(commands);

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

let scheduledPosts = {};

app.on("callback_query", async (callbackQuery) => {
  const data = callbackQuery.data;
  const chatId = callbackQuery.message.chat.id;

  switch (data) {
    case "about_you":
      await app.sendMessage(
        chatId,
        `ℹ️ About You: \n \n🪪Your chat id: ${chatId} \n📑Your username: ${callbackQuery.from.username} \n🔥 Your name: ${callbackQuery.from.first_name}`,
      );
      break;
    case "post":
      if (admins.includes(chatId)) {
        const keyboard = {
          reply_markup: {
            inline_keyboard: [
              [
                { text: "🎯 Text only", callback_data: "post_text" },
                { text: "📸 Photo + text", callback_data: "post_photo" },
              ],
              [
                { text: "🎬 Video + text", callback_data: "post_video" },
                {
                  text: "📋 Document or GIF + text",
                  callback_data: "post_document",
                },
              ],
            ],
          },
        };
        app.sendMessage(
          chatId,
          "✏️ Please select the type of post you want to make:",
          keyboard,
        );
      } else {
        app.sendMessage(chatId, "❌ Sorry, only admins can schedule posts.");
      }
      break;
    case "post_text":
    case "post_photo":
    case "post_video":
    case "post_document":
      scheduledPosts[chatId] = { awaitingPost: true, postType: data };
      app.sendMessage(
        chatId,
        "📝 To make a post, you need to send me the content of the post.",
      );
      break;
    default:
      await app.sendMessage(
        chatId,
        "❌ Sorry, I didn't quite get that. Please try again.",
      );
      break;
  }
});

app.onText(/\/clearpost/, (msg) => {
  const chatId = msg.chat.id;
  scheduledPosts[chatId] = {
    awaitingPost: false,
  };
  if (scheduledPosts[chatId] && admins.includes(chatId)) {
    scheduledPosts[chatId] = {
      awaitingPost: false,
    };
    app.sendMessage(chatId, "✅ Your scheduled post has been cleared!");
  } else {
    app.sendMessage(chatId, "❌ There is no scheduled post to clear.");
  }
});

app.onText(/\/about/, async (msg) => {
  const chatId = msg.chat.id;
  await app.sendMessage(
    chatId,
    `ℹ️ About You: \n \n🪪Your chat id: ${chatId} \n📑Your username: ${msg.from.username} \n🔥 Your name: ${msg.from.first_name}`,
  );
});

app.on("message", (msg) => {
  const chatId = msg.chat.id;
  const message = msg.text;

  if (
    msg.caption &&
    scheduledPosts[chatId].awaitingPost &&
    scheduledPosts[chatId].postType === "post_photo"
  ) {
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
  } else if (
    msg.caption &&
    scheduledPosts[chatId].awaitingPost &&
    scheduledPosts[chatId].postType === "post_video"
  ) {
    const postId = msg.message_id;
    let captionText = msg.caption;
    let media = {};
    media.type = "video";
    media.content = media.content = msg.video.file_id;

    scheduledPosts[chatId] = {
      awaitingPost: "await-date",
      post: {
        id: postId,
        text: captionText,
        media: media,
      },
    };
  } else if (
    msg.caption &&
    scheduledPosts[chatId].awaitingPost &&
    scheduledPosts[chatId].postType === "post_document"
  ) {
    const postId = msg.message_id;
    let captionText = msg.caption;
    let media = {};
    media.type = "document";
    media.content = msg.document.file_id;

    scheduledPosts[chatId] = {
      awaitingPost: "await-date",
      post: {
        id: postId,
        text: captionText,
        media: media,
      },
    };
  } else if (
    scheduledPosts[chatId] &&
    scheduledPosts[chatId].awaitingPost &&
    scheduledPosts[chatId].postType === "post_text"
  ) {
    const postId = msg.message_id;

    scheduledPosts[chatId] = {
      awaitingPost: "await-date",
      post: {
        id: postId,
        text: msg.text,
        media: null,
      },
    };
  }

  if (
    scheduledPosts[chatId] &&
    scheduledPosts[chatId].post &&
    !scheduledPosts[chatId].post.date &&
    scheduledPosts[chatId].awaitingPost === "await-date"
  ) {
    const dateRegex = /^(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2})$/;
    if (dateRegex.test(message)) {
      const [, year, month, day, hour, minute] = message.match(dateRegex);
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
      if (delay > 0) {
        setTimeout(() => {
          if (
            scheduledPosts[chatId] &&
            scheduledPosts[chatId].post &&
            scheduledPosts[chatId].post.media
          ) {
            sendMessageToGroupWithMedia(
              scheduledPosts[chatId].post.text,
              scheduledPosts[chatId].post.media,
            );
          } else {
            app.sendMessage(groupChatId, scheduledPosts[chatId].post.text);
          }
        }, delay);
        app.sendMessage(chatId, "✅ Your post is scheduled!");
        scheduledPosts[chatId].awaitingPost = false;
      } else {
        app.sendMessage(chatId, "❌ Please set a valid future date and time.");
      }
    } else {
      app.sendMessage(
        chatId,
        "Please send the date and time in the correct format: YYYY-MM-DD HH:MM (24-hour format) 📅",
      );
    }
  }
});

app.on("message", (msg) => {
  const chatId = msg.chat.id;
  if (
    msg.text === process.env.SECRET_MESSAGE &&
    !admins.includes(chatId)
  ) {
    admins.push(chatId);
    app.sendMessage(chatId, "👋 Hello Admin, you are ready make post?");
  }

  let welcomeSent = false;

  app.onText(/\/start/, async (msg) => {
    if (!welcomeSent) {
      const keyboard = {
        reply_markup: {
          inline_keyboard: [
            [
              { text: "ℹ️ Information about you", callback_data: "about_you" },
              { text: "📝 Make a post", callback_data: "post" },
            ],
          ],
        },
      };
      await app.sendMessage(
        msg.chat.id,
        `👋 Hello ${msg.from.first_name}! \n \nWelcome to the BossPage Telegram bot, your reliable assistant in managing groups. Here, you can easily schedule and automate message delivery to your groups down to the minute! \n \n🤖 What can this bot do? You can set the date and time for message delivery, choose the type of content, send text or media files, and even attach specific files or links. \n \n📆 By doing so, you can plan your posts in advance to ensure they reach your audience at the designated time, even when you're busy with other tasks. \n \n✨ By interacting with your audience in a more organized and systematic way, you can increase the effectiveness of communication and audience engagement. \n \n⚙️ It's important to note that to use this bot, you must be an administrator of the BossPage company. If you don't have the necessary access rights, unfortunately, there's nothing for you to do here. \n \nDon't delay, let's make the most of all the features this bot has to offer and make our group communications even better! 🚀`,
        keyboard,
      );

      welcomeSent = true;
    }
  });
});
