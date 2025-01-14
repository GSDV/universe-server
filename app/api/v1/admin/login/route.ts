import { NextRequest } from 'next/server';

import { getAdmin, createAdminAuthToken, getValidatedAdmin } from '@util/prisma/actions/admin';

import { ADMIN_AUTH_TOKEN_COOKIE_KEY, response } from '@util/global-server';

import { hashPassword } from '@util/api/user';



const COOKIE_EXPIRY = 3 * 24 * 60 * 60 * 1000; 



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



// Login admin.
export async function PUT(req: NextRequest) {
    try {
        const { email, password } = await req.json();
        if (typeof email != 'string' || typeof password != 'string') return response(`Missing data fields.`, 100);
        if (email === '' || password === '') return response(`Missing data fields.`, 100);

        const adminPrisma = await getAdmin({ email });
        if (!adminPrisma) return response(`Wrong email or password.`, 100);

        const hashedPassword = await hashPassword(password, adminPrisma.salt);
        if (hashedPassword !== adminPrisma.password) return response(`Wrong email or password.`, 100);

        const authToken = await createAdminAuthToken(adminPrisma.id);

        const res = response(`Success.`, 200);

        res.cookies.set({
            name: ADMIN_AUTH_TOKEN_COOKIE_KEY,
            value: authToken,
            httpOnly: true,
            secure: (process.env.NODE_ENV === 'production'),
            sameSite: 'strict',
            path: '/',
            maxAge: COOKIE_EXPIRY,
            expires: new Date(Date.now() + COOKIE_EXPIRY)
        });

        return res;
    } catch (err) {
        return response(`Server error.`, 903);
    }
}