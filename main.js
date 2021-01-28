//@ts-check
// ENV VARS: ["TEST_GUILD_ID","BOT_TOKEN"]

import Discord from "discord.js";
import CommandManager from "./commands/manager.js";
const client = new Discord.Client();
// @ts-ignore
const cmdManager = new CommandManager(client);


var guildId = process.env.TEST_GUILD_ID;

client.once("ready",()=>{
    console.log("BOT STARTED:",client.user.tag,client.user.id);

    cmdManager.clientInit();
});
client.on("message",async msg => {
    if (msg.author.id != client.user.id) try {
        var {content,channel:c} = msg;
        console.log(content,msg.author.id);
        const rgc = async ()=>c.send(JSON.stringify(await cmdManager.getAllCommands(guildId)));
        const rgcg = async ()=>c.send(JSON.stringify(await cmdManager.getAllCommands()));
        switch(content) {
            case "-uc":
                await cmdManager.updateCommands(guildId);
                await rgc();
                break;
            case "-cc":
                cmdManager.clearCommands(guildId);
                await rgc();
                break;
            case "-ccg":
                cmdManager.clearCommands();
                await rgcg();
                break;
            case "-gc":
                await rgc();
                break;
            case "-gcg":
                await rgcg();
                break;
            case "-echo":
                c.send("echo");
                break;
            case "-s":
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
