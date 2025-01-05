import { NextRequest } from 'next/server';

import { getValidatedUser } from '@util/prisma/actions/user';

import { ACCEPTED_FILES, ACCEPTED_IMGS, ACCEPTED_VIDS, IMG_SIZE_LIMIT, IMG_SIZE_LIMIT_TXT, VID_SIZE_LIMIT, VID_SIZE_LIMIT_TXT, mediaKeyPrefix } from '@util/global';
import { response } from '@util/global-server';

import { getSignedS3Url } from '@util/aws';



// Get a signed AWS S3 upload URL so that user can upload a photo or video on the client (bypass 4.5mb limit).
// Part of post creation process.
export async function POST(req: NextRequest) {
    try {
        const { fileType, fileSize } = await req.json();
        if (typeof fileType != 'string' || typeof fileSize != 'number') return response(`Missing data fields.`, 101);

        const { userPrisma, validUserResp } = await getValidatedUser();
        if (!userPrisma) return validUserResp;

        if (!ACCEPTED_FILES.includes(fileType)) return response(`Upload only png, jpg, webp, mp4, or mov files.`, 102);
        if (ACCEPTED_IMGS.includes(fileType) && fileSize > IMG_SIZE_LIMIT) return response(`Upload images less than ${IMG_SIZE_LIMIT_TXT}.`, 102);
        if (ACCEPTED_VIDS.includes(fileType) && fileSize > VID_SIZE_LIMIT) return response(`Upload videos less than ${VID_SIZE_LIMIT_TXT}.`, 102);

        const prefix = mediaKeyPrefix(userPrisma.id);
        const { signedUrl, key } = await getSignedS3Url(prefix, fileType);
        return response(`Success`, 200, { signedUrl, key });
    } catch (err) {
        return response(`Server error.`, 900);
    }
}