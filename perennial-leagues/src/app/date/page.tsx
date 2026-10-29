import { Suspense } from 'react';
import DateSearch from './date';

export default function Page() {
    return (
        <>
            <title>Who Reigned On… - UFNC</title>
            <Suspense>
                <DateSearch />
            </Suspense>
        </>
    );
}
