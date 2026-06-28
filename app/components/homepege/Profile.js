//ホームページ
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
            <h2 style={{ marginBottom: '1.5rem', lineHeight: '1.5' }}>
                <span style={{ 
                    fontSize: '1.15rem', 
                    fontWeight: '700', 
                    color: 'hsl(210, 80%, 30%)', 
                    backgroundColor: 'hsl(210, 100%, 94%)', 
                    padding: '0.4rem 1rem',
                    borderRadius: '8px',
                    display: 'inline-block',
                    border: '1px solid hsl(210, 100%, 88%)'
                }}>
                    新人薬剤師・病院薬剤師・薬学生向けの臨床知識をわかりやすく解説
                </span>
            </h2>
            <p style={{
                maxWidth: '600px',
                margin: '0 auto',
                color: 'hsl(var(--foreground))',
                opacity: 0.8,
                whiteSpace: 'pre-wrap'
            }}>
                {profileData.bio}
            </p>
        </section>
    );
}
