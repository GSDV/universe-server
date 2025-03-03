import { NextRequest } from 'next/server';

import { getValidatedUser } from '@util/prisma/actions/user';

import { ACCEPTED_IMGS, AVATAR_SIZE_LIMIT_TXT, AVATAR_SIZE_LIMIT, avatarKeyPrefix } from '@util/global';
import { response } from '@util/global-server';

import { getSignedS3Url } from '@util/aws/s3';



// Get a signed AWS S3 upload URL so that user can upload a profile picture (bypass 4.5mb limit).
export async function POST(req: NextRequest) {
    try {
        const { fileType, fileSize } = await req.json();
        if (typeof fileType != 'string' || typeof fileSize != 'number') return response(`Missing data fields.`, 101);

        const { userPrisma, validUserResp } = await getValidatedUser();
        if (!userPrisma) return validUserResp;

        if (!ACCEPTED_IMGS.includes(fileType)) return response(`Upload only png or jpg files.`, 102);
        if (fileSize > AVATAR_SIZE_LIMIT) return response(`Upload images less than ${AVATAR_SIZE_LIMIT_TXT}.`, 102);

        const avatarPrefix = avatarKeyPrefix(userPrisma.id);
        const { signedUrl, key } = await getSignedS3Url(avatarPrefix, fileType);

        return response(`Success`, 200, { signedUrl, key });
    } catch (_) {
        return response(`Server error.`, 900);
    }
}