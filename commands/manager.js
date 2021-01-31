//@ts-check
import Discord from "discord.js";
import Router from "../utils/router.js";
import JSONHelper from "../utils/json-helper.js";
import Constants from "../utils/constants.js";
import Executors from "../command-data/command-executors.js";
import CommandExecutor from "./executor.js";

class CommandManager {

    /** @type {(value: undefined) => void} */
    #readyResolve;
    /**
     * Construct a new CommandManager
     * @param {Discord.Client} client
     * @param {any} guildMap
     */
    constructor (client,guildMap) {
        this.client = client;
        this.ws = client.ws;
        this.guildMap = guildMap;
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
                        /**@type {CommandExecutor}*/
                        var cmd = Executors.global[data.name];
                        for (var guildGroup in this.guildMap)
                            if (this.guildMap[guildGroup].includes(guild_id)) {
                                if (cmd) throw new Error("Multiple commands with same name used in guild ID:"+guild_id+"!");
                                cmd = Executors[guildGroup][data.name];
                            }
                        await this.commandCallback(interaction,cmd.call(data));
                        break;
                }
            } catch(e) {
                console.error(e); 
                await this.commandCallback(interaction,{type:5,data:{content:"COMMAND EXEC FAILED:\n"+e.name+": "+e.message+"\n"+e.stack}});
            }
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
     * Clear all the commands in all servers.
     */
    async clearAllCommands() {
        var guildIds = [];
        for (var group in this.guildMap)
            for (var guildId of this.guildMap[group])
                if (guildIds.includes(guildId)) 
                    guildIds.push(guildId);
        var promises = []
        for (var guildId of guildIds)
            promises.push(this.clearCommands(guildId));
        promises.push((async ()=>{
            if (await this.getAllCommands()) 
                await this.clearCommands();
            })());
        await Promise.all(promises);
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
     * Update the list of commands in all scopes. [does pre-clear]
     */
    async updateCommands() {
        await this.clearAllCommands();
        var commandGroups = await JSONHelper.readAsync(Constants.commands.listfile,{});
        var promises = [];
        for (var group of commandGroups)
            promises.push(this.updateGuildGroupCommands(group));
        await Promise.all(promises);
    }
    /**
     * Update the commands for a guild group. [Doesn't pre-clear]
     * @param {{ guilds: string; commands: any; }} [group]
     */
    async updateGuildGroupCommands(group) {
        var guildIds = this.guildMap[group.guilds];
        var promises = [];
        for (var cmd of group.commands) {
            var commandData = await JSONHelper.readAsync(Constants.commands.file,{"NAME":cmd,"GUILD":group.guilds});
            if (guildIds) { 
                for (var guildId of guildIds)
                    promises.push(this.createCommand(commandData,guildId));
            } else  promises.push(this.createCommand(commandData));
        }
        await Promise.all(promises);
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