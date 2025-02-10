import { NextRequest } from 'next/server';

import { waitUntil } from '@vercel/functions';

import { getValidatedUser } from '@util/prisma/actions/user';
import { likePost, unlikePost } from '@util/prisma/actions/posts';

import { response } from '@util/global-server';



// Toggle a like (user likes or unlikes a post)
export async function POST(req: NextRequest, { params }: { params: Promise<{ postId: string }> }) {
    try {
        const postId = (await params).postId;
        const { liked } = await req.json();

        if (liked == undefined) return response(`Data not provided.`, 101);

        const { userPrisma, validUserResp } = await getValidatedUser();
        if (!userPrisma) return validUserResp;

        // Currently not checking if users are blocking each other. Blocked users can still like each others posts.
        // const blockRelationship = await findBlockRelation(parentPost.author.id, userPrisma.id);
        // if (blockRelationship) {
        //     if (blockRelationship.blockedId === userPrisma.id) return response(`You are blocked by this user.`, 404);
        //     if (blockRelationship.blockedId === parentPost.author.id) return response(`You have blocked this user.`, 404);
        // }

        // Note: we do NOT need to check if the post actually exists.
        // Prisma transactions (used in likePost and unlikePost) are atomic.
        if (liked) waitUntil(likePost(postId, userPrisma.id));
        else waitUntil(unlikePost(postId, userPrisma.id));

        return response(`Success`, 200);
    } catch (_) {
        return response(`Server error.`, 904);
    }
}