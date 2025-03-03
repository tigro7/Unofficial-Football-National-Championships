'use client';

import { useSession, signIn } from "next-auth/react";
import { SessionProvider } from "next-auth/react";
import { useEffect, useState } from "react";

const AddMatch = ({league = "serie_a"} : {league: string}) => {
  return (
    <SessionProvider>
        <ProtectedAddMatch league={league} />
    </SessionProvider>
  );
}

const ProtectedAddMatch = ({league = "serie_a"} : {league: string}) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { data: session, status } = useSession();
    const [isClient, setIsClient] = useState(false);
  
    // Verifica se siamo nel contesto client-side
    useEffect(() => {
      setIsClient(true);
    }, []);

  // Stato per il form
  const [formData, setFormData] = useState({
    detentore: "",
    sfidante: "",
    risultato: "",
    note: "",
    data: new Date().toISOString().split("T")[0],
    durata: 0,
    league,
    home: "",
    away: "",
    outcome: "n",
  });

  // Funzione per gestire il submit del form
  const handleSubmit = async (e: { preventDefault: () => void; }) => {
    e.preventDefault();

    //con

    try {
      const host = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'; // URL di base
      const response = await fetch(`${host}/api/${league}/matches`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        alert("Match aggiunto/aggiornato con successo!");
        setFormData({
            detentore: "",
            sfidante: "",
            risultato: "",
            note: "",
            data: new Date().toISOString().split("T")[0],
            durata: 0,
            league,
            home: "",
            away: "",
            outcome: "n",
        });
      } else {
        const error = await response.json();
        alert(`Errore: ${error.message}`);
      }
    } catch (err) {
      console.error(err);
      alert("Si è verificato un errore.");
    }
  };

  // Gestione redirect se non autenticato
  useEffect(() => {
    if (status === "unauthenticated" && isClient) {
      signIn();
    }
  }, [status, isClient]);

  // Mostra un loader durante il caricamento della sessione
  if (status === "loading") {
    return <p>Caricamento...</p>;
  }

  // Rendi il form solo se autenticato
  return (
    <div style={{ padding: "20px" }}>
        <h1>Aggiungi/Modifica Partita</h1>
        <form onSubmit={handleSubmit}>
            <div>
                <label>Squadra Casa:</label>
                <input
                    type="text"
                    value={formData.home}
                    onChange={(e) => setFormData({ ...formData, home: e.target.value })}
                    required
                />
            </div>
            {/* radio button per selezionare chi tra home e away è il detentore */}
            <div>
                <label>Detentore:</label>
                <div>
                    <input
                    type="radio"
                    id="homeDetentore"
                    name="detentore"
                    value="home"
                    checked={formData.detentore === "home"}
                    onChange={(e) => setFormData({ ...formData, detentore: e.target.value })}
                    />
                    <label htmlFor="homeDetentore">Casa</label>
                </div>
                <div>
                    <input
                    type="radio"
                    id="awayDetentore"
                    name="detentore"
                    value="away"
                    checked={formData.detentore === "away"}
                    onChange={(e) => setFormData({ ...formData, detentore: e.target.value })}
                    />
                    <label htmlFor="awayDetentore">Ospite</label>
                </div>
            </div>

            <div>
                <label>Squadra Ospite:</label>
                <input
                    type="text"
                    value={formData.away}
                    onChange={(e) => setFormData({ ...formData, away: e.target.value })}
                    required
                />
            </div>
            <div>
                <label>Risultato:</label>
                <input
                    type="text"
                    value={formData.risultato}
                    onChange={(e) => setFormData({ ...formData, risultato: e.target.value })}
                />
            </div>
            <div>
                <label>Note:</label>
                <input
                    type="text"
                    value={formData.note}
                    onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                    placeholder={`indicare competizione se diversa da ${league}`}
                />
            </div>
            <div>
                <label>Data Partita:</label>
                <input
                    type="date"
                    value={formData.data}
                    onChange={(e) => setFormData({ ...formData, data: e.target.value })}
                    required
                />
            </div>
            {/* outcome è una select o un radio tra 'n', 'v', 's', 'd' */}
            <div>
                <label>Esito:</label>
                <select
                    value={formData.outcome}
                    onChange={(e) => setFormData({ ...formData, outcome: e.target.value })}
                >
                    <option value="n">Non disputata</option>
                    <option value="v">Vittoria</option>
                    <option value="s">Sconfitta</option>
                    <option value="d">Pareggio</option>
                </select>
            </div>
            <button type="submit">Salva</button>
        </form>
    </div>
  );
}

export default AddMatch;
