export default function Index() {
    return (
        <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', backgroundColor: 'white' }}>
            <h4 style={{ textAlign: 'center', fontSize: '40px', fontWeight: 900, color: 'var(--primary)' }}>UniVerse</h4>
            <p style={{ textAlign: 'center', fontSize: '20px', color: 'black' }}>Coming soon...</p>
        </div>
    );
}

function NewHome() {
    return (
        <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', backgroundColor: 'white' }}>
            <h1 style={{ textAlign: 'center', fontSize: '40px', fontWeight: 900, color: 'var(--primary)' }}>UniVerse</h1>
            <h5 style={{ textAlign: 'center', fontSize: '20px', color: 'black' }}>Download UniVerse:</h5>
            {/* UniVerse App Store link here */}
            <p style={{ textAlign: 'center', fontSize: '20px', color: 'rgb(117, 117, 117)' }}>By using UniVerse, you agree to our <a href='/terms'>terms</a> and <a href='privacy-policy'>privacy policy</a>.</p>
        </div>
    );
}