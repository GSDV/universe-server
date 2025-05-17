import { NextRequest } from 'next/server';

import { Prisma } from '@prisma/client';

import { fetchClientBatchUsers, getValidatedUser } from '@util/prisma/actions/user';

import { response } from '@util/global-server';



// Used for searching through users with a query
export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);

        const queryParam = searchParams.get('query');
        const cursor = searchParams.get('cursor');
        if (!queryParam || cursor === null) return response(`Missing data.`, 101);

        const query = queryParam.trim().toLowerCase();

        const { userPrisma, validUserResp } = await getValidatedUser();
        if (!userPrisma) return validUserResp;
        const loggedInUserId = userPrisma.id;


        const where: Prisma.UserWhereInput = {
            banned: false,
            deleted: false,
            OR: [
                { displayName: { contains: query, mode: 'insensitive' } },
                { username: { contains: query, mode: 'insensitive' } }
            ]
        };
        const { clientUsers, nextCursor, moreAvailable} = await fetchClientBatchUsers(where, cursor, loggedInUserId);

        return response(`Success.`, 200, { users: clientUsers, nextCursor, moreAvailable });
    } catch (err) {
        return response(`Server error.`, 904);
    }
}