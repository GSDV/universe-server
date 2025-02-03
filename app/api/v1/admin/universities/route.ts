import { NextRequest } from 'next/server';

import { getValidatedAdmin } from '@util/prisma/actions/admin';
import { createUni, deleteUni, getUni } from '@util/prisma/actions/universities';

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
            case 'GET_UNI':
                const uniPrisma = await getUni({ domain: data.domain });
                if (!uniPrisma) return response(`No uni found.`, 100);
                return response(`Success`, 200, { uni: uniPrisma });
            default:
                return response(`Unknown operation.`, 100);
        }
    }  catch (_) {
        return response(`Server Error.`, 100);
    }
}



export async function POST(req: NextRequest) {
    try {
        console.log("111")
        const adminPrisma = await getValidatedAdmin();
        if (!adminPrisma) return response(`Unauthorized.`, 100);

        const { operation, data } = await req.json();

        console.log("222")
        switch (operation) {
            case 'CREATE_UNI':
                console.log("AAA")
                const uniResult = await createUni(data.domain, data.name, data.color);
                console.log("BBB")
                if (!uniResult) return response(`Something went wrong.`, 100);
                console.log("CCC")
                return response(`Success`, 200, { uni: uniResult.uniPrisma, updatedUsersCount: uniResult.updatedUsersCount });
            default:
                return response(`Unknown operation.`, 100);
        }
    }  catch (err) {
        console.log(err)
        return response(`Server Error.`, 100);
    }
}



export async function DELETE(req: NextRequest) {
    try {
        const adminPrisma = await getValidatedAdmin();
        if (!adminPrisma) return response(`Unauthorized.`, 100);

        const { operation, data } = await req.json();

        switch (operation) {
            case 'DELETE_UNI':
                const uniPrisma = await deleteUni(data.domain);
                return response(`Success`, 200, { uni: uniPrisma, updatedUsersCount: uniPrisma._count });
            default:
                return response(`Unknown operation.`, 100);
        }
    }  catch (_) {
        return response(`Server Error.`, 100);
    }
}