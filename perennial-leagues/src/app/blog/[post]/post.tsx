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

    return (
        <>
            <span className='par w-1/2'>{blogPost?.date ? new Date(blogPost.date).toLocaleDateString() : ''}</span>
            <h3 className="h3 w-1/2">{blogPost?.title}</h3>
            <span className='par w-1/2'>{blogPost?.author}</span>
            <span className="h4 w-1/2 text-primary mt-[var(--margin-md)] block">
                {blogPost?.body}
            </span>
        </>
      );
};

export default League;