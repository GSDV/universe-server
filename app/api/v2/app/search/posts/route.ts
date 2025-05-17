import { NextRequest } from 'next/server';

import { Prisma } from '@prisma/client';

import { getValidatedUser } from '@util/prisma/actions/user';
import { fetchClientBatchPosts } from '@util/prisma/actions/posts';

import { response } from '@util/global-server';



// Used for searching through posts with a query
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

        const where: Prisma.PostWhereInput = {
            replyToId: null,
            deleted: false,
            content: { contains: query, mode: 'insensitive' },
            author: {
                AND: [
                    { blockedBy: { none: { blockerId: loggedInUserId } } },
                    { blocks: { none: { blockedId: loggedInUserId } } }
                ]
            }
        };
        const { clientPosts, nextCursor, moreAvailable} = await fetchClientBatchPosts(where, cursor, loggedInUserId);

        return response(`Success.`, 200, { posts: clientPosts, nextCursor, moreAvailable });
    } catch (err) {
        return response(`Server error.`, 904);
    }
}