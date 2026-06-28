import Header from '../components/Header';
import Footer from '../components/Footer';

export default function ContactPage() {
    return (
        <main style={{
            minHeight: '100vh',
            background: 'radial-gradient(circle at top right, hsl(var(--primary) / 0.1), transparent 40%), radial-gradient(circle at bottom left, hsl(260, 60%, 60% / 0.1), transparent 40%)',
            paddingBottom: '4rem'
        }}>
            <Header />

            <div className="container" style={{ maxWidth: '800px' }}>
                <div className="glass-panel" style={{ padding: '2rem' }}>
                    <h1 style={{ fontSize: '1.75rem', fontWeight: '800', marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid hsl(var(--secondary))' }}>
                        お問い合わせ
                    </h1>

                    <div className="article-content">
                        <p>
                            当サイトについてのお問い合わせ、記事の内容に関するご指摘、その他ご連絡がございましたら、以下のURLよりお願いいたします。
                        </p>

                        <div style={{ margin: '2rem 0', padding: '1.5rem', background: 'hsl(var(--primary) / 0.05)', borderRadius: '8px', border: '1px solid hsl(var(--primary) / 0.1)', textAlign: 'center' }}>
                            <p style={{ fontWeight: 'bold', fontSize: '1.1rem', margin: 0 }}>
                                <a href="https://forms.gle/TwjqNCogZhmNasPS6" target="_blank" rel="noopener noreferrer">グーグルフォームにてお問い合わせはこちら</a>
                            </p>
                        </div>

                        <p style={{ fontSize: '0.9rem', opacity: 0.8 }}>
                            ※お問い合わせいただいた内容によっては、返信にお時間をいただく場合や、お答えできない場合がございます。あらかじめご了承ください。<br />
                        </p>
                    </div>
                </div>
            </div>

            <Footer />
        </main>
    );
}
