import { NextRequest } from 'next/server';

import { getValidatedUser } from '@util/prisma/actions/user';
import { createReply, getPostWithAncestors } from '@util/prisma/actions/posts';

import { response } from '@util/global-server';

import { validateCreateReplyData } from '@util/api/posts';



// Used to create a reply
export async function POST(req: NextRequest) {
    try {
        const { replyDataInput, parentPostId } = await req.json();
        if (!replyDataInput || !parentPostId) return response(`No data provided.`, 101);

        const { userPrisma, validUserResp } = await getValidatedUser();
        if (!userPrisma) return validUserResp;
    
        const resInput = validateCreateReplyData(replyDataInput);
        if (!resInput.valid || resInput.data == undefined) return resInput.resp;
        const replyData = resInput.data;

        // Make sure every media key passed in comes from the user posting.
        const postIncludesOtherKey = replyData.media.some((key) => !(key.includes(userPrisma.id)));
        if (postIncludesOtherKey) return response('Something went wrong.', 101);

        const parentPost = await getPostWithAncestors({ id: parentPostId });
        if (!parentPost || parentPost.deleted) return response(`Parent post does not exist`, 404);

        const reply = await createReply(userPrisma.id, replyData, parentPost);

        return response(`Success`, 200, { replyId: reply.id, reply });
    } catch (_) {
        return response(`Server error.`, 903);
    }
}