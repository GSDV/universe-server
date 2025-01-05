import { NextRequest } from 'next/server';

import { getValidatedUser } from '@util/prisma/actions/user';
import { getPostWithAncestorsClient } from '@util/prisma/actions/posts';

import { response } from '@util/global-server';



// Given a postId, fetch all the replies to it.
export async function GET(req: NextRequest, { params }: { params: Promise<{ postId: string }> }) {
    try {
        const postId = (await params).postId;
        // dont need validation for route excepy\t for seeing if user liked a post before
        const { userPrisma } = await getValidatedUser();
        const loggedInId = (!userPrisma) ? '' : userPrisma.id;

        const postPrisma = await getPostWithAncestorsClient({ id: postId }, loggedInId);
        if (!postPrisma) return response(`Post not found.`, 604, { thread: [] });

        const thread = postPrisma.threadPosts;

        return response(`Success`, 200, { thread });
    } catch (err: any) {
        return response(`Server error.`, 903);
    }
}