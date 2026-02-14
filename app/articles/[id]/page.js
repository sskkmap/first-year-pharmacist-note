//ここで各記事をＭＤからｈｔｍｌへ変更
import { getArticleData } from '../../lib/articles';
import Link from 'next/link';
import ArticleContent from '../../components/ArticleContent';
import { categories } from '../../data/mockData';
import Header from '../../components/Header';
import Footer from '../../components/Footer';

export default async function ArticlePage({ params }) {
    const { id } = await params;
    const articleData = await getArticleData(id);

    const categoryData = categories.find(c => c.name === articleData.category);
    const categoryColor = categoryData ? categoryData.color : 'hsl(var(--secondary))';
    // Create a background color with opacity based on the category color
    // Since color is HSL string, we can hack it or just use it as border/text
    // Let's use it as border and text, and a light background

    return (
        <main style={{
            minHeight: '100vh',
            background: 'radial-gradient(circle at top right, hsl(var(--primary) / 0.1), transparent 40%)',
            paddingBottom: '4rem'
        }}>
            {/* Header / Nav */}
            <Header />

            <article className="container glass-panel" style={{ padding: '2rem' }}>
                {/* Article Header */}
                <header style={{ marginBottom: '2rem', borderBottom: '1px solid hsl(var(--secondary))', paddingBottom: '2rem' }}>
                    <div style={{
                        display: 'inline-block',
                        fontSize: '0.9rem',
                        background: categoryData ? `color-mix(in srgb, ${categoryData.color} 15%, transparent)` : 'hsl(var(--secondary))',
                        padding: '0.25rem 0.75rem',
                        borderRadius: '99px',
                        marginBottom: '1rem',
                        color: categoryData ? categoryData.color : 'hsl(var(--secondary-foreground))',
                        fontWeight: '600',
                        border: categoryData ? `1px solid ${categoryData.color}` : 'none'
                    }}>
                        {articleData.category}
                    </div>
                    <h1 style={{ fontSize: '2rem', fontWeight: '800', lineHeight: '1.3', marginBottom: '1rem' }}>
                        {articleData.title}
                    </h1>
                    <p style={{ fontSize: '1.1rem', opacity: 0.8, marginBottom: '1.5rem' }}>
                        {articleData.summary}
                    </p>
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                        {articleData.tags.map(tag => (
                            <span key={tag} style={{ fontSize: '0.8rem', color: 'hsl(var(--primary))' }}>#{tag}</span>
                        ))}
                    </div>
                    <div style={{ marginTop: '1rem', fontSize: '0.9rem', opacity: 0.6 }}>
                        {articleData.date}
                    </div>
                </header>

                {/* Article Content */}

                <ArticleContent html={articleData.contentHtml} />
            </article>
            <div className="container" style={{ minHeight: '60px', display: 'flex', alignItems: 'center' }}>
                <Link href="/" className="btn btn-primary" style={{ fontSize: '0.9rem', padding: '0.5rem 1rem' }}>
                    ← ホームに戻る
                </Link>
            </div>
            <Footer />
        </main>
    );
}
