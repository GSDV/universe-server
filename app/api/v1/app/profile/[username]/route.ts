import { NextRequest } from 'next/server';

import { getProfileUser, getValidatedUser } from '@util/prisma/actions/user';

import { response } from '@util/global-server';

import { redactUserPrisma } from '@util/api/user';



// Used to fetch the profile info of another account when viewing.
export async function GET(req: NextRequest, { params }: { params: Promise<{ username: string }> }) {
    try {
        const username = (await params).username;

        const { userPrisma: loggedInUserPrisma } = await getValidatedUser();
        const loggedInId= (!loggedInUserPrisma) ? '' : loggedInUserPrisma.id;

        const userPrisma = await getProfileUser({ username }, loggedInId);
        if (!userPrisma) return response(`Account does not exist.`, 404);

        const redactedUserPrisma = redactUserPrisma(userPrisma);
        const clientUserPrisma = {
            ...redactedUserPrisma,
            isFollowed: userPrisma.isFollowed,
            isBlocking: userPrisma.isBlocking,
            isBlockedBy: userPrisma.isBlockedBy
        }

        const ownAccount = clientUserPrisma.id === loggedInId;

        return response(`Success`, 200, { user: clientUserPrisma, ownAccount });
    } catch (err) {
        return response(`Server error.`, 904);
    }
}