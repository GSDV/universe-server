import { TailSpin } from 'react-loading-icons';



export default function CheckIfLoading({ loading, children }: { loading: boolean, children: React.ReactNode }) {
    if (!loading) return children;

    return (
        <div style={{ padding: '20px', width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
            <TailSpin stroke={'black'} />
            <h3 style={{color: 'black'}}>Loading</h3>
        </div>
    );
}