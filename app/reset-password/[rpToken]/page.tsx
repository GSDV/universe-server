'use client'

import { useEffect, useState } from 'react';
import { fetchRegular } from '@util/fetch';
import { useSearchParams } from 'next/navigation';
import CheckIfLoading from '@components/Loading';
import { AlertType, CheckIfAlert } from '@components/Alert';
import Form, { FormInputType } from '@components/Form';



export default function Page() {
    const searchParams = useSearchParams();
    const rpToken = searchParams.get('rpToken');

    const [loading, setLoading] = useState<boolean>(false);
    const [alert, setAlert] = useState<AlertType | null>(null);

    const inputs: FormInputType[] = [
        { title: 'New Password', name: 'newPassword', type: 'text' }
    ];

    const checkRPToken = async () => {
        setLoading(true);
        const body = JSON.stringify({ rpToken });
        const resJson = await fetchRegular(`password`, 'PUT', body);
        if (resJson.cStatus != 200) setAlert(resJson);
        setLoading(false);
    }

    const onSubmit = async (formData: FormData) => {
        const newPassword = formData.get('newPassword');
        const body = JSON.stringify({ newPassword });
        const resJson = await fetchRegular(`password`, 'POST', body);
        setAlert(resJson);
    }

    useEffect(() => {
        // checkRPToken();
    }, []);

    return (
        <CheckIfLoading loading={loading}>
            <CheckIfAlert alert={alert}>
                <div style={{ padding: '30px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
                    <h1 style={{ textAlign: 'center' }}>Reset Password</h1>
                    <Form action={onSubmit} inputs={inputs} submitTitle='Submit' />
                </div>
            </CheckIfAlert>
        </CheckIfLoading>
    );
}