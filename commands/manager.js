//@ts-check

import Discord from "discord.js";

class CommandManager {

    /** @type {(value: undefined) => void} */
    #readyResolve;
    /**
     * Construct a new CommandManager
     * @param {Discord} client
     */
    constructor (client) {
        this.client = client;
        // @ts-ignore
        this.api = client.api;
        this.app = null;
        this.ready = new Promise(res=>this.#readyResolve=res);
        Object.defineProperty(this,"ready",{writable:false});
        Object.seal(this);
    }
    async clientInit() {
        this.app = await this.getOAuth2Route().then(oauth2=>oauth2.applications("@me").get());
        this.#readyResolve();
    }

    /**
     * Get the API url route for this application.
     */
    async getAppRoute() {
        await this.ready;
        return this.api.applications(this.app.id);
    }
    /**
     * Get the API url route for this application.
     */
    async getOAuth2Route() {
        await this.ready;
        return this.api.oauth2;
    }
    /**
     * Get the API url route for a given server.
     * @param {string} guildId The id of the discord server.
     */
    async getGuildRoute(guildId) {
        await this.ready;
        return (await this.getAppRoute()).guilds(guildId);
    }
    /**
     * Get the API url route for commands.
     * @param {string =} guildId The id of the discord server OR undefined for global.
     */
    async getCommandsRoute(guildId) {
        await this.ready;
        var baseRoute = null;
        if (guildId != undefined) baseRoute = await this.getGuildRoute(guildId);
        else                      baseRoute = await this.getAppRoute();
        return baseRoute.commands;
    }
}



export default CommandManager;