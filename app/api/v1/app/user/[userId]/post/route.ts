import { NextRequest } from 'next/server';

import { Prisma } from '@prisma/client';

import { getValidatedUser } from '@util/prisma/actions/user';
import { fetchPinnedPost, fetchClientBatchPosts } from '@util/prisma/actions/posts';

import { response } from '@util/global-server';



// Used for fetching posts to display on an account screen.
export async function GET(req: NextRequest, { params }: { params: Promise<{ userId: string }> }) {
    try {
        const { searchParams } = new URL(req.url);

        const cursor = searchParams.get('cursor');
        const getPinnedParam = searchParams.get('getPinned');

        const authorId = (await params).userId;
        if (!authorId || cursor == null) return response(`Missing data.`, 101);

        const getPinned = getPinnedParam === 'true';

        const { userPrisma, validUserResp } = await getValidatedUser();
        if (!userPrisma) return validUserResp;
        const loggedInUserId = userPrisma.id;

        // Will only fetch non-pinned, root posts.
        const where: Prisma.PostWhereInput = {
            authorId,
            pinned: false,
            replyToId: null,
            deleted: false
        };
        const { clientPosts, nextCursor, moreAvailable} = await fetchClientBatchPosts(where, cursor, loggedInUserId);

        let pinnedPost = null;
        if (getPinned) pinnedPost = await fetchPinnedPost(authorId, loggedInUserId);

        if (pinnedPost) return response(`Success.`, 200, { posts: [pinnedPost, ...clientPosts], nextCursor, moreAvailable });
        return response(`Success.`, 200, { posts: clientPosts, nextCursor, moreAvailable });
    } catch (err) {
        return response(`Server error.`, 904);
    }
}