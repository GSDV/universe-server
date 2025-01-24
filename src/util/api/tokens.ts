import { ActivateToken, RPToken } from '@prisma/client';

import { ACTIVATE_TOKEN_EXPIRATION, RP_TOKEN_EXPIRATION } from '@util/global-server';



export const isActivateTokenExpired = (token: ActivateToken | null) => {
    if (!token) return true;

    const tokenTime = token.createdAt;
    const currentTime = new Date();

    const timeDifference = currentTime.getTime() - tokenTime.getTime();
    const minutesDifference = timeDifference / (1000 * 60);

    return minutesDifference > ACTIVATE_TOKEN_EXPIRATION;
}



export const isRPTokenExpired = (token: RPToken | null) => {
    if (!token) return true;

    const tokenTime = token.createdAt;
    const currentTime = new Date();

    const timeDifference = currentTime.getTime() - tokenTime.getTime();
    const minutesDifference = timeDifference / (1000 * 60);

    return minutesDifference > RP_TOKEN_EXPIRATION;
}