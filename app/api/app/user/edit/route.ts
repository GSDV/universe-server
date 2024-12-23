import { NextRequest } from 'next/server';

import { getValidatedUserWithUni, updateUser } from '@util/prisma/actions/user';

import { userPfpKey } from '@util/global';
import { response } from '@util/global-server';

import { isValidDisplayName, isValidUsername, redactUserPrisma } from '@util/api/user';



// Create ActivationToken and send a verification email.
// This is handler used for the first AND subsequent (resends) ActivateToken creations.
export async function POST(req: NextRequest) {
    try {
        const { data } = await req.json();
        if (!data) return response(`No data provided.`, 101);
        let { displayName, username, pfpKey } = data;
        console.log(data)

        const { userPrisma, validUserResp } = await getValidatedUserWithUni();
        if (!userPrisma) return validUserResp;

        const newData: any = {};

        if (typeof displayName == 'string') {
            if (!isValidDisplayName(displayName)) return response(`Display names must be 1-30 characters.`, 102);
            else newData.displayName = displayName;
        }

        if (typeof username == 'string') {
            if (!isValidUsername(username)) return response(`Usernames must be 4-20 characters, and start with a letter.`, 102);
            else newData.username = username;
        }

        if (typeof pfpKey == 'string') {
            if (pfpKey !== userPfpKey(userPrisma.id)) return response(`Logged in account differs from upload.`, 102);
            else newData.username = username;
        }

        const newUserPrisma = await updateUser({ id: userPrisma.id }, newData);

        return response('Success', 200, { user: redactUserPrisma(newUserPrisma) });
    } catch (err: any) {
        if ((err.code, err.code === 'P2002') && (err.meta?.target?.includes('username'))) return response(`This username is already taken.`, 405);
        return response(`Server error: ${err}`, 903);
    }
}

