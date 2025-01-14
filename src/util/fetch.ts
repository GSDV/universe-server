'use server'

import { API_VERSION } from '@util/global-server';



type Method = 'GET' | 'POST' | 'PUT' | 'DELETE';



export const fetchBasic = async (route: string, method: Method, body?: string) => {
    try {
        const res = await fetch(`/api/${API_VERSION}/admin/${route}`, {
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
        const res = await fetch(`/api/${API_VERSION}/admin/${route}`, {
            method,
            body,
            credentials: 'include',
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