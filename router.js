class Router {
    constructor(client) {
        this.client = client;
        this.ready = (async()=>{
            try { this.appData = await this.client.api.oauth2.applications("@me").get(); } 
            catch (e) { console.error(e); }
            Object.seal(this);
        })();
    }
    api() {
        return this.client.api;
    }

    
    /**
     * Get the API url route for this application.
     */
    app() {
        return this.client.api.applications(this.appData.id);
    }
    /**
     * Get the API url route for a given server.
     * @param {string} guildId The id of the discord server.
     */
    guild(guildId) {
        return this.app().guilds(guildId);
    }
    /**
     * Get the API url route for commands.
     * @param {string =} guildId The id of the discord server OR undefined for global.
     */
    commands(guildId) {
        var baseRoute = null;
        if (guildId != undefined) baseRoute = this.guild(guildId);
        else                      baseRoute = this.app();
        return baseRoute.commands;
    }
    /**
     * Get an interaction callback route.
     * @param {any} interaction The interaction.
     */
    interactCallback(interaction) {
        return this.client.api.interactions(interaction.id)(interaction.token).callback;
    }
    /**
     * Gen the interaction webhook route.
     * @param {any} interaction The interaction.
     */
    webhookInteract(interaction) {
        return this.client.api.webhooks(this.appData.id)(interaction.token);
    }
}

export default Router;