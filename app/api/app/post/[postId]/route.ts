import { NextRequest } from 'next/server';

import { waitUntil } from '@vercel/functions';

import { getValidatedUser } from '@util/prisma/actions/user';
import { markPostDelete } from '@util/prisma/actions/posts';

import { response } from '@util/global-server';



export async function DELETE(req: NextRequest, { params }: { params: Promise<{ postId: string }> }) {
    try {
        const asyncTasks = [];

        const postId = (await params).postId;

        const resValidUser = await getValidatedUser();
        if (!resValidUser.user) return resValidUser.resp;
        const userPrisma = resValidUser.user;

        asyncTasks.push(markPostDelete(postId, userPrisma.id));

        waitUntil(Promise.all(asyncTasks));

        return response(`Success`, 200);
    } catch (err) {
        return response(`Server error: ${err}`, 904);
    }
}