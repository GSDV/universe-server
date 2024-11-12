import { NextRequest } from 'next/server';

import { getRedactedUserFromAuth } from '@util/prisma/actions/user';
import { fetchPinnedPost, fetchRootPosts } from '@util/prisma/actions/posts';

import { response } from '@util/global-server';
import { cookies } from 'next/headers';
import { AUTH_TOKEN_COOKIE_KEY } from '@util/global';



// Used for fetching posts to display on an account page.
export async function GET(req: NextRequest, { params }: { params: Promise<{ userId: string }> }) {
    try {
        const authorId = (await params).userId;

        const { searchParams } = new URL(req.url);
        let page = Number(searchParams.get("page"));
        if (Number.isNaN(page)) page = 1;

        // It is not necessary to be logged in to view an account, but if we also want to fetch whether or not the user liked a post
        const cookieStore = await cookies();
        const authTokenCookie = cookieStore.get(AUTH_TOKEN_COOKIE_KEY);
        const authToken = (!authTokenCookie) ? '' : authTokenCookie.value;
        const loggedInUserPrisma = await getRedactedUserFromAuth(authToken);
        const loggedInUserId = (!loggedInUserPrisma) ? '' : loggedInUserPrisma.id;

        const { posts, moreAvailable} = await fetchRootPosts(authorId, page, loggedInUserId);

        // If first page, also get the pinned post.
        let pinnedPost = null;
        if (page == 1) pinnedPost = await fetchPinnedPost(authorId, loggedInUserId);

        if (pinnedPost) return response(`Success.`, 200, { posts: [pinnedPost, ...posts], moreAvailable });
        return response(`Success.`, 200, { posts, moreAvailable });
    } catch (err) {
        return response(`Server error: ${err}`, 904);
    }
}