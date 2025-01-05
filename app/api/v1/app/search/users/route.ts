import { NextRequest } from 'next/server';

import { getValidatedUser, searchUsers } from '@util/prisma/actions/user';

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
        if (isNaN(cursor.getTime())) return response(`Date not valid.`, 102);

        const { userPrisma, validUserResp } = await getValidatedUser();
        if (!userPrisma) return validUserResp;
        const loggedInUserId = userPrisma.id;

        const { users, newCursor, moreAvailable} = await searchUsers(query, cursor, loggedInUserId);

        return response(`Success.`, 200, { users, newCursor, moreAvailable });
    } catch (err) {
        return response(`Server error.`, 904);
    }
}