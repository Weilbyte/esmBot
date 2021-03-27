const magick = require("../build/Release/image.node");
const { Worker } = require("worker_threads");
const fetch = require("node-fetch");
const AbortController = require("abort-controller");
const fileType = require("file-type");
const path = require("path");
const logger = require("./logger.js");

const formats = ["image/jpeg", "image/png", "image/webp", "image/gif"];

exports.check = (cmd) => {
  return magick[cmd] ? true : false;
};

exports.getType = async (image) => {
  if (!image.startsWith("http")) {
    const imageType = await fileType.fromFile(image);
    if (imageType && formats.includes(imageType.mime)) {
      return imageType.mime;
    }
    return undefined;
  }
  let type;
  const controller = new AbortController();
  const timeout = setTimeout(() => {
    controller.abort();
  }, 25000);
  try {
    const imageRequest = await fetch(image, { signal: controller.signal, headers: {
      "Range": "bytes=0-1023"
    }});
    clearTimeout(timeout);
    const imageBuffer = await imageRequest.buffer();
    const imageType = await fileType.fromBuffer(imageBuffer);
    if (imageType && formats.includes(imageType.mime)) {
      type = imageType.mime;
    }
  } catch (error) {
    if (error.name === "AbortError") {
      throw Error("Timed out");
    } else {
      throw error;
    }
  } finally {
    clearTimeout(timeout);
  }
  return type;
};

exports.run = object => {
  return new Promise((resolve, reject) => {
      const worker = new Worker(path.join(__dirname, "image-runner.js"), {
        workerData: object
      });
      worker.on("message", (data) => {
        resolve({
          buffer: Buffer.from([...data.buffer]),
          type: data.fileExtension
        });
      });
      worker.on("error", reject);
  });
};
