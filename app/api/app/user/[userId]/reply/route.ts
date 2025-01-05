import { NextRequest } from 'next/server';

import { getValidatedUser } from '@util/prisma/actions/user';
import { fetchAccountReplies } from '@util/prisma/actions/posts';

import { response } from '@util/global-server';



// Used for fetching posts to display on an account screen.
export async function GET(req: NextRequest, { params }: { params: Promise<{ userId: string }> }) {
    try {
        const { searchParams } = new URL(req.url);

        const cursorParam = searchParams.get('cursor');

        const authorId = (await params).userId;
        if (!authorId || !cursorParam) return response(`Missing data.`, 101);

        const cursor = new Date(cursorParam);
        if (isNaN(cursor.getTime())) return response(`Date not valid.`, 102);
        

        const { userPrisma, validUserResp } = await getValidatedUser();
        if (!userPrisma) return validUserResp;
        const loggedInUserId = userPrisma.id;

        const { replies, newCursor, moreAvailable} = await fetchAccountReplies(authorId, cursor, loggedInUserId);

        return response(`Success.`, 200, { replies, newCursor, moreAvailable });
    } catch (err) {
        return response(`Server error.`, 904);
    }
}