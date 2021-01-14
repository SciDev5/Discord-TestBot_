const Discord = require("discord.js");
const client = new Discord.Client();

client.once("ready",()=>{
    console.log("BOT STARTED:",client.user.tag);
});

client.on("message",msg=>{
    var content = msg.content;
    console.log(content,msg.author.tag);
    if (msg.author.tag != client.user.tag) {
        msg.channel.send(content+"YEET");
    }
    if (msg.content == "die bot") quit();
});

function quit() {
    client.destroy();
    return process.exit(2);
}

client.login(process.env.BOT_TOKEN);