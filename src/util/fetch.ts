import { cookies } from 'next/headers';

import { ADMIN_AUTH_TOKEN_COOKIE_KEY, API_VERSION } from './global-server';



type Method = 'GET' | 'POST' | 'PUT' | 'DELETE';


// Note: This method differs from client "fetchBasic" by needing to specify "admin" or "app" as first part in route.
export const fetchBasic = async (route: string, method: Method, body?: string) => {
    try {
        const res = await fetch(`/api/${API_VERSION}/${route}`, {
            method,
            body,
            headers: {
                'Content-Type': 'application/json'
            }
        });
        const resJson = await res.json();
        return resJson;
    } catch (err) {
        return { msg: `Something went wrong.`, cStatus: 800 };
    }
}



export const fetchAdminWithAuth = async (route: string, method: Method, body?: string) => {
    try {
        const cookieStore = await cookies();
        const authTokenCookie = cookieStore.get(ADMIN_AUTH_TOKEN_COOKIE_KEY);
        if (!authTokenCookie || authTokenCookie.value==='') return { msg: `Unathorized.`, cStatus: 100 };

        const res = await fetch(`/api/${API_VERSION}/admin/${route}`, {
            method,
            body,
            headers: {
                'Content-Type': 'application/json',
                'Cookie': `${ADMIN_AUTH_TOKEN_COOKIE_KEY}=${authTokenCookie.value}`
            }
        });
        const resJson = await res.json();
        return resJson;
    } catch (err) {
        return { msg: `Something went wrong.`, cStatus: 800 };
    }
}