import Link from 'next/link';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { getAllArticleImages } from '../lib/images';

export default function ImageSearchPage() {
    const images = getAllArticleImages();

    return (
        <main style={{
            minHeight: '100vh',
            background: 'radial-gradient(circle at top right, hsl(var(--primary) / 0.1), transparent 40%), radial-gradient(circle at bottom left, hsl(260, 60%, 60% / 0.1), transparent 40%)',
            paddingBottom: '4rem'
        }}>
            <Header />

            <div className="container">
                <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
                    <h1 style={{ fontSize: '2rem', fontWeight: '800', marginBottom: '0.5rem' }}>
                        画像で探す
                    </h1>
                    <p style={{ opacity: 0.7 }}>記事で使用されている画像一覧</p>
                </div>

                {images.length > 0 ? (
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
                        gap: '1.5rem'
                    }}>
                        {images.map((img, index) => (
                            <Link
                                key={index}
                                href={`/articles/${img.articleId}`}
                                style={{
                                    textDecoration: 'none',
                                    display: 'block',
                                    transition: 'transform 0.2s'
                                }}
                                className="glass-panel"
                            >
                                <div style={{
                                    aspectRatio: '16/9',
                                    overflow: 'hidden',
                                    borderTopLeftRadius: '12px',
                                    borderTopRightRadius: '12px',
                                    borderBottom: '1px solid hsl(var(--secondary))',
                                    background: 'hsl(var(--secondary) / 0.5)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}>
                                    <img
                                        src={img.src}
                                        alt={img.fileName}
                                        style={{
                                            width: '100%',
                                            height: '100%',
                                            objectFit: 'contain',
                                            padding: '0.5rem'
                                        }}
                                    />
                                </div>

                            </Link>
                        ))}
                    </div>
                ) : (
                    <div style={{ textAlign: 'center', padding: '4rem', opacity: 0.6 }}>
                        <p>画像が見つかりませんでした。</p>
                        <p style={{ fontSize: '0.9rem', marginTop: '0.5rem' }}>public/images フォルダに画像を配置してください。</p>
                    </div>
                )}
            </div>
            <div className="container" style={{ minHeight: '60px', display: 'flex', alignItems: 'center' }}>
                <Link href="/" className="btn btn-primary" style={{ fontSize: '0.9rem', padding: '0.5rem 1rem' }}>
                    ← ホームに戻る
                </Link>
            </div>

            <Footer />
        </main>
    );
}
