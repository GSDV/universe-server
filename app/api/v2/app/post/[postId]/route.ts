import { NextRequest } from 'next/server';

import { waitUntil } from '@vercel/functions';

import { getValidatedUser } from '@util/prisma/actions/user';
import { markPostDelete } from '@util/prisma/actions/posts';

import { response } from '@util/global-server';



export async function DELETE(req: NextRequest, { params }: { params: Promise<{ postId: string }> }) {
    try {
        const asyncTasks = [];

        const postId = (await params).postId;

        const { userPrisma, validUserResp } = await getValidatedUser();
        if (!userPrisma) return validUserResp;

        asyncTasks.push(markPostDelete(postId, userPrisma.id));

        waitUntil(Promise.all(asyncTasks));

        return response(`Success`, 200);
    } catch (err) {
        return response(`Server error.`, 904);
    }
}