//@ts-check

import Discord from "discord.js";
import fs from "fs";
import Router from "../router.js";
import JSONHelper from "../utils/json-helper.js";
import Constants from "../utils/constants.js";
import Executors from "./exec-initalizer.js";

class CommandManager {

    /** @type {(value: undefined) => void} */
    #readyResolve;
    /**
     * Construct a new CommandManager
     * @param {Discord.Client} client
     */
    constructor (client) {
        this.client = client;
        this.ws = client.ws;
        this.app = null;
        this.router = null;
        this.ready = new Promise(res=>this.#readyResolve=res);
        Object.defineProperty(this,"ready",{writable:false});
        Object.seal(this);
    }
    async clientInit() {
        this.router = new Router(this.client);
        // @ts-ignore
        this.ws.on("INTERACTION_CREATE", async (interaction,shardId)=>{
            var {id, type, data, guild_id, member, token, version} = interaction;
            try {
                switch (type) {
                    case 1: // PING
                        await this.commandCallback(interaction,{type:1});
                        break;
                    case 2: // APP COMMAND
                        var cmd = Executors.global[data.name];
                        cmd = cmd || Executors[guild_id][data.name];
                        await this.commandCallback(interaction,cmd.call(data));
                        break;
                }
            } catch(e) { console.error(e); }
        });
        await this.router.ready;
        this.app = this.router.appData;
        this.#readyResolve();
    }


    /**
     * Clear all the commands.
     * @param {string =} guildId The id of the discord server OR undefined for global.
     */
    async clearCommands(guildId) {
        var cmds = await this.getAllCommands(guildId);
        for (var cmd of cmds)
            await this.router.commands(guildId)(cmd.id).delete();
    }
    /**
     * Create a new command.
     * @param {any} command The command data
     * @param {string =} guildId The id of the discord server OR undefined for global.
     */
    async createCommand(command,guildId) {
        return await this.router.commands(guildId).post({data:command});
    }
    /**
     * Delete a specific command.
     * @param {string} commandId The command id to target.
     * @param {string =} guildId The id of the discord server OR undefined for global.
     */
    async deleteCommand(commandId,guildId) {
        return await this.router.commands(guildId)(commandId).delete();
    }
    /**
     * Get a specific command.
     * @param {string} commandId The command id to target.
     * @param {string =} guildId The id of the discord server OR undefined for global.
     */
    async getCommand(commandId,guildId) {
        return await this.router.commands(guildId)(commandId).get();
    }
    /**
     * Get all the commands.
     * @param {string =} guildId The id of the discord server OR undefined for global.
     */
    async getAllCommands(guildId) {
        return await this.router.commands(guildId).get();
    }

    /**
     * Update the list of commands.
     */
    async updateCommands(guildId) {
        await this.clearCommands(guildId);
        var commandGroups = await JSONHelper.readAsync(Constants.commands.listfile,{});
        for (var group of commandGroups)
            for (var cmd of group.commands)
            await this.createCommand(await JSONHelper.readAsync(Constants.commands.file,{"NAME":cmd,"GUILD":group.guild||"global"}),group.guild);
    }

    /**
     * Send a callback to a command interaction.
     * @param {any} interaction The interaction to respond to.
     * @param {any} data The response data.
     * @returns {Promise<any>}
     */
    commandCallback(interaction,data) {
        return this.router.interactCallback(interaction).post({data});
    }
}



export default CommandManager;