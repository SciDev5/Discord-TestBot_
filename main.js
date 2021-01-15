import Discord from "discord.js";
const client = new Discord.Client();

client.once("ready",()=>{
    console.log("BOT STARTED:",client.user.tag);

    client.api.applications(client.user.id).guilds("799324825532760155").commands.post({
        data: {
            name: "hello",
            description: "Replies with Hello World!"
        }
    });
    client.ws.on('INTERACTION_CREATE', async interaction => {
        const command = interaction.data.name.toLowerCase();
        const args = interaction.data.options;

        console.log("YEET");

        if(command == 'hello') {
            client.api.interactions(interaction.id, interaction.token).callback.post({
                data: {
                    type: 4,
                    data: {
                        content: "Hello World!"
                    }
                }
            });
        }
    });
});
client.on("message",msg => {
    var content = msg.content;
    console.log(content,msg.author.tag);
    if (msg.author.tag != client.user.tag) {
        msg.channel.send(content+"YEET");
    }
    if (msg.content == "s") quitClient();
});


function quitClient() {
    client.destroy();
    return process.exit(2);
}
client.login(process.env.BOT_TOKEN);
