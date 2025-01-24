'use client'

import { useParams } from 'next/navigation';

import { useState } from 'react';

import CheckIfLoading from '@components/Loading';
import { Alert, AlertType } from '@components/Alert';
import Form, { FormInputType } from '@components/Form';

import { fetchRegular } from '@util/fetch';



export default function Page() {
    const rpToken = useParams().rpToken;

    const [loading, setLoading] = useState<boolean>(false);
    const [alert, setAlert] = useState<AlertType | null>(null);

    const inputs: FormInputType[] = [
        { title: 'New Password', name: 'newPassword', type: 'text' }
    ];

    const onSubmit = async (formData: FormData) => {
        setLoading(true);
        const newPassword = formData.get('newPassword');
        const body = JSON.stringify({ newPassword, rpToken });
        const resJson = await fetchRegular(`password`, 'PUT', body);
        setAlert(resJson);
        setLoading(false);
    }

    return (
        <CheckIfLoading loading={loading}>
                <div style={{ padding: '30px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
                    <h1 style={{ textAlign: 'center' }}>Reset Password</h1>
                    <Form action={onSubmit} inputs={inputs} submitTitle='Submit' />
                    {alert && <Alert alert={alert} />}
                </div>
        </CheckIfLoading>
    );
}