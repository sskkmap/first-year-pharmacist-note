import { categories } from '../../data/mockData';
import Link from 'next/link';

export default function ArticleList({ articles, title = "最新記事", viewMoreLink = null }) {

    return (
        <section>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: '700' }}>{title}</h2>
                {viewMoreLink && (
                    <Link href={viewMoreLink} style={{ color: 'hsl(var(--primary))', fontSize: '0.9rem', fontWeight: '600', textDecoration: 'none' }}>
                        すべて見る →
                    </Link>
                )}
            </div>

            <div className="grid-auto-fit mobile-horizontal-scroll">
                {articles.map((article) => {
                    const categoryColor = categories.find(c => c.name === article.category)?.color || 'hsl(var(--secondary))';
                    const isDraft = article.published === false;

                    return (
                        <div key={article.id} style={{ position: 'relative' }}>
                            <article
                                className="glass-panel"
                                style={{
                                    padding: '1.5rem',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    justifyContent: 'space-between',
                                    height: '100%',
                                    // Draft styling: Grayscale and lower opacity
                                    filter: isDraft ? 'grayscale(100%)' : 'none',
                                    opacity: isDraft ? 0.7 : 1,
                                    transition: 'filter 0.3s, opacity 0.3s',
                                }}
                            >
                                <div>
                                    <div style={{
                                        display: 'inline-block',
                                        fontSize: '0.8rem',
                                        background: categoryColor,
                                        padding: '0.25rem 0.75rem',
                                        borderRadius: '99px',
                                        marginBottom: '1rem',
                                        color: '#fff', // White text for better contrast on colored backgrounds
                                        fontWeight: '500'
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
                                        {article.tags?.map(tag => (
                                            <span key={tag} style={{ fontSize: '0.8rem', color: 'hsl(var(--primary))' }}>#{tag}</span>
                                        ))}
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem', color: 'hsl(var(--foreground))', opacity: 0.5 }}>
                                        <span>{article.date}</span>
                                        <Link href={`/articles/${article.id}`} style={{ transition: 'color 0.2s', textDecoration: 'none', color: 'inherit' }}><span>Read More</span></Link>
                                    </div>
                                </div>
                            </article>
                            {/* Draft Badge Overlay */}
                            {isDraft && (
                                <div style={{
                                    position: 'absolute',
                                    top: '1rem',
                                    right: '1rem',
                                    background: 'rgba(0,0,0,0.6)',
                                    color: '#fff',
                                    padding: '0.25rem 0.75rem',
                                    borderRadius: '4px',
                                    fontWeight: 'bold',
                                    fontSize: '0.8rem',
                                    zIndex: 10
                                }}>
                                    Coming Soon
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </section>
    );
}
