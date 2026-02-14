import Link from 'next/link';
import ArticleList from '../../components/homepege/ArticleList';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { getArticlesByCategory } from '../../lib/articles';

export default async function CategoryPage({ params }) {
    const { category } = await params;
    const decodedCategory = decodeURIComponent(category);
    const categoryArticles = getArticlesByCategory(decodedCategory);

    return (
        <main style={{
            minHeight: '100vh',
            background: 'radial-gradient(circle at top right, hsl(var(--primary) / 0.1), transparent 40%)',
            paddingBottom: '4rem'
        }}>
            {/* Header / Nav */}
            <Header />

            <div className="container">
                <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
                    <h1 style={{ fontSize: '2rem', fontWeight: '800', marginBottom: '0.5rem' }}>
                        {decodedCategory}
                    </h1>
                    <p style={{ opacity: 0.7 }}>カテゴリー記事一覧</p>
                </div>

                {categoryArticles.length > 0 ? (
                    <ArticleList articles={categoryArticles} />
                ) : (
                    <div style={{ textAlign: 'center', padding: '3rem', opacity: 0.6 }}>
                        記事が見つかりませんでした。
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
