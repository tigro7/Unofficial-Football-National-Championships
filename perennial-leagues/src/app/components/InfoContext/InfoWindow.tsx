import { useEffect } from 'react';
import { useInfo } from './InfoContext';

const InfoWindow = () => {
  const { info, setInfo } = useInfo();

  console.info(info);

  useEffect(() => {
    const handleClose = (e: { type: unknown; }) => {
        console.info(e.type);
        return setInfo(null);
    }

    if (info) {
      document.body.style.overflow = 'hidden'; // Disabilita lo scroll della pagina
      window.addEventListener('click', handleClose);
      window.addEventListener('scroll', handleClose);
    } else {
      document.body.style.overflow = 'auto'; // Ripristina lo scroll della pagina
      window.removeEventListener('click', handleClose);
      window.removeEventListener('scroll', handleClose);
    }

    return () => {
      window.removeEventListener('click', handleClose);
      window.removeEventListener('scroll', handleClose);
      document.body.style.overflow = 'auto'; // Assicurati di ripristinare lo scroll della pagina
    };
  }, [info, setInfo]);

  if (!info) return null;

  return (
    <>
        <div className="fixed inset-0 bg-black opacity-50 z-10" onClick={() => setInfo(null)} />
        <div className="fixed bottom-0 w-1/2 h-1/8 left-1/4 portrait:w-full portrait:left-0 bg-system p-4 shadow-lg rounded-md z-10">
        <div className="flex justify-between items-center">
            <p className="text-sm">{info}</p>
            <button onClick={() => setInfo(null)} className="text-red-500">Close</button>
        </div>
        </div>
    </>
  );
};

export default InfoWindow;