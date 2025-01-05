import { NextRequest } from 'next/server';

import { Prisma } from '@prisma/client';

import { getUserWithUniFromAuth, getValidatedUser } from '@util/prisma/actions/user';
import { fetchClientBatchPosts } from '@util/prisma/actions/posts';

import { response } from '@util/global-server';
import { isValidUser } from '@util/api/user';
import { AUTH_TOKEN_COOKIE_KEY } from '@util/global';
import { cookies } from 'next/headers';



// Used for fetching school posts to display on the feed screen.
// Note: we cannot rely on checking an author's university field, because the university may not have been added yet.
export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);

        const cursor = searchParams.get('cursor');
        if (cursor === null) return response(`Missing data.`, 101);


        // Must manually get user schema to get email field, which is usually redacted.
        const cookieStore = await cookies();
        const authTokenCookie = cookieStore.get(AUTH_TOKEN_COOKIE_KEY);
        if (!authTokenCookie || authTokenCookie.value === '') return response(`You are not logged in.`, 103);
        const authToken = authTokenCookie.value;
        const userPrisma = await getUserWithUniFromAuth(authToken);
        const { valid, res } = isValidUser(userPrisma);
        if (!valid) return res;
        // TypeScript:
        if (!userPrisma) return response(`You are not logged in.`, 103);
        const loggedInUserId = userPrisma.id;

        const emailSplit = userPrisma.email.split('@');
        if (emailSplit.length != 2) return response(`Something went wrong.`, 900); 
        const domain = emailSplit[1];

        // Posts need to be less than 3 days old in order to be displayed.
        const cutoff = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);

        const where: Prisma.PostWhereInput = {
            deleted: false,
            replyToId: null,
            displayDate: { gte: cutoff },
            author: {
                email: { endsWith: domain }
            }
        };
        const orderBy: Prisma.Enumerable<Prisma.PostOrderByWithRelationInput> = [
            { likeCount: 'desc' },
            { displayDate: 'desc' },
            { replyCount: 'desc' }
        ];
        const { clientPosts, nextCursor, moreAvailable} = await fetchClientBatchPosts(where, cursor, loggedInUserId, orderBy);

        return response(`Success.`, 200, { posts: clientPosts, nextCursor, moreAvailable });
    } catch (err) {
        return response(`Server error.`, 904);
    }
}