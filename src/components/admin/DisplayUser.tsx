import { mediaUrl } from '@util/global';



export const formatDate = (d: Date | undefined) => {
    if (d==undefined) return '';
    return d.toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' });
}

export default function DisplayUser({ user }: { user: any }) {
    if (user === null) return <></>;

    return (
        <>
            <img style={{width: '100px', height: '100px'}} src={mediaUrl(user.pfpKey)}/>
            <h4><b>Display Name: </b>{user.displayName}</h4>
            <h4><b>Username: </b>{user.username}</h4>
            <h4><b>Email: </b>{user.email}</h4>
            <h4><b>ID: </b>{user.id}</h4>
            <h4><b>Created: </b>{formatDate(new Date(user.createdAt))}</h4>

            <h4><b>Deleted: </b>{user.deleted.toString()}</h4>
            <h4><b>Banned: </b>{user.banned.toString()}</h4>
            {user.banned && <>
                <h4><b>Ban Msg: </b>{user.banMsg}</h4>
                <h4><b>Ban Expiration: </b>{user.banExpiration!=null ? formatDate(user.banExpiration) : 'never'}</h4>
            </>}
        </>
    );
}