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

            <div className="container" style={{ minHeight: '60px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
                <h1 style={{ fontSize: '1.2rem', fontWeight: '800', whiteSpace: 'nowrap', margin: 0 }}>
                    <Link href="/" style={{ color: 'hsl(var(--primary))', textDecoration: 'none' }}>
                        薬剤師一年目の勉強NOTE
                    </Link>
                </h1>
                <nav style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', flexWrap: 'nowrap', maxWidth: '100%', paddingBottom: '4px' }}>
                    <Link href="/about" className="btn btn-primary" style={{ fontSize: '0.9rem', padding: '0.5rem 1rem', whiteSpace: 'nowrap', flexShrink: 0 }}>サイトについて</Link>
                    <Link href="/image-search" className="btn btn-primary" style={{ fontSize: '0.9rem', padding: '0.5rem 1rem', whiteSpace: 'nowrap', flexShrink: 0 }}>画像検索</Link>
                    <Link href="/privacy" className="btn btn-primary" style={{ fontSize: '0.9rem', padding: '0.5rem 1rem', whiteSpace: 'nowrap', flexShrink: 0 }}>プライバシーポリシー</Link>
                    <Link href="/contact" className="btn btn-primary" style={{ fontSize: '0.9rem', padding: '0.5rem 1rem', whiteSpace: 'nowrap', flexShrink: 0 }}>お問い合わせ</Link>
                </nav>
            </div>
        </header>
    );
}
