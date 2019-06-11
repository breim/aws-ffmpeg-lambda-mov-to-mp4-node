# aws-ffmpeg-lambda-mov-to-mp4-node


This repo get **.mov** and **.MOV** files uploaded in bucket `my-special-bucket-change-it` and convert to mp4 and upload to folder `compressed`. You need change bucket name **my-special-bucket-change-it** to your bucket.

### Deploy
Install serverless:

``sudo npm install serverless``
 
 Deploy code to production:
 
``git clone https://github.com/breim/aws-ffmpeg-lambda-mov-to-mp4-node``

Edit your 

 ``cd aws-ffmpeg-lambda-mov-to-mp4 && sls deploy``
 
 After code deployed we need enable S3Full Access to IAM role created by serverless lib. Just follow prints bellow:
 
![Screenshot](https://i.imgur.com/DkzK40N.png)
 
![Screenshot](https://i.imgur.com/l8RSIwV.png)
 
![Screenshot](https://i.imgur.com/nnF46OZ.png) 

