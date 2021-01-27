//@ts-check

import Discord from "discord.js";
import CommandManager from "./commands/manager.js";
const client = new Discord.Client();
// @ts-ignore
const cmdManager = new CommandManager(client.api,client.ws);


var guildId = "799324825532760155";

client.once("ready",()=>{
    console.log("BOT STARTED:",client.user.tag,client.user.id);

    cmdManager.clientInit();
});
client.on("message",async msg => {
    if (msg.author.id != client.user.id) try {
        var {content,channel:c} = msg;
        console.log(content,msg.author.id);
        switch(content) {
            case "-gc":
                    c.send("GETTING COMMANDS:");
                    var commandsRoute = await cmdManager.getCommandsRoute(guildId);
                    var commandsList = await commandsRoute.get();
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
