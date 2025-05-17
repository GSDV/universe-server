import { NextRequest } from 'next/server';

import { getValidatedUser } from '@util/prisma/actions/user';

import { response } from '@util/global-server';
import { getUni } from '@util/prisma/actions/universities';



export async function GET(req: NextRequest, { params }: { params: Promise<{ uniId: string }> }) {
    try {
        const uniId = (await params).uniId;

        const { userPrisma, validUserResp } = await getValidatedUser();
        if (!userPrisma) return validUserResp;

        const uniPrisma = await getUni({ id: uniId });
        if (!uniPrisma) return response('Could not find university.', 404);
        return response('Success', 200, { uni: uniPrisma });
    } catch (err) {
        return response(`Server error.`, 904);
    }
}