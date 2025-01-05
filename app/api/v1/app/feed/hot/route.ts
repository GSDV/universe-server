import { NextRequest } from 'next/server';

import { Prisma } from '@prisma/client';

import { getValidatedUser } from '@util/prisma/actions/user';
import { fetchClientBatchPosts } from '@util/prisma/actions/posts';

import { response } from '@util/global-server';



// Used for fetching hot/trending posts to display on the feed screen.
export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);

        const cursor = searchParams.get('cursor');
        if (cursor === null) return response(`Missing data.`, 101);
        const { userPrisma, validUserResp } = await getValidatedUser();
        if (!userPrisma) return validUserResp;
        const loggedInUserId = userPrisma.id;

        // Posts need to be less than 1 day old in order to be considered trending.
        const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000);

        const where: Prisma.PostWhereInput = {
                deleted: false,
                replyToId: null,
                displayDate: { lte: cutoff },
        };
        const orderBy: Prisma.Enumerable<Prisma.PostOrderByWithRelationInput> = [
            { likeCount: 'desc' },
            { replyCount: 'desc' }
        ];
        const { clientPosts, nextCursor, moreAvailable} = await fetchClientBatchPosts(where, cursor, loggedInUserId, orderBy);

        return response(`Success.`, 200, { posts: clientPosts, nextCursor, moreAvailable });
    } catch (err) {
        return response(`Server error.`, 904);
    }
}