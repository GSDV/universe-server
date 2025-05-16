import { NextRequest } from 'next/server';

import { Prisma } from '@prisma/client';

import { getValidatedUser } from '@util/prisma/actions/user';
import { fetchClientUniverisitiesBatch } from '@util/prisma/actions/universities';

import { response } from '@util/global-server';



// Used for searching through schools with a query
export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);

        const queryParam = searchParams.get('query');
        const cursor = searchParams.get('cursor');
        if (!queryParam || cursor === null) return response(`Missing data.`, 101);

        const query = queryParam.trim().toLowerCase();

        const { userPrisma, validUserResp } = await getValidatedUser();
        if (!userPrisma) return validUserResp;
        const loggedInUserId = userPrisma.id;


        const where: Prisma.UniversityWhereInput = {
            OR: [
                { name: { contains: query, mode: 'insensitive' } },
                { domain: { contains: query, mode: 'insensitive' } }
            ]
        }
        const { clientUniversities, nextCursor, moreAvailable} = await fetchClientUniverisitiesBatch(where, cursor, loggedInUserId);

        return response(`Success.`, 200, { universities: clientUniversities, nextCursor, moreAvailable });
    } catch (err) {
        return response(`Server error.`, 904);
    }
}