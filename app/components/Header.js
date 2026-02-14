import Link from 'next/link';

export default function Header() {
    return (
        <header className="glass-panel" style={{
            position: 'sticky',
            top: 0,
            zIndex: 10,
            borderRadius: 0,
            borderLeft: 'none',
            borderRight: 'none',
            borderTop: 'none',
            marginBottom: '2rem'
        }}>

            <div className="container" style={{ minHeight: '60px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
                <h1 style={{ fontSize: '1.2rem', fontWeight: '800' }}>
                    <Link href="/" style={{ color: 'hsl(var(--primary))', textDecoration: 'none' }}>
                        薬剤師一年目の勉強NOTE
                    </Link>
                </h1>
                <nav>
                    <Link href="/about" className="btn btn-primary" style={{ fontSize: '0.9rem', padding: '0.5rem 1rem' }}>このサイトについて</Link>
                    <Link href="/image-search" className="btn btn-primary" style={{ fontSize: '0.9rem', padding: '0.5rem 1rem' }}>画像で探す</Link>
                    <Link href="/privacy" className="btn btn-primary" style={{ fontSize: '0.9rem', padding: '0.5rem 1rem' }}>プライバシーポリシー</Link>
                </nav>
            </div>
        </header>
    );
}
