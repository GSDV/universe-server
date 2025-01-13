'use client'

import { useState } from 'react';

import Form, { FormInputType } from '@components/Form';
import CheckIfLoading from '@components/Loading';
import { Alert, AlertType } from '@components/Alert';

import { fetchBasic } from '@util/fetch';



export default function Index() {
    const [loading, setLoading] = useState<boolean>(false);
    const [alert, setAlert] = useState<AlertType | null>(null);

    const inputs: FormInputType[] = [
        { title: 'Email', name: 'email', type: 'text' },
        { title: 'Password', name: 'password', type: 'password' }
    ];

    const attemptAdminLogin = async (formData: FormData) => {
        setLoading(true);
        const email = formData.get('email') as string;
        const password = formData.get('password') as string;
        const body = JSON.stringify({ email, password });
        const resJson = await fetchBasic(`admin/login`, 'PUT', body);
        setAlert(resJson);
        setLoading(false);
    }

    return (
        <CheckIfLoading loading={loading}>
            <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                <div style={{ width: '200px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <h3 style={{ textAlign: 'center' }}>Admin Login</h3>
                    <Form action={attemptAdminLogin} inputs={inputs} submitTitle='Login' />
                </div>
                {alert && <Alert alert={alert} />}
            </div>
        </CheckIfLoading>
    );
}