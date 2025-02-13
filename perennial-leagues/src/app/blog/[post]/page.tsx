import Post from "./post";
import ErrorBoundary from "@/app/components/ErrorBoundary";
 
export default async function Page({ params, }: { params: Promise<{ post: number }>}) {
    const post = (await params).post;

    return (
        <ErrorBoundary>
            <Post post_id={post} />
        </ErrorBoundary>
    )
}