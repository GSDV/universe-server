import clsx from 'clsx';
import styles from '@styles/ui/alert.module.css';



const successAlert = clsx({
    [styles.msg] : true,
    [styles.success] : true
});
const errorAlert = clsx({
    [styles.msg] : true,
    [styles.error] : true
});



export interface AlertType {
    cStatus: number,
    msg: string
}

export interface AlertVariation {
    cStatus: number,
    jsx: React.ReactNode
}

interface AlertComponentProps {
    alert: AlertType,
    variations?: AlertVariation[]
}

export function Alert({ alert, variations }: AlertComponentProps) {
    const status = parseInt(alert.cStatus.toString()[0]);
    const classes = (status==2) ? successAlert: errorAlert;

    if (variations==undefined) return (
        <div className={classes}>
            <p>{alert.msg}</p>
        </div>
    );

    const variation = variations.find(alertVar => (alertVar.cStatus===alert.cStatus));
    return (
        <div className={classes}>
            {variation ? 
                <>{variation.jsx}</>
            :
                <p>{alert.msg}</p>
            }
        </div>
    );
}

interface CheckIfAlertProps {
    alert: AlertType | null,
    variations?: AlertVariation[],
    children: React.ReactNode
}
export function CheckIfAlert({ alert, variations, children }: CheckIfAlertProps) {
    if (alert==null || alert.cStatus/100==2) return children;

    return (
        <div style={{ padding: '10px', width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
            <Alert alert={alert} variations={variations} />
        </div>
    );
}