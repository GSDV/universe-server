import { NextRequest } from 'next/server';

import { getValidatedUserWithUni, updateUser } from '@util/prisma/actions/user';

import { avatarKeyPrefix, isValidBio, isValidDisplayName, isValidUsername } from '@util/global';
import { response } from '@util/global-server';

import { redactUserPrisma } from '@util/api/user';
import { deleteFromS3 } from '@util/aws/s3';



// Used for making edits to profile
export async function POST(req: NextRequest) {
    try {
        const { data } = await req.json();
        if (!data) return response(`No data provided.`, 101);
        let { pfpKey, displayName, username, bio } = data;

        const { userPrisma, validUserResp } = await getValidatedUserWithUni();
        if (!userPrisma) return validUserResp;

        const newData: any = {};

        if (typeof displayName == 'string') {
            if (!isValidDisplayName(displayName)) return response(`Display names must be 1-30 characters.`, 102);
            else newData.displayName = displayName.replace(/[\r\n]+/g, ' ').trim();
        }

        if (typeof username == 'string') {
            if (!isValidUsername(username)) return response(`Usernames must be 4-20 characters, and start with a letter.`, 102);
            else newData.username = username.replace(/[\r\n]+/g, ' ').trim();
        }

        if (typeof pfpKey == 'string') {
            const avatarPrefix = avatarKeyPrefix(userPrisma.id);
            if (!pfpKey.startsWith(avatarPrefix)) return response(`Logged in account differs from upload.`, 102);
            if (userPrisma.pfpKey !== '') await deleteFromS3(userPrisma.pfpKey);
            else newData.pfpKey = pfpKey;
        }

        if (typeof bio == 'string') {
            if (!isValidBio(bio)) return response(`Bios must be under 150 characters`, 102);
            else newData.bio = bio.replace(/[\r\n]+/g, ' ').trim();
        }

        const newUserPrisma = await updateUser({ id: userPrisma.id }, newData);

        return response('Success', 200, { user: redactUserPrisma(newUserPrisma) });
    } catch (err: any) {
        if ((err.code, err.code === 'P2002') && (err.meta?.target?.includes('username'))) return response(`This username is already taken.`, 405);
        return response(`Server error.`, 903);
    }
}