'use client'

import { useRouter } from 'next/router';

import { CheckIfAdmin } from '@components/Admin';

import styles from '@styles/pages/admin.module.css';



export default function Index() {
    return (
        <CheckIfAdmin>
            <div className={styles.dashboard}>
                <h1>Admin Dashboard</h1>
                <div className={styles.actionsContainer}>
                    <Subsection title='Users' link='/admin/users/' />
                    <Subsection title='Posts' link='/admin/posts/' />
                    <Subsection title='Promo' link='/admin/promos/' />
                </div>
            </div>
        </CheckIfAdmin>
    );
}



export function Subsection({ title, link }: { title: string, link: string }) {
    const router = useRouter();
    return <div onClick={()=>router.push(link)} className={styles.subsection}>{title}</div>;
}