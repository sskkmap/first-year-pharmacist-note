import { categories } from '../../data/mockData';
import Link from 'next/link';

export default function CategoryList() {
    return (
        <section style={{ marginBottom: '3rem' }}>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', fontWeight: '700' }}>カテゴリー</h2>
            <div
                style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                    gap: '1rem',
                }}
            >

                {categories.map((cat) => (
                    <Link
                        key={cat.id}
                        href={`/categories/${cat.name}`}
                        className="glass-panel"
                        style={{
                            padding: '0.75rem 1.5rem',
                            whiteSpace: 'nowrap',
                            display: 'flex',
                            alignItems: 'center',

                            gap: '0.5rem',
                            color: 'hsl(var(--foreground))',
                            fontWeight: '500',
                            borderLeft: `4px solid ${cat.color}`,
                            textDecoration: 'none'
                        }}
                    >
                        {cat.name}
                    </Link>
                ))}

            </div>
        </section >
    );
}
