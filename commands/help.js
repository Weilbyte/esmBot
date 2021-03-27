const collections = require("../utils/collections.js");
const client = require("../utils/client.js");
const misc = require("../utils/misc.js");
const paginator = require("../utils/pagination/pagination.js");

exports.run = async (message, args) => {
  const prefix = process.env.PREFIX;
  const commands = collections.commands;
  const aliases = collections.aliases;
  if (args.length !== 0 && (commands.has(args[0].toLowerCase()) || aliases.has(args[0].toLowerCase()))) {
    const command = aliases.has(args[0].toLowerCase()) ? collections.aliases.get(args[0].toLowerCase()) : args[0].toLowerCase();
    const info = collections.info.get(command);
    const embed = {
      "embed": {
        "author": {
          "name": "esmBot Help",
          "icon_url": client.user.avatarURL
        },
        "title": `${message.channel.guild ? prefix : ""}${command}`,
        "url": "https://projectlounge.pw/esmBot/help.html",
        "description": command === "tags" ? "The main tags command. Check the help page for more info: https://projectlounge.pw/esmBot/help.html" : info.description,
        "color": 16711680,
        "fields": [{
          "name": "Aliases",
          "value": info.aliases ? info.aliases.join(", ") : "None"
        }, {
          "name": "Parameters",
          "value": command === "tags" ? "[name]" : info.params ? info.params : "None",
          "inline": true
        }]
      }
    };
    return embed;
  } else {
    const categories = {
      general: [],
      moderation: [],
      tags: ["**Every command in this category is a subcommand of the tag command.**\n"],
      fun: [],
      images: ["**These commands support the PNG, JPEG, WEBP (static), and GIF (animated or static) formats.**\n"],
      soundboard: [],
      music: []
    };
    for (const [command] of commands) {
      const category = collections.info.get(command).category;
      const description = collections.info.get(command).description;
      const params = collections.info.get(command).params;
      if (category === 1) {
        categories.general.push(`**${command}**${params ? ` ${params}` : ""} - ${description}`);
      } else if (category === 2) {
        categories.moderation.push(`**${command}**${params ? ` ${params}` : ""} - ${description}`);
      } else if (category === 3) {
        const subCommands = [...Object.keys(description)];
        for (const subCommand of subCommands) {
          categories.tags.push(`**tags${subCommand !== "default" ? ` ${subCommand}` : ""}**${params[subCommand] ? ` ${params[subCommand]}` : ""} - ${description[subCommand]}`);
        }
      } else if (category === 4) {
        categories.fun.push(`**${command}**${params ? ` ${params}` : ""} - ${description}`);
      } else if (category === 5) {
        categories.images.push(`**${command}**${params ? ` ${params}` : ""} - ${description}`);
      } else if (category === 6) {
        categories.soundboard.push(`**${command}**${params ? ` ${params}` : ""} - ${description}`);
      } else if (category === 7) {
        categories.music.push(`**${command}**${params ? ` ${params}` : ""} - ${description}`);
      }
    }
    const pages = [];
    for (const category of Object.keys(categories)) {
      const splitPages = categories[category].map((item, index) => {
        return index % 15 === 0 ? categories[category].slice(index, index + 15) : null;
      }).filter((item) => {
        return item;
      });
      for (const page of splitPages) {
        pages.push({
          title: category.charAt(0).toUpperCase() + category.slice(1),
          page: page
        });
      }
    }
    const embeds = [];
    for (const [i, value] of pages.entries()) {
      embeds.push({
        "embed": {
          "author": {
            "name": "esmBot Help",
            "icon_url": client.user.avatarURL
          },
          "title": value.title,
          "description": value.page.join("\n"),
          "color": 16711680,
          "footer": {
            "text": `Page ${i + 1} of ${pages.length}`
          },
          "fields": [{
            "name": "Prefix",
            "value": message.channel.guild ? prefix : "N/A"
          }]
        }
      });
    }
    return paginator(message, embeds);
  }
};

exports.aliases = ["commands"];
exports.category = 1;
exports.help = "Gets a list of commands";
exports.params = "{command}";