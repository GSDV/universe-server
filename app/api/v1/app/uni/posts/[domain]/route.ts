import { NextRequest } from 'next/server';

import { Prisma } from '@prisma/client';

import { getValidatedUser } from '@util/prisma/actions/user';
import { fetchClientBatchPosts } from '@util/prisma/actions/posts';

import { response } from '@util/global-server';



// Used for fetching posts from a specific school.
// Note: we cannot rely on checking an author's university field, because the university may not have been added yet.
export async function GET(req: NextRequest, { params }: { params: Promise<{ domain: string }> }) {
    try {
        const { searchParams } = new URL(req.url);
        const domain = (await params).domain;

        const cursor = searchParams.get('cursor');
        if (cursor === null) return response(`Missing data.`, 101);
        const { userPrisma, validUserResp } = await getValidatedUser();
        if (!userPrisma) return validUserResp;
        const loggedInUserId = userPrisma.id;

        // Posts need to be less than 3 day old in order to be considered trending on its school page.
        const cutoff = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);

        const where: Prisma.PostWhereInput = {
            deleted: false,
            replyToId: null,
            createdAt: { gte: cutoff },
            author: {
                email: { endsWith: domain },
                AND: [
                    { blockedBy: { none: { blockerId: loggedInUserId } } },
                    { blocks: { none: { blockedId: loggedInUserId } } }
                ]
            }
        };
        const orderBy: Prisma.Enumerable<Prisma.PostOrderByWithRelationInput> = [
            { likeCount: 'desc' },
            { createdAt: 'desc' },
            { replyCount: 'desc' }
        ];
        const { clientPosts, nextCursor, moreAvailable} = await fetchClientBatchPosts(where, cursor, loggedInUserId, orderBy);

        return response(`Success.`, 200, { posts: clientPosts, nextCursor, moreAvailable });
    } catch (err) {
        return response(`Server error.`, 904);
    }
}