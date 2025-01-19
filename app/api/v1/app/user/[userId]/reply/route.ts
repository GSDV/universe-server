import { NextRequest } from 'next/server';

import { Prisma } from '@prisma/client';

import { getValidatedUser } from '@util/prisma/actions/user';
import { fetchClientBatchPosts } from '@util/prisma/actions/posts';

import { response } from '@util/global-server';



// Used for fetching replies to display on an account screen.
export async function GET(req: NextRequest, { params }: { params: Promise<{ userId: string }> }) {
    try {
        const { searchParams } = new URL(req.url);

        const cursor = searchParams.get('cursor');

        const authorId = (await params).userId;
        if (!authorId || cursor == null) return response(`Missing data.`, 101);

        const { userPrisma, validUserResp } = await getValidatedUser();
        if (!userPrisma) return validUserResp;
        const loggedInUserId = userPrisma.id;

        const where: Prisma.PostWhereInput = {
            authorId,
            pinned: false,
            replyToId: { not: null },
            deleted: false
        };
        const { clientPosts, nextCursor, moreAvailable} = await fetchClientBatchPosts(where, cursor, loggedInUserId);

        return response(`Success.`, 200, { replies: clientPosts, nextCursor, moreAvailable });
    } catch (err) {
        return response(`Server error.`, 904);
    }
}