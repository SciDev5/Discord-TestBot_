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
        switch(content) {
            case "-uc":
                await cmdManager.updateCommands(guildId);
                c.send("UPDATED");
                break;
            case "-cc":
                cmdManager.clearCommands(guildId);
                break;
            case "-ccg":
                cmdManager.clearCommands();
                break;
            case "-gc":
                    var commandsList = await cmdManager.getAllCommands(guildId);
                    c.send(JSON.stringify(commandsList));
                break;
            case "-gcg":
                var commandsList = await cmdManager.getAllCommands();
                c.send(JSON.stringify(commandsList));
            break;
            case "-echo":
                c.send("ECHO");
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
