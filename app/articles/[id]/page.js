//ここで各記事をＭＤからｈｔｍｌへ変更
import { getArticleData, getSortedArticlesData } from '../../lib/articles';
import Link from 'next/link';
import ArticleContent from '../../components/ArticleContent';
import DaysCalc from '../../components/tools/DaysCalc';
import { categories } from '../../data/mockData';
import Header from '../../components/Header';
import Footer from '../../components/Footer';

// 静的エクスポート用: 全記事のパスを事前生成
export function generateStaticParams() {
    const articles = getSortedArticlesData();
    return articles.map((article) => ({
        id: article.id,
    }));
}

export default async function ArticlePage({ params, searchParams }) {
    const { id } = await params;
    const articleData = await getArticleData(id);

    // Draft / Coming Soon Logic
    const isPublished = articleData.published;

    const { preview } = await searchParams;
    const isSecretPreview = preview === 'secret';
    const isDev = process.env.NODE_ENV === 'development';

    const canViewDraft = isPublished || isDev || isSecretPreview;

    if (!canViewDraft) {
        return (
            <main style={{
                minHeight: '100vh',
                background: 'radial-gradient(circle at top right, hsl(var(--primary) / 0.1), transparent 40%)',
                paddingBottom: '4rem',
                display: 'flex',
                flexDirection: 'column'
            }}>
                <Header />
                <div className="container" style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
                    <div className="glass-panel" style={{ padding: '3rem', maxWidth: '600px', width: '100%' }}>
                        <h1 style={{ fontSize: '3rem', fontWeight: '800', marginBottom: '1rem', background: 'linear-gradient(to right, hsl(var(--primary)), hsl(var(--secondary)))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                            Coming Soon
                        </h1>
                        <p style={{ fontSize: '1.2rem', opacity: 0.8, marginBottom: '2rem' }}>
                            この記事は現在作成中です。<br />
                            公開までもう少々お待ちください。
                        </p>
                        <Link href="/" className="btn btn-primary">
                            ホームに戻る
                        </Link>
                    </div>
                </div>
                <Footer />
            </main>
        );
    }

    const categoryData = categories.find(c => c.name === articleData.category);
    // ... existing rendering logic ...
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
                    {/* Draft Badge for Admin */}
                    {!isPublished && (
                        <span style={{
                            marginLeft: '0.5rem',
                            fontSize: '0.8rem',
                            padding: '0.2rem 0.5rem',
                            borderRadius: '4px',
                            background: 'hsl(var(--destructive) / 0.1)',
                            color: 'hsl(var(--destructive))',
                            border: '1px solid hsl(var(--destructive))',
                            fontWeight: 'bold'
                        }}>
                            下書き (Draft)
                        </span>
                    )}
                    <h1 style={{ fontSize: '2rem', fontWeight: '800', lineHeight: '1.3', marginBottom: '1rem' }}>
                        {articleData.title}
                    </h1>
                    <p style={{ fontSize: '1.1rem', opacity: 0.8, marginBottom: '1.5rem' }}>
                        {articleData.summary}
                    </p>
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                        {articleData.tags?.map(tag => (
                            <span key={tag} style={{ fontSize: '0.8rem', color: 'hsl(var(--primary))' }}>#{tag}</span>
                        ))}
                    </div>
                    <div style={{ marginTop: '1rem', fontSize: '0.9rem', opacity: 0.6 }}>
                        {articleData.date}
                    </div>
                </header>

                {/* Table of Contents */}
                {articleData.toc && articleData.toc.length > 0 && (
                    <div className="glass-panel" style={{
                        margin: '0 0 3rem 0',
                        padding: '1.5rem',
                        background: 'hsl(var(--secondary) / 0.3)',
                        borderRadius: '12px',
                        border: '1px solid hsl(var(--secondary))'
                    }}>
                        <div style={{ fontWeight: '800', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span style={{ fontSize: '1.2rem' }}>目次</span>
                        </div>
                        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                            {articleData.toc.map((item, index) => (
                                <li key={index} style={{
                                    marginBottom: '0.5rem',
                                    paddingLeft: item.level === 3 ? '1.5rem' : '0'
                                }}>
                                    <a
                                        href={`#${item.id}`}
                                        style={{
                                            textDecoration: 'none',
                                            color: 'hsl(var(--primary))',
                                            fontWeight: item.level === 2 ? '600' : '400',
                                            fontSize: '0.95rem',
                                            display: 'block',
                                            padding: '0.25rem 0',
                                            transition: 'opacity 0.2s'
                                        }}
                                        className="toc-link"
                                    >
                                        {item.text}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* Article Content */}
                {id === 'days-calc' && <DaysCalc />}
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
