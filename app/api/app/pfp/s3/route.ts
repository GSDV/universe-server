import { NextRequest } from 'next/server';

import { getValidatedUser } from '@util/prisma/actions/user';

import { ACCEPTED_IMGS, IMG_SIZE_LIMIT, IMG_SIZE_LIMIT_TXT, mediaKeyPrefix } from '@util/global';
import { response } from '@util/global-server';

import { getSignedS3Url } from '@util/aws';



// Get a signed AWS S3 upload URL so that user can upload a profile picture (bypass 4.5mb limit).
export async function POST(req: NextRequest) {
    try {
        const { fileType, fileSize } = await req.json();
        if (typeof fileType != 'string' || typeof fileSize != 'number') return response(`Missing data fields.`, 101);

        const { userPrisma, validUserResp } = await getValidatedUser();
        if (!userPrisma) return validUserResp;

        if (!ACCEPTED_IMGS.includes(fileType)) return response(`Upload only png, jpg, or webp files.`, 102);
        if (fileSize > IMG_SIZE_LIMIT) return response(`Upload images less than ${IMG_SIZE_LIMIT_TXT}.`, 102);

        const prefix = mediaKeyPrefix(userPrisma.id);
        const { signedUrl, key } = await getSignedS3Url(prefix, fileType);
        return response(`Success`, 200, { signedUrl, key });
    } catch (err) {
        return response(`Server error: ${err}`, 900);
    }
}