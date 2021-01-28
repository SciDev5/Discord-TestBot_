//@ts-check

import Discord from "discord.js";
import fs from "fs";
import Router from "../router.js";
import JSONHelper from "../json-helper.js";
import Constants from "../constants.js";
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
        this.route = null;
        this.ready = new Promise(res=>this.#readyResolve=res);
        Object.defineProperty(this,"ready",{writable:false});
        Object.seal(this);
    }
    async clientInit() {
        this.route = new Router(this.client);
        // @ts-ignore
        this.ws.on("INTERACTION_CREATE", async (interaction,shardId)=>{
            var {id, type, data, guild_id, member, token, version} = interaction;
            try {
                switch (type) {
                    case 1: // PING
                        await this.commandCallback(interaction,{type:1});
                        break;
                    case 2: // APP COMMAND
                        await this.commandCallback(interaction,Executors[data.name].call(data));
                        break;
                }
            } catch(e) { console.error(e); }
        });
        await this.route.ready;
        this.#readyResolve();
    }


    /**
     * Clear all the commands.
     * @param {string =} guildId The id of the discord server OR undefined for global.
     */
    async clearCommands(guildId) {
        var cmds = await this.getAllCommands(guildId);
        for (var cmd of cmds)
            await this.route.commands(guildId)(cmd.id).delete();
    }
    /**
     * Create a new command.
     * @param {any} command The command data
     * @param {string =} guildId The id of the discord server OR undefined for global.
     */
    async createCommand(command,guildId) {
        return await this.route.commands(guildId).post({data:command});
    }
    /**
     * Delete a specific command.
     * @param {string} commandId The command id to target.
     * @param {string =} guildId The id of the discord server OR undefined for global.
     */
    async deleteCommand(commandId,guildId) {
        return await this.route.commands(guildId)(commandId).delete();
    }
    /**
     * Get a specific command.
     * @param {string} commandId The command id to target.
     * @param {string =} guildId The id of the discord server OR undefined for global.
     */
    async getCommand(commandId,guildId) {
        return await this.route.commands(guildId)(commandId).get();
    }
    /**
     * Get all the commands.
     * @param {string =} guildId The id of the discord server OR undefined for global.
     */
    async getAllCommands(guildId) {
        return await this.route.commands(guildId).get();
    }

    /**
     * Update the list of commands.
     * @param {string} guildId 
     */
    async updateCommands(guildId) {
        await this.clearCommands(guildId);
        var cmds = await JSONHelper.readAsync(Constants.commands.listfile,{});
        for (var cmd of cmds)
            await this.createCommand(await JSONHelper.readAsync(Constants.commands.file,{"NAME":cmd}),guildId);
    }

    /**
     * Send a callback to a command interaction.
     * @param {any} interaction The interaction to respond to.
     * @param {any} data The response data.
     * @returns {Promise<any>}
     */
    commandCallback(interaction,data) {
        return this.route.interactCallback(interaction).post({data});
    }
}



export default CommandManager;