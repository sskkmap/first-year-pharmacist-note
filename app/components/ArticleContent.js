'use client';

import { useEffect, useRef } from 'react';

export default function ArticleContent({ html }) {
    const contentRef = useRef(null);

    useEffect(() => {
        const images = contentRef.current.querySelectorAll("img");

        const handleClick = (e) => {
            const img = e.target;
            const modal = document.createElement("div");
            modal.className = "image-modal";
            modal.innerHTML = `<img src="${img.src}" alt="${img.alt || ''}">`;
            modal.onclick = () => {
                modal.classList.remove('active');
                setTimeout(() => modal.remove(), 200);
            };
            document.body.appendChild(modal);

            // Simple animation
            requestAnimationFrame(() => {
                modal.style.display = "flex";
                // If we want transitions we could add a class, but inline style as requested:
            });
        };

        images.forEach(img => {
            img.style.cursor = 'zoom-in';
            img.addEventListener("click", handleClick);
        });

        return () => {
            images.forEach(img => {
                img.removeEventListener("click", handleClick);
            });
        };
    }, [html]);

    return (
        <div
            ref={contentRef}
            className="article-content"
            dangerouslySetInnerHTML={{ __html: html }}
        />
    );
}
