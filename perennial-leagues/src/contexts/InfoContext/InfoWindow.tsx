'use client';

import { useEffect, useRef } from 'react';
import { useInfo } from './InfoContext';

const InfoWindow = () => {
  const { info, setInfo } = useInfo();
  const dialogRef = useRef<HTMLDivElement>(null);
  const titleId = 'info-dialog-title';

  useEffect(() => {
    const handleClose = (e: { type: unknown; }) => {
        console.info(e.type);
        return setInfo(null);
    }

    if (info) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('click', handleClose);
      window.addEventListener('scroll', handleClose);
    } else {
      document.body.style.overflow = 'auto';
      window.removeEventListener('click', handleClose);
      window.removeEventListener('scroll', handleClose);
    }

    return () => {
      window.removeEventListener('click', handleClose);
      window.removeEventListener('scroll', handleClose);
      document.body.style.overflow = 'auto';
    };
  }, [info, setInfo]);

  // Focus trap + Escape key
  useEffect(() => {
    if (!info || !dialogRef.current) return;

    const dialog = dialogRef.current;
    const focusable = dialog.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    first?.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setInfo(null);
        return;
      }
      if (e.key !== 'Tab') return;
      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last?.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first?.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [info, setInfo]);

  if (!info) return null;

  return (
    <>
        <div className="fixed inset-0 bg-black opacity-50 z-10" onClick={() => setInfo(null)} aria-hidden="true" />
        <div
          ref={dialogRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          className="fixed landscape:bottom-1/2 portrait:bottom-0 w-1/2 h-1/8 left-1/4 portrait:w-full portrait:left-0 bg-system p-4 shadow-lg rounded-t-md landscape:rounded-b-md z-10"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="text-center">
              {typeof info == 'string' && <p id={titleId} className="text-sm">{info}</p>}
              {typeof info == 'object' && 'title' in info && typeof info.title == 'string' && <p id={titleId} className="text-lg font-bold">{info.title}</p>}
              {typeof info == 'object' && 'data' in info && typeof info.data == 'string' && <p className="text-sm italic">{info.data}</p>}
              {typeof info == 'object' && 'value' in info && typeof info.value == 'string' && <p className="text-sm">{info.value}</p>}
              {typeof info == 'object' && 'content' in info && typeof info.content == 'string' && <p className="text-md font-medium">{info.content}</p>}
              {typeof info == 'object' && 'longInfo' in info && typeof info.longInfo == 'string' && <hr className="m-1 border-foreground" />}
              {typeof info == 'object' && 'longInfo' in info && typeof info.longInfo == 'string' && <p className="text-md">{info.longInfo}</p>}
              <button type="button" onClick={() => setInfo(null)} className="text-red-500">Close</button>
          </div>
        </div>
    </>
  );
};

export default InfoWindow;
