import fs from 'fs';
import path from 'path';

const imagesDirectory = path.join(process.cwd(), 'public/images');

export function getAllArticleImages() {
    // If the directory doesn't exist, return empty array
    if (!fs.existsSync(imagesDirectory)) {
        return [];
    }

    // Get all subdirectories (which effectively map to article IDs)
    // e.g., 'hypertension'
    const articleDirs = fs.readdirSync(imagesDirectory).filter(file => {
        return fs.statSync(path.join(imagesDirectory, file)).isDirectory();
    });

    let allImages = [];

    articleDirs.forEach(articleDir => {
        const fullDirPath = path.join(imagesDirectory, articleDir);
        // Get files in the directory
        const files = fs.readdirSync(fullDirPath).filter(file => {
            // Filter for image extensions if necessary, or just take everything
            return /\.(png|jpg|jpeg|gif|webp|svg)$/i.test(file);
        });

        files.forEach(file => {
            allImages.push({
                articleId: articleDir,
                fileName: file,
                src: `/images/${articleDir}/${file}`
            });
        });
    });

    return allImages;
}
