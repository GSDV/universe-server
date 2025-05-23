import { NextRequest } from 'next/server';

import { Prisma } from '@prisma/client';

import { getValidatedUser } from '@util/prisma/actions/user';
import { fetchClientBatchPosts } from '@util/prisma/actions/posts';

import { response } from '@util/global-server';



// Used for fetching new posts from following to display on the feed screen.
export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);

        const cursor = searchParams.get('cursor');
        if (cursor === null) return response(`Missing data.`, 101);
        const { userPrisma, validUserResp } = await getValidatedUser();
        if (!userPrisma) return validUserResp;
        const loggedInUserId = userPrisma.id;

        const where: Prisma.PostWhereInput = {
            author: {
                followers: {
                    some: { followerId: loggedInUserId }
                },
                banned: false,
                deleted: false
            },
            deleted: false,
            replyToId: null
        };
        const orderBy: Prisma.Enumerable<Prisma.PostOrderByWithRelationInput> = [
            { createdAt: 'desc' },
            { likeCount: 'desc' },
            { replyCount: 'desc' }
        ];

        const { clientPosts, nextCursor, moreAvailable} = await fetchClientBatchPosts(where, cursor, loggedInUserId, orderBy);

        return response(`Success.`, 200, { posts: clientPosts, nextCursor, moreAvailable });
    } catch (err) {
        return response(`Server error.`, 904);
    }
}