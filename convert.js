'use strict';

const AWS = require('aws-sdk');
const fs = require('fs').promises; // Usando a API promisificada do fs
const { exec } = require('child_process').promises;
const s3 = new AWS.S3();

module.exports.convert = async ({ Records: records }, context) => {
  try {
    await Promise.all(records.map(async (record) => {
      try {
        const key = decodeURIComponent(record.s3.object.key.replace(/\+/g, ' '));
        const bucketName = record.s3.bucket.name;
        const videoName = key.split('/').pop();
        const videoBaseName = videoName.split('.')[0];
        const randomNum = Math.floor(Math.random() * 1000);
        const tempVideoPath = `/tmp/${videoName}`;
        const convertedVideoPath = `/tmp/${videoBaseName}_${randomNum}.mp4`;

        // Downloading video from S3
        const video = await s3.getObject({
          Bucket: bucketName,
          Key: key
        }).promise();

        await fs.writeFile(tempVideoPath, video.Body);

        // Converting video
        await exec(`/opt/ffmpeg/ffmpeg -i ${tempVideoPath} -vcodec libx264 -pix_fmt yuv420p -profile:v baseline -level 3 -f mp4 ${convertedVideoPath}`);

        const outputFileBuffer = await fs.readFile(convertedVideoPath);

        // Uploading converted video to S3
        await s3.putObject({
          Body: outputFileBuffer,
          Bucket: bucketName,
          ContentType: 'video/mp4',
          Key: `converted/${videoBaseName}_${randomNum}.mp4`
        }).promise();

        // Cleanup: remove temporary files
        await fs.unlink(tempVideoPath);
        await fs.unlink(convertedVideoPath);

      } catch (error) {
        console.error('Error processing record', record, error);
      }
    }));
  } catch (error) {
    console.error('Error in conversion process', error);
  }
};
