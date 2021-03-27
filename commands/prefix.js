exports.run = async (message) => {
  if (!message.channel.guild) return `${message.author.mention}, this command only works in servers!`;
  return `${message.author.mention}, the current prefix is \`${guild.prefix}\`.`;
};

exports.aliases = ["checkprefix", "prefix"];
exports.category = 1;
exports.help = "Checks the server prefix";