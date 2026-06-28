import Link from 'next/link';
import Header from '../components/Header';
import Footer from '../components/Footer';

export default function AboutPage() {
    const startYear = 2022;
    const currentYear = new Date().getFullYear();
    const currentMonth = new Date().getMonth(); // 0 is January, 3 is April
    const yearOfExperience = currentYear - startYear + (currentMonth >= 3 ? 1 : 0);

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
                        サイトについて
                    </h1>

                    <div className="article-content">
                        <p>
                            「薬剤師一年目の勉強NOTE」へようこそ。
                        </p>
                        <p>
                            本サイトは、新人薬剤師が日々の業務の中で学んだこと、処方意図の解釈、ガイドラインの要点などをまとめた勉強ノートです。
                        </p>
                        <p>
                            教科書的な知識だけでなく、「現場でどう考えるか」「処方箋から何を読み取るか」という実践的な視点を大切にしています。
                        </p>

                        <h3>運営者情報</h3>
                        <ul>
                            <li><strong>運営者:</strong> 薬剤師（あおさん）</li>
                            <li><strong>経歴:</strong> 薬剤師{yearOfExperience}年目。個人在宅をメインとした調剤薬局に勤務。新人教育や研修の実施担当。</li>
                            <li><strong>サイトを作った理由:</strong> 私自身が現場で行った新人教育や研修の経験を通して、全ての薬剤師が安心して業務を行えるようにサポートしたいと考えました。また、「処方箋から病気を読む」という実践的な知識を若手薬剤師に伝えたいという思いから、このサイトを立ち上げました。</li>
                        </ul>

                        <h3>情報の引用・参考方針</h3>
                        <p>
                            本サイトの記事は、最新のガイドライン、添付文書、インタビューフォーム、その他信頼できる医学的・薬学的文献を元に作成しています。また、私自身の臨床経験（E-E-A-T）を踏まえ、現場で役立つ実践的な視点を交えて解説を行っています。
                        </p>

                        <h3>目的</h3>
                        <ul>
                            <li>自身の知識の整理と備忘録</li>
                            <li>同じように悩む新人薬剤師の先生方の参考になれば幸いです</li>
                        </ul>

                        <blockquote>
                            <p><strong>免責事項</strong></p>
                            <p>本サイトの内容は正確性を期していますが、あくまで個人の学習ノートです。実際の投薬・指導に関しては、最新の添付文書やガイドラインを参照し、ご自身の責任において行ってください。</p>
                        </blockquote>
                    </div>
                </div>
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
