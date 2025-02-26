'use client';

import { BlogPost } from '@/app/lib/definitions';
import { useEffect, useState } from 'react';

const League = ({post_id} : { post_id: number}) => {
    const [blogPost, setBlogPost] = useState<BlogPost>();
  
    useEffect(() => {
        const fetchBlogPost = async () => {
            try {            
                const host = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'; // URL di base
                const response = await fetch(`${host}/api/blog/${post_id}`);
                const data = await response.json();
                setBlogPost(data[0]);
            } catch (error) {
                console.error("Error fetching blog posts:", error);
            }
        };
    
        fetchBlogPost();
    }, [post_id]);

    const renderParagraph = (paragraph: string, index: number) => {
        const linkRegex = /\(url:'(.*?)';testo:'(.*?)'\)/g;
        const parts = [];
        let lastIndex = 0;
        let match;
    
        while ((match = linkRegex.exec(paragraph)) !== null) {
          // Aggiungi il testo prima del link
          if (match.index > lastIndex) {
            parts.push(paragraph.substring(lastIndex, match.index));
          }
          // Aggiungi il link
          parts.push(
            <a key={match.index} href={match[1]} className="link-secondary" target="_blank" rel="noopener noreferrer">
              {match[2]}
            </a>
          );
          lastIndex = linkRegex.lastIndex;
        }
    
        // Aggiungi il testo dopo l'ultimo link
        if (lastIndex < paragraph.length) {
          parts.push(paragraph.substring(lastIndex));
        }
    
        return (
          <p key={index} className="mb-4">
            {parts}
          </p>
        );
    };
    

    return (
        <>
            <title>Blog Post - UFNC</title>
            <h3 className="h3">{blogPost?.title}</h3>
            <span className='h4'>{blogPost?.date ? `${new Date(blogPost.date).toLocaleDateString()} - ` : ''}{blogPost?.author}</span>
            <span className="par text-primary mt-[var(--margin-md)] block">
                {blogPost?.body.split('\n').map((paragraph, index) => renderParagraph(paragraph, index))}
            </span>
        </>
      );
};

export default League;