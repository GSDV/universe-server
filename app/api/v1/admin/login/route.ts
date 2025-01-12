import { NextRequest } from 'next/server';

import { cookies } from 'next/headers';

import { getAdmin, createAdminAuthToken } from '@util/prisma/actions/admin';

import { ADMIN_AUTH_TOKEN_COOKIE_KEY, response } from '@util/global-server';

import { hashPassword } from '@util/api/user';



// Login admin.
export async function PUT(req: NextRequest) {
    try {
        const { email, password } = await req.json();
        if (typeof email != 'string' || typeof password != 'string') return response(`Missing data fields.`, 100);

        if (email == '') return response(`Please use your school "...@edu" email.`, 100);
        if (password == '') return response(`Provide your password.`, 100);

        const adminPrisma = await getAdmin({ email });
        if (!adminPrisma) return response(`Wrong email or password.`, 100);

        const hashedPassword = await hashPassword(password, adminPrisma.salt);
        if (hashedPassword !== adminPrisma.password) return response(`Wrong email or password.`, 100);

        const authToken = await createAdminAuthToken(adminPrisma.id);

        const cookieStore = await cookies();
        cookieStore.set(ADMIN_AUTH_TOKEN_COOKIE_KEY, authToken);

        return response(`Success.`, 200);
    } catch (_) {
        return response(`Server error.`, 903);
    }
}