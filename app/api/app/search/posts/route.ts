import { NextRequest } from 'next/server';

import { getValidatedUser } from '@util/prisma/actions/user';
import { searchPosts } from '@util/prisma/actions/posts';

import { response } from '@util/global-server';



// Used for searching through posts with a query
export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);

        const queryParam = searchParams.get('query');
        const cursorParam = searchParams.get('cursor');
        if (!queryParam || !cursorParam) return response(`Missing data.`, 101);

        const query = queryParam.trim().toLowerCase();
        const cursor = new Date(cursorParam);

        const { userPrisma, validUserResp } = await getValidatedUser();
        if (!userPrisma) return validUserResp;
        const loggedInUserId = userPrisma.id;

        const { posts, newCursor, moreAvailable} = await searchPosts(query, cursor, loggedInUserId);

        return response(`Success.`, 200, { posts, newCursor, moreAvailable });
    } catch (err) {
        return response(`Server error: ${err}`, 904);
    }
}