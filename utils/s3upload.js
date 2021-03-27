const AWS = require('aws-sdk')
const { v4: uuidv4 } = require('uuid')

exports.S3Available = () => {
    const S3Details = ['ID', 'SECRET', 'ENDPOINT', 'BUCKET']
    for (detail in S3Details) {
        if (process.env[`S3_${S3Details[detail]}`] === undefined || process.env[`S3_${S3Details[detail]}`] === '') return false;
    }
    return true;
}

exports.uploadToS3 = async (content, extension) => {
    const s3 = new AWS.S3({
        accessKeyId: process.env.S3_ID,
        secretAccessKey: process.env.S3_SECRET,
        s3ForcePathStyle: true,
        signatureVersion: 'v4',
        endpoint: process.env.S3_ENDPOINT
    })

    const filename = `${uuidv4()}.${extension}`;
    await s3.upload({ Bucket: process.env.S3_BUCKET, Key: filename, Body: content}).promise()
    return `https://${process.env.S3_BUCKET}.${process.env.S3_ENDPOINT}/${filename}`
}