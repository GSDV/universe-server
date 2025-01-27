import { NextRequest } from 'next/server';

import { getUser, getValidatedUserWithUni } from '@util/prisma/actions/user';
import { createAuthToken } from '@util/prisma/actions/tokens';

import { CONTACT_EMAIL } from '@util/global';
import { response } from '@util/global-server';

import { hashPassword, isValidEmail, redactUserPrisma } from '@util/api/user';



// Only to be used on the account tab, where we must see if a user is logged into an account given an authToken
export async function GET(req: NextRequest) {
    try {
        const { userPrisma, validUserResp } = await getValidatedUserWithUni();
        if (!userPrisma) return validUserResp;

        return response(`Success.`, 200, { user: userPrisma }); 
    } catch (_) {
        return response(`Server error.`, 903);
    }
}



// Login user
export async function PUT(req: NextRequest) {
    try {
        const { email, password } = await req.json();
        if (typeof email != 'string' || typeof password != 'string') return response(`Missing data fields.`, 101);

        if (email == '' || !isValidEmail(email)) return response(`Please use your school "...@edu" email.`, 102);
        if (password == '') return response(`Provide your password.`, 102);

        const userPrisma = await getUser({ email });
        if (!userPrisma) return response(`Wrong email or password.`, 199);
        if (userPrisma.banned) return response(`Wrong email or password.`, 199);
        if (userPrisma.deleted) return response(`This account has been deleted, email ${CONTACT_EMAIL} to reinstate it.`, 411);

        const hashedPassword = await hashPassword(password, userPrisma.salt);
        if (hashedPassword !== userPrisma.password) return response(`Wrong email or password.`, 199);

        const authToken = await createAuthToken(userPrisma.id);
        const user = redactUserPrisma(userPrisma);

        return response(`Success.`, 200, { authToken, user });
    } catch (err) {
        console.log(err)
        return response(`Server error.`, 903);
    }
}