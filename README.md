# TestBot_
A test discord bot for testing.

## Setup

> **!NOTE!**: The `./` directory is the root directory and it is where the `./main.js` and `./package.json` files are.

> **!NOTE!**: The things in triangle braces (<>) are to be substituted with your own values.

### 1. Create `./config.json`

Here is what `./config.json` should contain:
```JSON
{
    "bot": {
        "auth_token":"<your_bot_token>"
    },
    "guild_map": {
        "<your_guild_group>": ["<your_guild_id>","<another_guild_id>"],
        "<second_guild_group>": ["<another_guild_id>"],
    }
}
```

### 2. Create the dir `./command-data/`

This folder should contain the information and executors for the bot's commands. Use `./command-data-example/` to model your files after. It's subfiles and subfolders are as follows:
```
command-data/
    global/
        <a_global_cmd>.json
        <global_command_2>.json
        ...
    <your_guild_group_here>/
        <command_name>.json
        <another_command>.json
        ...
    <another_guild_group>/
        <command_name_3>.json
        <fourth_command>.json
        ...
    command-executors.js
    command-list.json
```
The `.json` files in the subfolders represent objects of the type [ApplicationCommand](https://discord.com/developers/docs/interactions/slash-commands#applicationcommand).

### 3. NodeJS setup
Make sure you have NodeJS installed on your system. In the terminal execute the following commands in the root directory:
```
npm install discord.js
```
