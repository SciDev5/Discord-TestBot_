//@ts-check

import Discord from "discord.js";
import fs from "fs";

class CommandManager {

    /** @type {(value: undefined) => void} */
    #readyResolve;
    /**
     * Construct a new CommandManager
     * @param {Discord} client
     */
    constructor (client) {
        this.client = client;
        this.app = null;
        this.ready = new Promise(res=>this.#readyResolve=res);
        Object.defineProperty(this,"ready",{writable:false});
        Object.seal(this);
    }
    async clientInit() {
        this.#readyResolve();
        // @ts-ignore
        try { this.app = await this.client.api.oauth2.applications("@me").get(); } 
        catch (e) { console.error(e); }
    }

    /**
     * Get the API url route for this application.
     */
    getAppRoute() {
        // @ts-ignore
        var v = this.client.api.applications(this.app.id);
        return v;
    }
    /**
     * Get the API url route for a given server.
     * @param {string} guildId The id of the discord server.
     */
    getGuildRoute(guildId) {
        var v = this.getAppRoute();
        return v.guilds(guildId);
    }
    /**
     * Get the API url route for commands.
     * @param {string =} guildId The id of the discord server OR undefined for global.
     */
    getCommandsRoute(guildId) {
        var baseRoute = null;
        if (guildId != undefined) baseRoute = this.getGuildRoute(guildId);
        else                      baseRoute = this.getAppRoute();
        return baseRoute.commands;
    }

    /**
     * Clear all the commands.
     * @param {string =} guildId The id of the discord server OR undefined for global.
     */
    async clearCommands(guildId) {
        var cmds = await this.getAllCommands(guildId);
        for (var cmd of cmds)
            await this.getCommandsRoute(guildId)(cmd.id).delete();
    }
    /**
     * Create a new command.
     * @param {any} command The command data
     * @param {string =} guildId The id of the discord server OR undefined for global.
     */
    async createCommand(command,guildId) {
        return await this.getCommandsRoute(guildId).post({data:command});
    }
    /**
     * Delete a specific command.
     * @param {string} commandId The command id to target.
     * @param {string =} guildId The id of the discord server OR undefined for global.
     */
    async deleteCommand(commandId,guildId) {
        return await this.getCommandsRoute(guildId)(commandId).delete();
    }
    /**
     * Get a specific command.
     * @param {string} commandId The command id to target.
     * @param {string =} guildId The id of the discord server OR undefined for global.
     */
    async getCommand(commandId,guildId) {
        return await this.getCommandsRoute(guildId)(commandId).get();
    }
    /**
     * Get all the commands.
     * @param {string =} guildId The id of the discord server OR undefined for global.
     */
    async getAllCommands(guildId) {
        return await this.getCommandsRoute(guildId).get();
    }

    /**
     * Update the list of commands.
     * @param {string} guildId 
     */
    async updateCommands(guildId) {
        //await this.clearCommands(guildId);
        var cmds = JSON.parse(await new Promise(res=>fs.readFile("./commands/cmds.json",(_,data)=>{res(data.toString("utf-8"))})));
        for (var cmd of cmds)
            await this.createCommand(JSON.parse(await new Promise(res=>fs.readFile(`./commands/${cmd}.json`,(_,data)=>{res(data.toString("utf-8"))}))),guildId);
    }
}



export default CommandManager;