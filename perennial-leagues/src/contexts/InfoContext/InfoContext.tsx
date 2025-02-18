import { createContext, useContext, useState, ReactNode } from 'react';

interface InfoContextType {
  info: string | object | null;
  setInfo: (info: string | object | null) => void;
}

const InfoContext = createContext<InfoContextType | undefined>(undefined);

export const InfoProvider = ({ children }: { children: ReactNode }) => {
  const [info, setInfo] = useState<string | object | null>(null);

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