'use strict';

const AWS = require('aws-sdk'),
      fs = require('fs'),
      util = require('util'),
      exec = util.promisify(require('child_process').exec),
      s3 = new AWS.S3();

module.exports.convert = async ({ Records: records }, context) => {
    try {
      await Promise.all(
        records.map(async record => {
          
          try {
              const { key } = record.s3.object;
              const bucket_name = record.s3['bucket']['name'];
              const video_name = key.split('/').slice(-1)[0];
              const video_base_name = video_name.split('.')[0];
              const numero_aleatorio = Math.floor(Math.random() * 1000);
  
              const video = await s3.getObject({
                Bucket: bucket_name,
                Key: key
              }).promise();

              const inputStream = fs.createWriteStream(`/tmp/${video_name}`);
              inputStream.write(video.Body);
            
              const { stdout, stderr } = await exec(`/opt/ffmpeg/ffmpeg -i /tmp/${video_name} -vcodec libx264 -pix_fmt yuv420p -profile:v baseline -level 3 -f mp4 /tmp/${video_base_name}_${numero_aleatorio}.mp4`);

              const outputFileBuffer = await fs.readFileSync(`/tmp/${video_base_name}_${numero_aleatorio}.mp4`);
  
              await s3.putObject({
                Body: outputFileBuffer,
                Bucket: bucket_name,
                ContentType: 'binary/octet-stream',
                Key: key
              }).promise();

          } catch(error) {
            console.log(error);
          }
        })
      );
    } catch(error) {
      console.log(error);
    }
};
