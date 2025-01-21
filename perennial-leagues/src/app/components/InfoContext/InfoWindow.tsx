import { useEffect } from 'react';
import { useInfo } from './InfoContext';

const InfoWindow = () => {
  const { info, setInfo } = useInfo();

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
        <div className="fixed landscape:bottom-1/2 portrait:bottom-0 w-1/2 h-1/8 left-1/4 portrait:w-full portrait:left-0 bg-system p-4 shadow-lg rounded-t-md landscape:rounded-b-md z-10">
        <div className="text-center">
            {typeof info == 'string' && <p className="text-sm">{info}</p>}
            {typeof info == 'object' && 'title' in info && typeof info.title == 'string' && <p className="text-lg font-bold">{info.title}</p>}
            {typeof info == 'object' && 'data' in info && typeof info.data == 'string' && <p className="text-sm italic">{info.data}</p>}
            {typeof info == 'object' && 'value' in info && typeof info.value == 'string' && <p className="text-sm">{info.value}</p>}
            {typeof info == 'object' && 'content' in info && typeof info.content == 'string' && <p className="text-md font-medium">{info.content}</p>}
            {typeof info == 'object' && 'longInfo' in info && typeof info.longInfo == 'string' && <hr className="m-1 border-foreground" />}
            {typeof info == 'object' && 'longInfo' in info && typeof info.longInfo == 'string' && <p className="text-md">{info.longInfo}</p>}
            <button onClick={() => setInfo(null)} className="text-red-500">Close</button>
        </div>
        </div>
    </>
  );
};

export default InfoWindow;