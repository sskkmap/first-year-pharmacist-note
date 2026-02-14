import { profileData } from '../../data/mockData';

export default function Profile() {
    return (
        <section className="glass-panel" style={{ padding: '2rem', textAlign: 'center', marginBottom: '3rem' }}>
            <div style={{
                width: '120px',
                height: '120px',
                borderRadius: '50%',
                overflow: 'hidden',
                margin: '0 auto 1.5rem',
                border: '4px solid white',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
            }}>
                <img
                    src={profileData.avatar}
                    alt={profileData.name}
                    style={{
                        width: '93%',
                        height: '93%',
                        objectFit: 'cover',
                        objectPosition: '50% 50%',
                        transform: 'scale(1.1)',

                    }}
                />

            </div>
            <h1 className="title-gradient" style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>
                {profileData.name}
            </h1>
            <p style={{ color: 'hsl(var(--primary))', fontWeight: '600', marginBottom: '1rem' }}>
                {profileData.role}
            </p>
            <p style={{ maxWidth: '600px', margin: '0 auto', color: 'hsl(var(--foreground))', opacity: 0.8 }}>
                {profileData.bio}
            </p>
        </section>
    );
}
