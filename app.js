if (process.platform === "win32") console.log("\x1b[1m\x1b[31m\x1b[40m" + `WIN32 IS NOT OFFICIALLY SUPPORTED!
Although there's a (very) slim chance of it working, multiple aspects of the bot are built with UNIX-like systems in mind and could break on Win32-based systems. If you want to run the bot on Windows, using Windows Subsystem for Linux is highly recommended.
The bot will continue to run past this message, but keep in mind that it could break at any time. Continue running at your own risk; alternatively, stop the bot using Ctrl+C and install WSL.` + "\x1b[0m");

// load config from .env file
require("dotenv").config();

// turn fs.readdir into a promise
const readdir = require("util").promisify(require("fs").readdir);
// fancy loggings
const logger = require("./utils/logger.js");
// start the client
const client = require("./utils/client.js");
// initialize command loader
const handler = require("./utils/handler.js");

// registers stuff and connects the bot
async function init() {
  logger.log("info", "Starting bot...");
  // register commands and their info
  const commands = await readdir("./commands/");
  logger.log("info", `Attempting to load ${commands.length} commands...`);
  for (const commandFile of commands) {
    logger.log("info", `Loading command ${commandFile}...`);
    try {
      await handler.load(commandFile);
    } catch (e) {
      logger.error(`Failed to register command ${commandFile.split(".")[0]}: ${e}`);
    }
  }

  // register events
  const events = await readdir("./events/");
  logger.log("info", `Attempting to load ${events.length} events...`);
  for (const file of events) {
    logger.log("info", `Loading event ${file}...`);
    const eventName = file.split(".")[0];
    const event = require(`./events/${file}`);
    client.on(eventName, event);
  }

  // login
  client.connect();

  // handle ctrl+c and pm2 stop
  process.on("SIGINT", () => {
    logger.log("info", "SIGINT detected, shutting down...");
    client.editStatus("dnd", {
      name: "Restarting/shutting down..."
    });
    for (const command of commands) {
      handler.unload(command);
    }
    client.disconnect();
    process.exit(0);
  });
}

// launch the bot
init();