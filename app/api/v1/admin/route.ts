import { NextRequest } from 'next/server';

import { getValidatedAdmin } from '@util/prisma/actions/admin';

import { response } from '@util/global-server';



// See if admin is logged in.
export async function GET(req: NextRequest) {
    try {
        const adminPrisma = await getValidatedAdmin();
        if (!adminPrisma) return response(`Not logged in.`, 100);

        return response(`Success.`, 200); 
    } catch (_) {
        return response(`Server error.`, 903);
    }
}