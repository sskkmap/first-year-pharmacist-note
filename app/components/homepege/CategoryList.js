import { categories } from '../../data/mockData';
import Link from 'next/link';

export default function CategoryList({ articles = [] }) {
    return (
        <section style={{ marginBottom: '3rem' }}>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', fontWeight: '700' }}>カテゴリー</h2>
            <div
                className="category-grid"
                style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
                    gap: '1rem',
                }}
            >

                {categories.map((cat) => {
                    const count = articles.filter(a => a.category === cat.name).length;
                    return (
                        <Link
                            key={cat.id}
                            href={`/categories/${cat.name}`}
                            className="glass-panel"
                            style={{
                                padding: '0.75rem 1.5rem',
                                whiteSpace: 'nowrap',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between', // Space between name and count
                                gap: '0.5rem',
                                color: 'hsl(var(--foreground))',
                                fontWeight: '500',
                                borderLeft: `4px solid ${cat.color}`,
                                textDecoration: 'none'
                            }}
                        >
                            <span>{cat.name}</span>
                            <span style={{ fontSize: '0.85rem', opacity: 0.7, background: 'hsl(var(--secondary))', padding: '2px 8px', borderRadius: '12px' }}>
                                {count}件
                            </span>
                        </Link>
                    );
                })}

            </div>
        </section >
    );
}
