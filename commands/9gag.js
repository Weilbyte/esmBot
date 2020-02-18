const fs = require("fs");
const gm = require("gm").subClass({
  imageMagick: true
});
const gmToBuffer = require("../utils/gmbuffer.js");

exports.run = async (message) => {
  message.channel.sendTyping();
  const image = await require("../utils/imagedetect.js")(message);
  if (image === undefined) return `${message.author.mention}, you need to provide an image to add a 9GAG watermark!`;
  const watermark = "./assets/images/9gag.png";
  const data = gm(image.path).coalesce().out("null:").out(watermark).gravity("East").out("-layers", "composite").out("-layers", "optimize");
  return message.channel.createMessage("", {
    file: await gmToBuffer(data, image.outputType),
    name: `9gag.${image.outputType}`
  });
};

exports.aliases = ["ninegag", "gag"];
exports.category = 5;
exports.help = "Adds the 9gag watermark to an image";