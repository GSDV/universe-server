import { NextRequest } from 'next/server';

import { cookies } from 'next/headers';

import { getRedactedUserFromAuth } from '@util/prisma/actions/user';
import { createPost } from '@util/prisma/actions/posts';

import { AUTH_TOKEN_COOKIE_KEY } from '@util/global';
import { response } from '@util/global-server';

import { isValidUser } from '@util/api/user';
import { validateCreatePostData } from '@util/api/posts';



// Used to create a post
export async function POST(req: NextRequest) {
    try {
        const { postDataInput } = await req.json();
        if (!postDataInput) return response(`No data provided.`, 101);

        const cookieStore = await cookies();
        const authTokenCookie = cookieStore.get(AUTH_TOKEN_COOKIE_KEY);
        if (!authTokenCookie) return response(`You are not logged in.`, 103);
        const authToken = authTokenCookie.value;
        const userPrisma = await getRedactedUserFromAuth(authToken);
        if (!userPrisma) return response(`You are not logged in`, 404);
        const resValidUser = isValidUser(userPrisma);
        if (!resValidUser.valid) return resValidUser.res;

        const resInput = validateCreatePostData(postDataInput);
        if (!resInput.valid || resInput.data == undefined) return resInput.resp;
        const postData = resInput.data;

        // Make sure every media key passed in comes from the user posting.
        const postIncludesOtherKey = postData.media.some((key) => !(key.includes(userPrisma.id)));
        if (postIncludesOtherKey) return response('Something went wrong.', 101);

        const post = await createPost(userPrisma.id, postData);

        return response(`Success`, 200, { postId: post.id, post });
    } catch (err: any) {
        return response(`Server error: ${err}`, 903);
    }
}