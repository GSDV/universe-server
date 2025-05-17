import { NextRequest } from 'next/server';

import { getValidatedUser } from '@util/prisma/actions/user';
import { deleteAllAuthToken } from '@util/prisma/actions/tokens';

import { response } from '@util/global-server';



// Used for a user deleting his own account
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ userId: string }> }) {
    try {
        if (typeof (await params).userId !== 'string') return response(`userId not provided.`, 102);

        const { userPrisma, validUserResp } = await getValidatedUser();
        if (!userPrisma) return validUserResp;
        if (userPrisma.id !== (await params).userId) return response(`Not logged in as correct user.`, 102);

        await deleteAllAuthToken(userPrisma.id);

        return response(`Success.`, 200);
    } catch (_) {
        return response(`Server error.`, 903);
    }
}