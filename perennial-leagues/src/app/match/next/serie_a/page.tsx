/*recupera la data più recente in db e reindirizza a /match/[data]/serie_a*/
import Loading from '@/app/loading';
import { redirect } from 'next/navigation';

export default async function Page() {
    const host = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'; // URL di base
    let data;
  
    try {
      const response = await fetch(`${host}/api/matches/serie_a/last`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const jsonData = await response.json();
      data = jsonData[0];
    } catch (error) {
      console.error('Errore durante il fetch dei dati:', error);
      return (
        <div>
          <h1>Errore durante il caricamento dei dati</h1>
          <p>Si è verificato un errore durante il caricamento dei dati. Per favore riprova più tardi.</p>
        </div>
      );
    }
  
    if (!data || !data.data) {
      return (
        <div>
          <h1>Nessun dato disponibile</h1>
          <p>Non è stato possibile trovare i dati del match più recente.</p>
        </div>
      );
    }
  
    const dateForLink = new Date(data.data).toLocaleDateString().split('/').reverse().join('-');
  
    // Reindirizza alla pagina del match più recente
    redirect(`/match/${dateForLink}/serie_a`);
  
    return (<Loading />);
}
