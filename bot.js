const Bot = require("node-telegram-bot-api");
const user = require("./models/user");
const article = require("./models/article");
const config = require("./config");
const telegrambot = new Bot(config.token, { polling: true });
telegrambot.on("polling_error", (err) => console.log(err));
//console.log("jhds");
telegrambot.onText(/\/username (.+)/, (mess, [source, match]) => {
    telegrambot.sendMessage(mess.chat.id, "You are logged in!");
    const id = mess.chat.id;
    user.findByLogin(match)
        .then(user1 => {
            console.log(user1.chatId)
            user1.chatId = id;
            // console.log(user1);
            user.update(user1.avaUrl, user1.id, user1)
                .then(user2 => console.log(user2));
        })
        .catch(err => console.log(err));
});
telegrambot.onText(/\/start/, (mess, [source, match]) => {
    const { id } = mess.chat;
    telegrambot.sendMessage(id, "Hello, quest! Please enter your username by using this command  /username");

});
telegrambot.onText(/\/allarticles/, (mess, [source, match]) => {
    const { id } = mess.chat;
    let art_array = "";
    article.getAll("")
        .then(articles => {
            for (let i = 0; i < articles.length; i++) {
                art_array += articles[i].title + "\n";
            }
            telegrambot.sendMessage(id, art_array);
        })

});
module.exports = telegrambot;