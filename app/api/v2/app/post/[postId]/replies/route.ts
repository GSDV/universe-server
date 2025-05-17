import { NextRequest } from 'next/server';

import { Prisma } from '@prisma/client';

import { getValidatedUser } from '@util/prisma/actions/user';
import { fetchClientBatchPosts } from '@util/prisma/actions/posts';

import { response } from '@util/global-server';



// Given a postId, fetch its replies.
export async function GET(req: NextRequest, { params }: { params: Promise<{ postId: string }> }) {
    try {
        const postId = (await params).postId;
        const { searchParams } = new URL(req.url);
        const cursor = searchParams.get('cursor');
        if (cursor === null) return response(`Missing cursor.`, 101);

        const { userPrisma } = await getValidatedUser();
        const loggedInId = (!userPrisma) ? '' : userPrisma.id;

        const where: Prisma.PostWhereInput = {
            replyToId: postId,
            deleted: false
        };
        const orderBy: Prisma.Enumerable<Prisma.PostOrderByWithRelationInput> = [
            { likeCount: 'desc' },
            { replyCount: 'desc' },
            { createdAt: 'asc' }
        ];
        const { clientPosts, nextCursor, moreAvailable } = await fetchClientBatchPosts(where, cursor, loggedInId, orderBy);

        return response(`Success`, 200, { replies: clientPosts, nextCursor, moreAvailable });
    } catch (_) {
        return response(`Server error.`, 903);
    }
}