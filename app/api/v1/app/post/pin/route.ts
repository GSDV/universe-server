import { NextRequest } from 'next/server';

import { response } from '@util/global-server';

import { getValidatedUser } from '@util/prisma/actions/user';
import { updatePosts } from '@util/prisma/actions/posts';



// Used only to pin and unpin a post
export async function PUT(req: NextRequest) {
    try {
        const { postId, pin } = await req.json();
        if (!postId || pin === undefined) return response(`No data provided.`, 101);

        const { userPrisma, validUserResp } = await getValidatedUser();
        if (!userPrisma) return validUserResp;
    
        // No matter what, make sure no post is pinned
        await updatePosts({ authorId: userPrisma.id }, { pinned: false });
        if (pin) await updatePosts({ AND: [{id: postId}, {authorId: userPrisma.id}] }, { pinned: pin });

        return response(`Success`, 200);
    } catch (err: any) {
        return response(`Server error.`, 903);
    }
}