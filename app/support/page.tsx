import { CONTACT_EMAIL } from '@util/global';

import styles from '@styles/pages/file.module.css';



export default function Page() {
    return (
        <div className={styles.container}>
            <h1 style={{ color: 'var(--primary)', fontSize: '30px', fontWeight: 900 }}>Support</h1>
            <p>For all questions, please email us at <a href={`mailto:${CONTACT_EMAIL}`} style={{ color: 'var(--primary)' }}>{CONTACT_EMAIL}</a>. We will get back to you as soon as possible!</p>
        </div>
    );
}