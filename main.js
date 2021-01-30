//@ts-check

import Discord from "discord.js";
import CommandManager from "./commands/manager.js";
import JSONHelper from "./utils/json-helper.js";

/**@type {{bot: {auth_token: string}; guild_map: any}}*/
const config = JSONHelper.readSync("./config.json");

const client = new Discord.Client();
const cmdManager = new CommandManager(client,config.guild_map);


client.once("ready",()=>{
    console.log("BOT STARTED:",client.user.tag,client.user.id);
    client.user.setPresence({activity:{name:"A test bot for testing",type:"PLAYING"}});
    cmdManager.clientInit();
});
client.on("message",async msg => {
    console.log(msg.content,msg.author.id);
    if (msg.author.id != client.user.id && msg.member.hasPermission("ADMINISTRATOR")) try {
        var {content,channel:c} = msg;
        //const rgc = async ()=>c.send(JSON.stringify(await cmdManager.getAllCommands(guildMap)));
        //const rgcg = async ()=>c.send(JSON.stringify(await cmdManager.getAllCommands()));
        switch(content) {
            case "-commands update":
                await cmdManager.updateCommands();
                //await rgc();
                //await rgcg();
                break;
            /*
            case "-commands clear":
                cmdManager.clearCommands(guildId);
                await rgc();
                break;
            case "-commands clear global":
                cmdManager.clearCommands();
                await rgcg();
                break;
            case "-commands get":
                await rgc();
                break;
            case "-commands get global":
                await rgcg();
                break;
            */
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