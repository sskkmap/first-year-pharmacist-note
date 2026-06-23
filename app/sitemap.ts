import { MetadataRoute } from 'next'
import { getSortedArticlesData } from './lib/articles'

export default function sitemap(): MetadataRoute.Sitemap {
    const baseUrl = 'https://first-year-pharmacist-note.site';
    const articles = getSortedArticlesData() as any[];

    const articleUrls = articles.map((article) => ({
        url: `${baseUrl}/articles/${article.id}`,
        lastModified: article.date ? new Date(article.date.replace(/\./g, '-')) : new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.8,
    }));

    return [
        {
            url: baseUrl,
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: 1,
        },
        ...articleUrls,
    ]
}