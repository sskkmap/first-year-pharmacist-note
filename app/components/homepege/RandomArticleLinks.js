import Link from 'next/link';

export default function RandomArticleLinks({ articles = [] }) {
    // 記事リストをシャッフルして最大10件抽出
    const getRandomArticles = (arr, num) => {
        const shuffled = [...arr].sort(() => 0.5 - Math.random());
        return shuffled.slice(0, num);
    };

    const randomArticles = getRandomArticles(articles, 10);

    if (randomArticles.length === 0) return null;

    return (
        <section className="random-links-card">
            <div className="random-links-title">
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                >
                    <path d="M2 3h6a4 4 0 0 1 4 4v14a4 4 0 0 0-4-4H2z" />
                    <path d="M22 3h-6a4 4 0 0 0-4 4v14a4 4 0 0 1 4-4h6z" />
                </svg>
                <span>他のタイトルも観る</span>
            </div>
            <div className="styled-random-list">
                {randomArticles.map((article, index) => (
                    <div key={`${article.id}-${index}`} className="styled-random-item">
                        <Link href={`/articles/${article.id}`}>
                            {article.title}
                        </Link>
                    </div>
                ))}
            </div>
        </section>
    );
}
