// theme-context.ts
import { createContext } from 'react';
export const ThemeContext = createContext({
    theme: '',
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    setTheme: (theme: string) => {},
});