import { NextRequest } from 'next/server';

import { getValidatedUser, markUserDelete } from '@util/prisma/actions/user';

import { response } from '@util/global-server';



// Used for a user deleting his own account
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ userId: string }> }) {
    try {
        const { userId } = await req.json();

        if (typeof userId !== 'string' || userId !== (await params).userId) return response(`Both userIds do not match.`, 102);

        const { userPrisma, validUserResp } = await getValidatedUser();
        if (!userPrisma) return validUserResp;
        if (userPrisma.id !== userId) return response(`Not logged in as correct user.`, 102);

        await markUserDelete(userPrisma.id);

        return response(`Success.`, 200);
    } catch (err: any) {
        return response(`Server error: ${err}`, 903);
    }
}