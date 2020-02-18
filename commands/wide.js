const gm = require("gm").subClass({
  imageMagick: true
});
const gmToBuffer = require("../utils/gmbuffer.js");

exports.run = async (message) => {
  message.channel.sendTyping();
  const image = await require("../utils/imagedetect.js")(message);
  if (image === undefined) return `${message.author.mention}, you need to provide an image to stretch!`;
  gm(image.path).size(async (error, size) => {
    if (error) throw error;
    if (size.width > 10000) return `${message.author.mention}, this image is too wide!`;
    const data = gm(image.path).coalesce().resize(`${(size.width * 19) / 2}x${size.height / 2}!`);
    return message.channel.createMessage("", {
      file: await gmToBuffer(data, image.outputType),
      name: `wide.${image.outputType}`
    });
  });
};

exports.aliases = ["w19", "wide19"];
exports.category = 5;
exports.help = "Stretches an image to 19x its width";