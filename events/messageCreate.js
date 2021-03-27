const fs = require("fs");
const client = require("../utils/client.js");
const s3 = require("../utils/s3upload");
const logger = require("../utils/logger.js");
const collections = require("../utils/collections.js");
const commands = [...collections.aliases.keys(), ...collections.commands.keys()];

// run when someone sends a message
module.exports = async (message) => {
  // ignore dms and other bots
  if (message.author.bot) return;

  // don't run command if bot can't send messages
  if (message.channel.guild && !message.channel.permissionsOf(client.user.id).has("sendMessages")) return;

  // this is here to prevent doing stuff if message is unrelated
  let valid = false;
  for (const key of commands) {
    if (message.content.toLowerCase().includes(key)) {
      valid = true;
      break;
    }
  }
  if (!valid) return;

  let prefix;
  let isMention = false;
  if (message.channel.guild) {
    const user = message.channel.guild.members.get(client.user.id);
    if (message.content.startsWith(user.mention)) {
      prefix = `${user.mention} `;
      isMention = true;
    } else if (message.content.startsWith(`<@${client.user.id}>`)) { // workaround for member.mention not accounting for both mention types
      prefix = `<@${client.user.id}> `;
      isMention = true;
    } else {
      prefix = process.env.PREFIX;
    }
  } else {
    prefix = "";
  }

  // ignore other stuff
  if (message.content.startsWith(prefix) === false) return;

  // separate commands and args
  const replace = isMention ? `@${client.user.username} ` : prefix;
  const content = message.cleanContent.substring(replace.length).trim();
  const rawContent = message.content.substring(prefix.length).trim();
  const args = content.split(/ +/g);
  args.shift();
  const command = rawContent.split(/ +/g).shift().toLowerCase();

  // check if command exists
  const cmd = collections.commands.get(command) || collections.commands.get(collections.aliases.get(command));
  if (!cmd) return;

  // actually run the command
  logger.log("info", `${message.author.username} (${message.author.id}) ran command ${command}`);
  try {
    const startTime = new Date();
    const result = await cmd(message, args, rawContent.replace(command, "").trim()); // we also provide the message content as a parameter for cases where we need more accuracy
    const endTime = new Date();
    if (typeof result === "string" || (typeof result === "object" && result.embed)) {
      await client.createMessage(message.channel.id, result);
    } else if (typeof result === "object" && result.file) {
      if (result.file.length > 8388119 && process.env.TEMPDIR !== "") {
        if (s3.S3Available()) {
          const url = await s3.uploadToS3(result.file, result.name.split(".")[1]);
          await client.createMessage(message.channel.id, {
            embed: {
              color: 16711680,
              title: "Here's your image!",
              url: url,
              image: {
                url: url
              },
              footer: {
                text: "The result image was more than 8MB in size, so it was uploaded to an external site instead."
              },
            },
            content: (endTime - startTime) >= 180000 ? message.author.mention : undefined
          });
        } else {
          await client.createMessage(message.channel.id, 'Cannot upload result because it is larger than 8MB and S3 uploading is not configured')
        }
      } else {
        await client.createMessage(message.channel.id, result.text ? result.text : ((endTime - startTime) >= 180000 ? message.author.mention : undefined), result);
      }
    }
  } catch (error) {
    if (error.toString().includes("Request entity too large")) {
      await client.createMessage(message.channel.id, `${message.author.mention}, the resulting file was too large to upload. Try again with a smaller image if possible.`);
    } else if (error.toString().includes("Timed out")) {
      await client.createMessage(message.channel.id, `${message.author.mention}, the request timed out before I could download that image. Try uploading your image somewhere else.`);
    } else {
      logger.error(error.toString());
      await client.createMessage(message.channel.id, "Uh oh! I ran into an error while running this command.", [{
        file: Buffer.from(`Message: ${error}\n\nStack Trace: ${error.stack}`),
        name: "error.txt"
      }]);
    }
  }
};
