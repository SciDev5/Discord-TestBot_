//@ts-check

import Discord from "discord.js";
import CommandManager from "./commands/manager.js";
import JSONHelper from "./utils/json-helper.js";

import roboMeetingsInit from "./command-data/robotics-meetings/init.js";
import Executors from "./command-data/command-executors.js";

/**@type {{bot: {auth_token: string}; guild_map: any}}*/
const config = JSONHelper.readSync("./config.json");

const client = new Discord.Client();
const cmdManager = new CommandManager(client,config.guild_map);

Executors.client = client;
Object.freeze(Executors);

client.once("ready",()=>{
    console.log("BOT STARTED:",client.user.tag,client.user.id);
    client.user.setPresence({activity:{name:"A test bot for testing",type:"PLAYING"}});
    cmdManager.clientInit();
    roboMeetingsInit(client,config);
});
client.on("message",async msg => {
    console.log(msg.content,msg.author.id);
    if (msg.author.id != client.user.id && msg.member.hasPermission("ADMINISTRATOR")) try {
        var {content,channel:c} = msg;
        switch(content) {
            case "-cu":
            case "-cmd update":
                await cmdManager.updateCommands();
                c.send('updated');
                break;
            case "-cc":
            case "-cmd clear":
                await cmdManager.clearAllCommands();
                c.send('cleared');
                break;
            case "-s":
            case "-stop":
                quitClient();
                break;
        }
    } catch (e) {console.error(e);}
});

function quitClient() {
    client.destroy();
    return process.exit(2);
}
client.login(config.bot.auth_token);