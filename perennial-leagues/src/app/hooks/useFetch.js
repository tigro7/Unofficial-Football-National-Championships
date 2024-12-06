import { useEffect, useState } from "react";
import useInterval from "./useInterval";

const useFetch = (url,refreshInterval,randomRefresher) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
    const fetchData = async () => {
      setLoading(true); //inizia il caricamento
      fetch(url, {
        method: 'GET',
        headers: {
          'Cache-Control': 'no-cache', // Disabilita la cache
        },
      })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Errore: ${response.status}`);
        }
        return response.json();
      })
      .then((data) => {
        setData(data);   // Imposta i dati
        setError(null);  // Reset dell'errore
      })
      .catch((error) => {
        setError(error.message); // Gestione errore
      })
      .finally(() => {
        setLoading(false); // Fine caricamento
      });
    }
  
    useEffect(() => {
      fetchData();
      
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [url, randomRefresher]);
  
    useInterval(() => {
      if (refreshInterval) {
        //console.debug(refreshInterval);
        fetchData();
      }
    }, refreshInterval);

    return {data, loading, error, setData};
}

export default useFetch;