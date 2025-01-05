import { NextRequest } from 'next/server';

import { getValidatedUser } from '@util/prisma/actions/user';
import { fetchPinnedPost, fetchRootPosts } from '@util/prisma/actions/posts';

import { response } from '@util/global-server';



// Used for fetching hot/trending posts to display on the feed screen.
export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);

        const cursorParam = searchParams.get('cursor');
        if (!cursorParam) return response(`Missing data.`, 101);
        const cursor = new Date(cursorParam);
        if (isNaN(cursor.getTime())) return response(`Date not valid.`, 102);

        const { userPrisma, validUserResp } = await getValidatedUser();
        if (!userPrisma) return validUserResp;
        const loggedInUserId = userPrisma.id;

        // const { posts, newCursor, moreAvailable} = await fetchRootPosts(cursor, loggedInUserId);

        // return response(`Success.`, 200, { posts, newCursor, moreAvailable });
    } catch (err) {
        return response(`Server error.`, 904);
    }
}