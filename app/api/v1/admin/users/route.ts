import { NextRequest } from 'next/server';

import { banUser, deleteUser, getValidatedAdmin, markDeleteUser } from '@util/prisma/actions/admin';
import { createUser, getUser } from '@util/prisma/actions/user';

import { response } from '@util/global-server';



export async function GET(req: NextRequest) {
    try {
        const adminPrisma = await getValidatedAdmin();
        if (!adminPrisma) return response(`Unauthorized.`, 100);

        const searchParams = req.nextUrl.searchParams;
        const operation = searchParams.get('operation');
        const encodedData = searchParams.get('data');
        const data = JSON.parse(encodedData as string);

        switch (operation) {
            case 'GET_USER':
                const userPrisma = await getUser(data.where);
                if (!userPrisma) return response(`User not found.`, 100);
                return response(`Success`, 200, { user: userPrisma });
            default:
                return response(`Unknown operation.`, 100);
        }
    }  catch (_) {
        return response(`Server Error.`, 100);
    }
}



export async function POST(req: NextRequest) {
    try {
        const adminPrisma = await getValidatedAdmin();
        if (!adminPrisma) return response(`Unauthorized.`, 100);

        const searchParams = req.nextUrl.searchParams;
        const operation = searchParams.get('operation');
        const encodedData = searchParams.get('data');
        const data = JSON.parse(encodedData as string);

        switch (operation) {
            case 'CREATE_TEST_USER':
                const userPrisma = await createUser(data.displayName, data.username, `${data.email}@test.edu`, data.password);
                if (!userPrisma) return response(`Something went wrong.`, 100);
                return response(`Success`, 200, { user: userPrisma });
            default:
                return response(`Unknown operation.`, 100);
        }
    }  catch (_) {
        return response(`Server Error.`, 100);
    }
}



export async function DELETE(req: NextRequest) {
    try {
        const adminPrisma = await getValidatedAdmin();
        if (!adminPrisma) return response(`Unauthorized.`, 100);

        const searchParams = req.nextUrl.searchParams;
        const operation = searchParams.get('operation');
        const encodedData = searchParams.get('data');
        const data = JSON.parse(encodedData as string);

        switch (operation) {
            case 'BAN_USER':
                await banUser(data.where, data.banMsg, data.banExpiration);
                return response(`Success`, 200);
            case 'MARK_DELETE_USER':
                await markDeleteUser(data.where);
                return response(`Success`, 200);
            case 'DELETE_USER':
                await deleteUser(data.where);
                return response(`Success`, 200);
            default:
                return response(`Unknown operation.`, 100);
        }
    }  catch (_) {
        return response(`Server Error.`, 100);
    }
}