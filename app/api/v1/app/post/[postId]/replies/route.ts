import { NextRequest } from 'next/server';

import { getValidatedUser } from '@util/prisma/actions/user';
import { getPostWithAncestorsClient, getRepliesClient } from '@util/prisma/actions/posts';

import { response } from '@util/global-server';



// Given a postId, fetch all the ancestors in its thread.
export async function GET(req: NextRequest, { params }: { params: Promise<{ postId: string }> }) {
    try {
        const postId = (await params).postId;
        // dont need validation for route excepy\t for seeing if user liked a post before
        const { userPrisma } = await getValidatedUser();
        const loggedInId = (!userPrisma) ? '' : userPrisma.id;

        const { replies, moreRepliesAvailable } = await getRepliesClient(postId, 1, loggedInId);

        return response(`Success`, 200, { replies, moreRepliesAvailable });
    } catch (_) {
        return response(`Server error.`, 903);
    }
}