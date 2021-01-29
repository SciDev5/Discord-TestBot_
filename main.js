//@ts-check
// ENV VARS: 
// GUILD_MAP: {"guildgroupname":["guildid","otherguildid"],"guildgroupname2":["anotherguildid","guildid"]}
// BOT_TOKEN: string

import Discord from "discord.js";
import CommandManager from "./commands/manager.js";

const client = new Discord.Client();
var guildMap = JSON.parse(process.env.GUILD_MAP);
const cmdManager = new CommandManager(client,guildMap);


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
client.login(process.env.BOT_TOKEN);