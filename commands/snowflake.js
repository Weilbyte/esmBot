exports.run = async (message, args) => {
  if (!args[0].match(/^\d+$/) && args[0] < 21154535154122752) return `${message.author.mention}, that's not a valid snowflake!`;
  return new Date((args[0] / 4194304) + 1420070400000).toUTCString();
};

exports.aliases = ["timestamp", "snowstamp", "snow"];