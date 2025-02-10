import { NextRequest } from 'next/server';

import { getValidatedUser, toggleBlock } from '@util/prisma/actions/user';

import { response } from '@util/global-server';



// Used for fetching replies to display on an account screen.
export async function PUT(req: NextRequest, { params }: { params: Promise<{ userId: string }> }) {
    try {
        const { didBlock } = await req.json();
        if (typeof didBlock !== 'boolean') return response(`No didBlock data provided.`, 101);

        const { userPrisma, validUserResp } = await getValidatedUser();
        if (!userPrisma) return validUserResp;

        const blockerId = userPrisma.id;
        const blockedId = (await params).userId;

        await toggleBlock(blockedId, blockerId, didBlock);

        return response(`Success.`, 200);
    } catch (err) {
        return response(`Server error.`, 904);
    }
}