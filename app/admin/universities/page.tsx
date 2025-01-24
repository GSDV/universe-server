'use client';

import { useState } from 'react';

import Form, { FormInputType } from '@components/Form';
import { CheckIfAdmin } from '@components/Admin';
import { Alert, AlertType } from '@components/Alert';

import { University } from '@prisma/client';

import adminStyles from '@styles/pages/admin.module.css';
import { fetchAdminWithAuth } from '@util/fetch';



export interface AdminActionType {
    setAlert: React.Dispatch<React.SetStateAction<AlertType | null>>
}



export default function Index() {
    return (
        <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
            <CheckIfAdmin>
                <Actions />
            </CheckIfAdmin>
        </div>
    );
}



function Actions() {
    const [alert, setAlert] = useState<AlertType | null>(null);

    return (
        <div className={adminStyles.dashboard}>
            <h1>Uni Actions</h1>
            {alert && <Alert alert={alert}  />}
            <div className={adminStyles.actionsContainer}>
                <DisplayUni setAlert={setAlert} />
                <CreateUni setAlert={setAlert} />
            </div>
        </div>
    );
}


function DisplayUni({ setAlert }: AdminActionType) {
    const [uni, setUni] = useState<University | null>(null);

    const inputs: FormInputType[] = [
        { title: 'Domain', name: 'domain', type: 'text' }
    ];

    const onSubmit = async (formData: FormData) => {
        const domain = formData.get('domain');

        const data = { domain };
        const encodedData = encodeURIComponent(JSON.stringify(data));
        const operation = 'GET_UNI';

        const resJson = await fetchAdminWithAuth(`universities?operation=${operation}&data=${encodedData}`, 'GET');
        setUni(resJson.uni);
        setAlert(resJson);
    }

    return (
        <div className={adminStyles.actionContainer}>
            <h3>Get University</h3>
            <Form action={onSubmit} inputs={inputs} submitTitle='Get Uni' />
            {uni && <div>
                <h4><b>Id: </b>{uni.id}</h4>
                <h4><b>Name: </b>{uni.name}</h4>
                <h4><b>Domain: </b>{uni.domain}</h4>
                <h4><b>Color: </b>{uni.color}</h4>
                <div style={{width: '100px', height: '20px', backgroundColor: uni.color }} />
            </div>}
        </div>
    );
}

function CreateUni({ setAlert }: AdminActionType) {
    const inputs: FormInputType[] = [
        { title: 'Domain', name: 'domain', type: 'text' },
        { title: 'Name', name: 'name', type: 'text' },
        { title: 'Color', name: 'color', type: 'text' }
    ];

    const onSubmit = async (formData: FormData) => {
        const domain = formData.get('domain');
        const name = formData.get('name');
        const color = formData.get('color');

        const data = { domain, name, color };
        const operation = 'CREATE_UNI';
        const body = JSON.stringify({ operation, data });

        const resJson = await fetchAdminWithAuth(`universities`, 'POST', body);
        setAlert(resJson);
    }

    return (
        <div className={adminStyles.actionContainer}>
            <h3>Create University</h3>
            <h4>(Auto adds students)</h4>
            <Form action={onSubmit} inputs={inputs} submitTitle='Make Uni' />
        </div>
    );
}