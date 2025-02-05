import { NextRequest } from 'next/server';

import { getValidatedUser } from '@util/prisma/actions/user';
import { createPost } from '@util/prisma/actions/posts';

import { mediaKeyPrefix } from '@util/global';
import { response } from '@util/global-server';

import { validateCreatePostData } from '@util/api/posts';



// Used to create a post
export async function POST(req: NextRequest) {
    try {
        const { postDataInput } = await req.json();
        if (!postDataInput) return response(`No data provided.`, 101);

        const { userPrisma, validUserResp } = await getValidatedUser();
        if (!userPrisma) return validUserResp;

        const resInput = validateCreatePostData(postDataInput);
        if (!resInput.valid || resInput.data == undefined) return resInput.resp;
        const postData = resInput.data;

        // Make sure every media key passed in comes from the user posting.
        const mediaPrefix = mediaKeyPrefix(userPrisma.id);
        const postIncludesOtherKey = postData.media.some((key) => !key.startsWith(mediaPrefix));

        if (postIncludesOtherKey) return response('Something went wrong.', 101);

        const post = await createPost(userPrisma.id, postData);

        return response(`Success`, 200, { postId: post.id, post });
    } catch (errr) {
        console.log(errr)
        return response(`Server error.`, 903);
    }
}