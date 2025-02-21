'use client';

import { useEffect, useState } from 'react';
import Card from '@/app/components/Card';
import { BlogPost } from '@/app/lib/definitions';

const Blog = () => {

    const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const postsPerPage = 9;
  
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
    }, []);

    const indexOfLastPost = currentPage * postsPerPage;
    const indexOfFirstPost = indexOfLastPost - postsPerPage;
    const currentPosts = blogPosts.slice(indexOfFirstPost, indexOfLastPost);
  
    const nextPage = () => {
      if (indexOfLastPost < blogPosts.length) {
        setCurrentPage(currentPage + 1);
      }
    };
  
    const prevPage = () => {
      if (currentPage > 1) {
        setCurrentPage(currentPage - 1);
      }
    };

    return (
        <>
            <h3 className="h3 w-1/2">Blog</h3>

            <div className="flex flex-wrap justify-between w-full mt-[var(--margin-big)] gap-y-[var(--margin-big)]">
                {currentPosts.slice(0, 3).map((post) => (
                    <Card key={post.id} imageSrc='/card_background.png' title={post.title} description={post.extract} buttonText='Read more' buttonLink={`/blog/${post.id}`} />
                ))}
            </div>
            <div className="flex flex-wrap justify-between w-full mt-[var(--margin-big)] gap-y-[var(--margin-big)]">
                {currentPosts.slice(3, 6).map((post) => (
                    <Card key={post.id} imageSrc='/card_background.png' title={post.title} description={post.extract} buttonText='Read more' buttonLink={`/blog/${post.id}`} />
                ))}
            </div>
            <div className="flex flex-wrap justify-between w-full mt-[var(--margin-big)] gap-y-[var(--margin-big)]">
                {currentPosts.slice(6, 9).map((post) => (
                    <Card key={post.id} imageSrc='/card_background.png' title={post.title} description={post.extract} buttonText='Read more' buttonLink={`/blog/${post.id}`} />
                ))}
            </div>

            <div className="flex justify-between w-full mt-[var(--margin-big)] gap-y-[var(--margin-big)]">
                <button onClick={prevPage} disabled={currentPage === 1} className="bg-primary text-white px-4 py-2 rounded-lg">
                    Previous
                </button>
                <button onClick={nextPage} disabled={indexOfLastPost >= blogPosts.length} className="bg-primary text-white px-4 py-2 rounded-lg">
                    Next
                </button>
            </div>
        </>
      );
};

export default Blog;