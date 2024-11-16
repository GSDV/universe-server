import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { v4 as uuidv4 } from 'uuid';
import { ACCEPTED_IMGS, ACCEPTED_VIDS } from './global';



export const s3Client = new S3Client({
    region: process.env.S3_REGION,
    credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY_ID as string,
        secretAccessKey: process.env.S3_SECRET_ACCESS_KEY as string
    }
});



export const uploadToS3 = async (buffer: Buffer, key: string, type: string) => {
    const params = {
        Bucket: process.env.S3_BUCKET_NAME,
        Key: key,
        Body: buffer,
        ContentType: type
    }
    const cmd = new PutObjectCommand(params);
    const res = await s3Client.send(cmd);
}



export const getFromS3 = async (key: string) => {
    const params = {
        Bucket: process.env.S3_BUCKET_NAME,
        Key: key
    }
    const cmd = new GetObjectCommand(params);
    const res = await s3Client.send(cmd);
    return res;
}



export const deleteFromS3 = async (key: string) => {
    const params = {
        Bucket: process.env.S3_BUCKET_NAME,
        Key: key
    }
    const cmd = new DeleteObjectCommand(params);
    const res = await s3Client.send(cmd);
}



export const getSignedS3Url = async (prefix: string, fileType: string) => {
    const type = (ACCEPTED_IMGS.includes(fileType)) ? 'image' : 'video';
    const key = prefix + uuidv4() + '-' + type;

    const command = new PutObjectCommand({
        Bucket: process.env.S3_BUCKET_NAME,
        Key: key,
        ContentType: fileType
    });

    const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: (60*5) });
    return {signedUrl, key};
}