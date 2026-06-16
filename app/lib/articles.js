import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { remark } from 'remark';
// import html from 'remark-html'; // Removed in favor of rehype
import remarkGfm from 'remark-gfm';
import { remarkAlert } from 'remark-github-blockquote-alert';
import remarkRehype from 'remark-rehype';
import rehypeSlug from 'rehype-slug';
import rehypeStringify from 'rehype-stringify';
import GithubSlugger from 'github-slugger';

let articlesDirectory = path.join(process.cwd(), 'data-articles');

// 本番環境（standaloneなど）でカレントディレクトリ基準のディレクトリが見つからない場合のフォールバック
if (!fs.existsSync(articlesDirectory)) {
    const standalonePath = path.join(process.cwd(), '.next/standalone/data-articles');
    if (fs.existsSync(standalonePath)) {
        articlesDirectory = standalonePath;
    } else {
        const relativePath = path.join(__dirname, '../../data-articles');
        if (fs.existsSync(relativePath)) {
            articlesDirectory = relativePath;
        }
    }
}

export function getSortedArticlesData() {
    // Return empty array if directory doesn't exist
    console.log(`[SSR] Checking directory: ${articlesDirectory}`);
    if (!fs.existsSync(articlesDirectory)) {
        console.warn(`[WARN] Articles directory not found: ${articlesDirectory}`);
        // Let's also check parent to see where we are
        const parentDir = path.dirname(articlesDirectory);
        if (fs.existsSync(parentDir)) {
            console.log(`[DEBUG] Parent directory exists. Children: ${fs.readdirSync(parentDir).join(', ')}`);
        }
        return [];
    }

    // Get file names under /data/articles
    const fileNames = fs.readdirSync(articlesDirectory);
    console.log(`[SSR] Found ${fileNames.length} articles`);
    const allArticlesData = fileNames.map((fileName) => {
        // Remove ".md" from file name to get id and normalize to lowercase
        const id = fileName.replace(/\.md$/, '').toLowerCase();

        // Read markdown file as string
        const fullPath = path.join(articlesDirectory, fileName);
        const fileContents = fs.readFileSync(fullPath, 'utf8');

        // Use gray-matter to parse the post metadata section
        const matterResult = matter(fileContents);

        // Combine the data with the id
        return {
            id,
            ...matterResult.data,
            // default to true if not specified
            published: matterResult.data.published ?? true,
        };
    });

    // Sort posts by date
    return allArticlesData.sort((a, b) => {
        const dateA = (a.date || '').replace(/\./g, '-');
        const dateB = (b.date || '').replace(/\./g, '-');
        
        if (dateA < dateB) {
            return 1;
        } else if (dateA > dateB) {
            return -1;
        } else {
            // 日付が同じ場合はファイル名(id)で並べる
            if (a.id < b.id) {
                return 1;
            } else if (a.id > b.id) {
                return -1;
            }
            return 0;
        }
    });
}
export async function getArticleData(id) {
    try {
        const normalizedId = id.toLowerCase();
        const fullPath = path.join(articlesDirectory, `${normalizedId}.md`);
        
        console.log(`[DEBUG - getArticleData] articlesDirectory path: "${articlesDirectory}"`);
        console.log(`[DEBUG - getArticleData] Target file path: "${fullPath}"`);
        
        const dirExists = fs.existsSync(articlesDirectory);
        const fileExists = fs.existsSync(fullPath);
        console.log(`[DEBUG - getArticleData] Directory exists: ${dirExists}, File exists: ${fileExists}`);

        if (!fileExists) {
            console.warn(`[DEBUG - getArticleData] File not found: "${fullPath}"`);
            return null;
        }

        const fileContents = fs.readFileSync(fullPath, 'utf8');
        console.log(`[DEBUG - getArticleData] File read successfully. Character length: ${fileContents.length}`);

        // Use gray-matter to parse the post metadata section
        const matterResult = matter(fileContents);
        console.log(`[DEBUG - getArticleData] parsed matter metadata: ${JSON.stringify(matterResult.data)}`);

        // Extract TOC
        const slugger = new GithubSlugger();
        const toc = [];
        const lines = matterResult.content.split('\n');

        // Simple regex to catch headings (ignores code blocks for simplicity, but robust enough for this use case)
        lines.forEach(line => {
            const match = line.match(/^(#{2,3})\s+(.*)/);
            if (match) {
                const level = match[1].length;
                // Strip markdown link formatting from TOC text
                let text = match[2].trim().replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');
                // Also strip any HTML tags if present
                text = text.replace(/<[^>]*>?/gm, '');
                const id = slugger.slug(text);
                toc.push({ level, text, id });
            }
        });
        console.log(`[DEBUG - getArticleData] TOC extracted: ${toc.length} headings found.`);

        // Use remark/rehype to convert markdown into HTML string with IDs
        console.log(`[DEBUG - getArticleData] Starting markdown to HTML conversion with remark/rehype...`);
        const processedContent = await remark()
            .use(remarkGfm)
            .use(remarkAlert)
            .use(remarkRehype, { allowDangerousHtml: true }) // Parse to HTML AST
            .use(rehypeSlug) // Add IDs to headings
            .use(rehypeStringify, { allowDangerousHtml: true }) // Serialize back to HTML string
            .process(matterResult.content);

        let contentHtml = processedContent.toString();
        console.log(`[DEBUG - getArticleData] HTML conversion completed. HTML length: ${contentHtml.length}`);

        // 1. Wrap tables for scrolling and 2. Automatically link drug names in specific columns
        // We use a more sophisticated approach to target specific columns
        const tableRegex = /<table[^>]*>([\s\S]*?)<\/table>/g;
        contentHtml = contentHtml.replace(tableRegex, (match) => {
            // Find header to identify indices of drug columns
            const headerMatch = match.match(/<th[^>]*>([\s\S]*?)<\/th>/g);
            if (!headerMatch) return `<div class="table-wrapper">${match}</div>`;

            const drugColumnIndices = headerMatch.reduce((acc, th, index) => {
                const text = th.replace(/<[^>]*>/g, '').trim();
                if (/医薬品名|一般名|薬剤名|商品名/.test(text)) {
                    acc.push(index);
                }
                return acc;
            }, []);

            if (drugColumnIndices.length === 0) return `<div class="table-wrapper">${match}</div>`;

            // Process rows and cells
            let processedTable = match;
            const trRegex = /<tr[^>]*>([\s\S]*?)<\/tr>/g;
            let rowIndex = 0;

            processedTable = processedTable.replace(trRegex, (trMatch) => {
                // Skip header row
                if (trMatch.includes('<th')) {
                    rowIndex++;
                    return trMatch;
                }

                const tdRegex = /<td[^>]*>([\s\S]*?)<\/td>/g;
                let colIndex = 0;
                const processedTr = trMatch.replace(tdRegex, (tdMatch, tdContent) => {
                    const currentAnchorCol = colIndex;
                    colIndex++;

                    if (drugColumnIndices.includes(currentAnchorCol)) {
                        // Strip all existing HTML tags from the content first to avoid splitting tags like <strong>
                        const textContent = tdContent.replace(/<[^>]*>/g, '');

                        // Split content by separators (e.g., " / ", "／", "・", "(", ")", "（", "）")
                        // Use a regex that captures the separators so we can preserve them if needed, 
                        // or just filter them out for linking.
                        const parts = textContent.split(/([\/／・（）\(\)])/);
                        const linkedParts = parts.map(part => {
                            // If it's a separator, keep it as is
                            if (/^[\/／・（）\(\)]$/.test(part)) return part;

                            const text = part.trim();
                            if (text && text.length > 1) {
                                const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(text)}+添付文書`;
                                return `<a href="${searchUrl}" target="_blank" rel="noopener noreferrer" class="drug-search-link">${part}</a>`;
                            }
                            return part;
                        });
                        return tdMatch.replace(tdContent, linkedParts.join(''));
                    }
                    return tdMatch;
                });

                rowIndex++;
                return processedTr;
            });

            return `<div class="table-wrapper">${processedTable}</div>`;
        });

        // Combine the data with the id and contentHtml
        return {
            id,
            contentHtml,
            toc, // Return TOC
            published: matterResult.data.published ?? true,
            ...matterResult.data,
        };
    } catch (err) {
        console.error(`[ERROR - getArticleData] Failed to load data for article "${id}":`, err);
        throw err; // Re-throw to be caught by page.js
    }
}



export function getArticlesByCategory(category) {
    const allArticles = getSortedArticlesData();
    // Decode category if it comes from URL
    const decodedCategory = decodeURIComponent(category);
    return allArticles.filter(article => article.category === decodedCategory);
}

export function getArticlesForSearch(query) {
    if (!query) return [];
    const lowerQuery = query.toLowerCase();
    const allArticles = getSortedArticlesData();

    return allArticles.filter((article) => {
        const titleMatch = article.title?.toLowerCase().includes(lowerQuery);
        const summaryMatch = article.summary?.toLowerCase().includes(lowerQuery);
        // Note: 'content' might not be in the initial list if getSortedArticlesData doesn't parse full content.
        // Let's check getSortedArticlesData. It parses `matter(fileContents)`.
        // gray-matter returns .content.
        // But getSortedArticlesData implementation:
        // const matterResult = matter(fileContents);
        // return { id, ...matterResult.data };
        // It does NOT include matterResult.content in the return.
        // We need to update getSortedArticlesData or read content here.
        // For performance in search, we should probably read content here if not available,
        // OR better, update getSortedArticlesData to optionally include content?
        // No, getSortedArticlesData is used for lists. keeping it light is good.
        // Let's re-read the file here for content, or better, refactor this mapping.

        // Actually since we are inside a server function, we can just re-read or access content.
        // However, getSortedArticlesData implementation in this file:
        // const fileContents = fs.readFileSync(fullPath, 'utf8');
        // const matterResult = matter(fileContents);
        // It *discards* content.

        // Let's implement searching by reading files again or modifying the helper.
        // Since we want to search *ALL* articles, we can just iterate and read.
        // But to be efficient let's reuse getSortedArticlesData and then read content if needed?
        // Actually, getSortedArticlesData reads the file anyway. 
        // Let's just create a specialized search helper that reads content.

        // Wait, I can't easily see the full file content of getSortedArticlesData in this replace context blindly, 
        // but I have it in history.
        // It does: return { id, ...matterResult.data };

        // So I will make this function read the files itself to be safe and correct.

        const fullPath = path.join(articlesDirectory, `${article.id}.md`);
        const fileContents = fs.readFileSync(fullPath, 'utf8');
        const matterResult = matter(fileContents);
        const contentMatch = matterResult.content.toLowerCase().includes(lowerQuery);

        return titleMatch || summaryMatch || contentMatch;
    });
}
