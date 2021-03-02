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
        "authToken": "<bot token>"
    }, 
    "debug": true,
    "annoyanceSettings": {
        "id":"<id>",
        "name":"<name>",
        "amount":0.3
    }
}
```

### 2. NodeJS setup
Make sure you have NodeJS installed on your system. In the terminal execute the following commands in the root directory:
```
npm install
```
