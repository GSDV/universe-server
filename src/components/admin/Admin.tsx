import { useEffect, useState } from 'react';

import CheckIfLoading from '@components/Loading';
import { CheckIfAlert, Alert } from '@components/Alert';

import { fetchAdminWithAuth } from '@util/fetch';



export function CheckIfAdmin({ children }: { children: React.ReactNode }) {
    const [loading, setLoading] = useState<boolean>(true);
    const [alert, setAlert] = useState<Alert | null>(null);

    const checkAdmin = async () => {
        setLoading(true);
        const resJson = await fetchAdminWithAuth(`login`, 'GET');
        setLoading(false);
        setAlert(resJson);
    }

    useEffect(() => {
        checkAdmin();
    }, []);

    return (
        <CheckIfLoading loading={loading}>
            <CheckIfAlert alert={alert}>
                {children}
            </CheckIfAlert>
        </CheckIfLoading>
    );
}