import Link from 'next/link';

export default function ArticleList({ articles }) {

    return (
        <section>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: '700' }}>最新記事</h2>
                <a href="#" style={{ color: 'hsl(var(--primary))', fontSize: '0.9rem', fontWeight: '600' }}>すべて見る →</a>
            </div>

            <div className="grid-auto-fit">
                {articles.map((article) => (
                    <article
                        key={article.id}
                        className="glass-panel"
                        style={{
                            padding: '1.5rem',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'space-between',
                            height: '100%'
                        }}
                    >
                        <div>
                            <div style={{
                                display: 'inline-block',
                                fontSize: '0.8rem',
                                background: 'hsl(var(--secondary))',
                                padding: '0.25rem 0.75rem',
                                borderRadius: '99px',
                                marginBottom: '1rem',
                                color: 'hsl(var(--secondary-foreground))'
                            }}>
                                {article.category}
                            </div>
                            <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem', lineHeight: '1.4' }}>
                                <Link href={`/articles/${article.id}`} style={{ transition: 'color 0.2s', textDecoration: 'none', color: 'inherit' }}>
                                    {article.title}
                                </Link>
                            </h3>
                            <p style={{ fontSize: '0.95rem', color: 'hsl(var(--foreground))', opacity: 0.7, marginBottom: '1.5rem' }}>
                                {article.summary}
                            </p>
                        </div>

                        <div style={{ marginTop: 'auto' }}>
                            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
                                {article.tags.map(tag => (
                                    <span key={tag} style={{ fontSize: '0.8rem', color: 'hsl(var(--primary))' }}>#{tag}</span>
                                ))}
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem', color: 'hsl(var(--foreground))', opacity: 0.5 }}>
                                <span>{article.date}</span>
                                <Link href={`/articles/${article.id}`} style={{ transition: 'color 0.2s', textDecoration: 'none', color: 'inherit' }}><span>Read More</span></Link>
                            </div>
                        </div>
                    </article>
                ))}
            </div>
        </section>
    );
}
