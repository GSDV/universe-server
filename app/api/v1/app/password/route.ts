import { NextRequest } from 'next/server';

import { waitUntil } from '@vercel/functions';

import { getUser, updateUser } from '@util/prisma/actions/user';
import { createRPToken, deleteAllAuthToken, deleteRPTokens, getRPToken } from '@util/prisma/actions/tokens';

import { response } from '@util/global-server';

import { hashPassword, isValidEmail, isValidPassword, isValidUser } from '@util/api/user';
import { isRPTokenExpired } from '@util/api/tokens';
import { sendResetPasswordEmail } from '@util/aws/ses';



// Create a reset password token for a user, and send the email.
export async function POST(req: NextRequest) {
    try {
        const { email } = await req.json();
        if (typeof email != 'string') return response(`Missing email field.`, 101);
        if (email == '' || !isValidEmail(email)) return response(`Please use your school "...@edu" email.`, 102);

        const userPrisma = await getUser({ email });
        const isValid = isValidUser(userPrisma);
        if (!isValid.valid || !userPrisma) return isValid.res;

        const prevRpToken = await getRPToken({ userId: userPrisma.id });
        if (!isRPTokenExpired(prevRpToken)) return response(`Please wait before requesting another reset password email.`, 510);
        await deleteRPTokens({ userId: userPrisma.id });

        const rpToken = await createRPToken(userPrisma.id);
        await sendResetPasswordEmail(userPrisma.email, rpToken);

        return response(`Email sent! Check your inbox to reset your password.`, 200);
    } catch (err) {
        return response(`Server error.`, 900);
    }
}



// Used to reset password.
export async function PUT(req: NextRequest) {
    try {
        const { newPassword, rpToken } = await req.json();
        if (typeof newPassword != 'string' || typeof rpToken != 'string' || rpToken === '') return response(`Missing data fields.`, 101);
        if (newPassword == '' || !isValidPassword(newPassword)) return response(`Use a password with 5 to 50 characters, consisting only of letters, numbers, and the symbols #, $, %, and &.`, 102);

        const rpTokenPrisma = await getRPToken({ token: rpToken });
        console.log(rpToken, rpTokenPrisma?.token, isRPTokenExpired(rpTokenPrisma));
        if (!rpTokenPrisma || isRPTokenExpired(rpTokenPrisma)) return response(`Reset password token is expired.`, 102);
        const userPrisma = rpTokenPrisma.user;
        const isValid = isValidUser(userPrisma);
        if (!isValid.valid || !userPrisma) return isValid.res;

        const hashedPassword = await hashPassword(newPassword, userPrisma.salt);
        await updateUser({ id: userPrisma.id }, { password: hashedPassword });

        waitUntil(deleteRPTokens({ userId: userPrisma.id }));
        waitUntil(deleteAllAuthToken(userPrisma.id));

        return response(`Success, your password has been reset.`, 200);
    } catch (err) {
        return response(`Server error.`, 900);
    }
}