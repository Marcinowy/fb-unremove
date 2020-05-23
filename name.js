const login = require("facebook-chat-api");
const arrayColumn = (array, name) => array.map(value => value[name]);
require('dotenv').config();

const maxDeleteTime = 10;

var messages = [];
login({email: process.env.FB_LOGIN, password: process.env.FB_PASS}, (err, api) => {
    if(err) return console.error(err);

    api.setOptions({listenEvents: true});
    api.listenMqtt((err, message) => {
        if (message.type == 'message') {
            messages.push(message);
        }
        if (message.type == 'message_unsend') {
            let arrayId = arrayColumn(messages, 'messageID').indexOf(message.messageID);
            if (arrayId >= 0) {
                if (messages[arrayId].body.length > 0) {
                    api.changeNickname(messages[arrayId].body, messages[arrayId].threadID, messages[arrayId].senderID, () => {
                        api.sendMessage('Nie usuwaj wiadomości ;)', messages[arrayId].threadID);
                    });
                }
                // console.log(`${messages[arrayId].senderID}: ${messages[arrayId].body}`);
                if (typeof messages[arrayId].attachments === 'object' && messages[arrayId].attachments.length > 0) {
                    console.log(messages[arrayId].attachments);
                }
            }
        }
    });
});

setInterval(() => {
    messages = messages.filter(msg => (parseInt(msg.timestamp) + maxDeleteTime * 60 * 1000) > Date.now());
}, 60 * 1000);
