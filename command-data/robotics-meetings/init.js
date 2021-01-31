//@ts-check

import { Client } from "discord.js";
import JSONHelper from "../../utils/json-helper.js";

/**
 * 
 * @param {Client} client 
 * @param {{bot: {auth_token: string}; guild_map: any}} config
 */
export default (async (client,config) => {
    /**@type {{"announce-role":any}}*/
    var data = await JSONHelper.readAsync("./.data/robotics-meetings/data.json");
    var guildsToPopulate = [];
    for (var gg in config.guild_map)
        for (var gid of config.guild_map[gg])
            if (!guildsToPopulate.includes(gid) && !data["announce-role"].hasOwnProperty(gid))
                guildsToPopulate.push(gid);
    for (var guildId of guildsToPopulate) {
        var guild = await client.guilds.fetch(guildId);
        var role = await guild.roles.create({data:{mentionable:false,name:"MeetingAnnounce"}});
        if (!data["announce-role"][guild.id]) data["announce-role"][guild.id] = {};
        data["announce-role"][guild.id] = role.id;
    }

    await JSONHelper.writeAsync("./.data/robotics-meetings/data.json",data);
});