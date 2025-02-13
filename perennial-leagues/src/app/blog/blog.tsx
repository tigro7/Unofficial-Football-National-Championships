'use client';

import { useEffect, useState } from 'react';
import Card from '@/app/components/Card';
import { BlogPost } from '@/app/lib/definitions';

const Blog = () => {

    const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  
    useEffect(() => {
        const fetchBlogPosts = async () => {
            try {            
                const host = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'; // URL di base
                const response = await fetch(`${host}/api/blog`);
                const data = await response.json();
                setBlogPosts(data);
            } catch (error) {
                console.error("Error fetching blog posts:", error);
            }
        };
    
        fetchBlogPosts();
    },);

    return (
        <>
            <h3 className="h3 w-1/2">Blog</h3>

            <div className="flex flex-wrap justify-between w-full mt-[var(--margin-big)]">
                {blogPosts.slice(0, 3).map((post) => (
                    <Card key={post.id} imageSrc='/blog.png' title={post.title} description={post.extract} buttonText='Read more' buttonLink={`/blog/${post.id}`} />
                ))}
            </div>
            <div className="flex flex-wrap justify-between w-full mt-[var(--margin-big)]">
                {blogPosts.slice(3, 6).map((post) => (
                    <Card key={post.id} imageSrc='/blog.png' title={post.title} description={post.extract} buttonText='Read more' buttonLink={`/blog/${post.id}`} />
                ))}
            </div>
            <div className="flex flex-wrap justify-between w-full mt-[var(--margin-big)]">
                {blogPosts.slice(6, 9).map((post) => (
                    <Card key={post.id} imageSrc='/blog.png' title={post.title} description={post.extract} buttonText='Read more' buttonLink={`/blog/${post.id}`} />
                ))}
            </div>
        </>
      );
};

export default Blog;