import { createContext, useContext, useState, ReactNode } from 'react';

interface InfoContextType {
  info: string | null;
  setInfo: (info: string | null) => void;
}

const InfoContext = createContext<InfoContextType | undefined>(undefined);

export const InfoProvider = ({ children }: { children: ReactNode }) => {
  const [info, setInfo] = useState<string | null>(null);

  return (
    <InfoContext.Provider value={{ info, setInfo }}>
      {children}
    </InfoContext.Provider>
  );
};

export const useInfo = () => {
  const context = useContext(InfoContext);
  if (!context) {
    throw new Error('useInfo must be used within an InfoProvider');
  }
  return context;
};