import Blog from "./blog";
import ErrorBoundary from "@/app/components/ErrorBoundary";
 
export default async function Page() {
    return (
        <ErrorBoundary>
            <Blog />
        </ErrorBoundary>
    )
}