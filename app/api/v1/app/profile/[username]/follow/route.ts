import { NextRequest } from 'next/server';

import { getUser, getValidatedUser, toggleFollow } from '@util/prisma/actions/user';

import { response } from '@util/global-server';

import { isValidUser } from '@util/api/user';



// Used to toggle following of a user.
// username param is the username of the person to follow (target).
// userPrisma obtained from cookies is the follower (source).
export async function POST(req: NextRequest, { params }: { params: Promise<{ username: string }> }) {
    try {
        const { followed } = await req.json();
        if (typeof followed !== 'boolean') return response(`No data provided.`, 101);

        const username = (await params).username;
        if (!username) return response(`No data provided.`, 101);

        const { userPrisma, validUserResp } = await getValidatedUser();
        if (!userPrisma) return validUserResp;

        if (username.toLowerCase() === userPrisma.username.toLowerCase()) return response(`Same user.`, 406);

        const targetUser = await getUser({ username });
        const resValidUser = isValidUser(targetUser);
        if (!resValidUser.valid) return resValidUser.res;
        // For TypeScript:
        if (!targetUser) return response(`Something went wrong`, 900);

        await toggleFollow(targetUser.id, userPrisma.id, followed);

        return response(`Success`, 200);
    } catch (err: any) {
        return response(`Server error.`, 903);
    }
}