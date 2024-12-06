import Modal from "../Modal/modal";
import { useState, useEffect, Fragment } from "react";
import styles from "./datachanger.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { fas } from "@fortawesome/free-solid-svg-icons";
import Select from "react-select";

const DataChanger = ({url, dataProps, originalKey, keyProp, handleInsertedData, handleUpdatedData, handleDeletedData, modalOpen, setModalOpen, modalType, modalData, setModalData}) => {

    const [options, setOptions] = useState({});
    const [deletedItems, setDeletedItems] = useState({});

    useEffect(() => {
        async function fetchOptions(apiEndpoint, key) {
            try{
                const response = await fetch(apiEndpoint, {
                    method: 'GET',
                    headers: {
                      'Cache-Control': 'no-cache', // Disabilita la cache
                    },
                  });
                if (!response.ok){
                    throw new Error (`Errore HTTP! status: ${response.status}`);
                }
                const data = await response.json();
                setOptions(prevOptions => ({ ...prevOptions, [key]: data }));
            }catch(error){
                console.error(`Errore nel fetch delle opzioni per i campi select: ${error}`);
                throw error;
            }
        }
      
        // Funzione ricorsiva per trovare e recuperare le opzioni per i campi 'select'
        function handleDataProps(items) {
            items.forEach(item => {
            if (item.type === 'select' && item.apiEndpoint) {
                fetchOptions(item.apiEndpoint, item.key);
            } else if (item.type === 'Object' && item.fields) {
                // Scorri nei campi annidati se l'elemento è un oggetto
                handleDataProps(item.fields);
            }
            });
        }

        // Avvia la ricerca a partire da dataProps
        if (dataProps && Array.isArray(dataProps)) {
            handleDataProps(dataProps);
        }

    }, [dataProps]);

    useEffect(() => {
        if (modalData && dataProps) {
          const updatedModalData = { ...modalData };
      
          dataProps.forEach((prop) => {
            if (prop.type === "select" && !updatedModalData[prop.key]) {
                // Imposta il valore predefinito solo se non è già presente in modalData
                const propValue = prop.optionValue || 'nome';
                updatedModalData[prop.key] = options?.[prop.key]?.[0]?.[propValue] || prop.options?.[0]?.value || null;  // Usa il primo valore come default
            }
          });
      
          setModalData(updatedModalData);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dataProps, modalOpen]);

    // Chiamata API per inserire un nuovo record
    const handleInsert = async (data) => {
        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });
            if (response.ok) {
                let newData = await response.json();
                await Promise.all(dataProps.map(async (field) => {
                    if (field.type === 'Object' && field.apiEndpoint) {
                        const relatedData = modalData[field.key] || [];
                        
                        // Array per memorizzare i dati aggiunti degli oggetti correlati
                        const insertedRelatedItems = [];

                        // aggiungi nuove righe
                        for (const item of relatedData) {
                            if (item.isNew) {
                                try{
                                    const postResponse = await fetch(`${field.apiEndpoint}/${keyProp(newData)}`, {
                                        method: 'POST',
                                        headers: { 'Content-Type': 'application/json' },
                                        body: JSON.stringify({ ...item, parentId: keyProp(newData) }),
                                    });                                    
                                    if (!response.ok){
                                        throw new Error (`Errore HTTP! status: ${response.status}`);
                                    }
                                    const newItem = await postResponse.json();
                                    insertedRelatedItems.push(newItem);  // Aggiungi il nuovo item inserito
                                }catch(error){
                                    console.error(`Errore nell'inserimento dei nuovi dati correlati: ${error}`);
                                    throw error;
                                }
                            }
                        }

                        // Aggiungi i dati inseriti degli oggetti correlati all'item principale
                        newData = {
                            ...newData,
                            [field.key]: insertedRelatedItems  // Aggiorna il campo con i valori correlati
                        };
                    }
                }));

                handleInsertedData(newData);
                // Aggiorna lo stato con il nuovo record
                handleCloseModal();
                // Richiama funzione per inserimento Object innestati
            } else {
                console.error("Errore durante l'inserimento del record");
            }
        } catch (error) {
            console.error("Errore di rete:", error);
        }
    };

    // Chiamata API per aggiornare il record esistente
    const handleUpdate = async (data) => {
        try {
            const response = await fetch(`${url}/${originalKey}`, {
                method: 'PUT',
                headers: {
                'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });
            if (response.ok) {
                let updatedItem = await response.json();
                // Richiama funzione per inserimento, aggiornamento, cancellazione Object innestati
                await Promise.all(dataProps.map(async (field) => {
                    if (field.type === 'Object' && field.apiEndpoint) {
                        const relatedData = modalData[field.key] || [];

                        // Array per memorizzare i dati aggiornati o aggiunti degli oggetti correlati
                        const updatedRelatedItems = [];
              
                        // Aggiorna le righe esistenti o aggiungi nuove righe
                        for (const item of relatedData) {
                            if (item.isNew) {
                                try{
                                    const postResponse = await fetch(`${field.apiEndpoint}/${keyProp(updatedItem)}`, {
                                        method: 'POST',
                                        headers: { 'Content-Type': 'application/json' },
                                        body: JSON.stringify({ ...item, parentId: keyProp(updatedItem) }),
                                    });                                  
                                    if (!postResponse.ok){
                                        throw new Error (`Errore HTTP! status: ${postResponse.status}`);
                                    }
                                    const newItem = await postResponse.json();
                                    updatedRelatedItems.push(newItem);  // Aggiungi il nuovo item inserito
                                }catch(error){
                                    console.error(`Errore nell'inserimento dei nuovi dati correlati: ${error}`);
                                    throw error;
                                }
                            } else {
                                try{
                                    const putResponse = await fetch(`${field.apiEndpoint}/${keyProp(updatedItem)}/${item[field.subKey]}`, {
                                        method: 'PUT',
                                        headers: { 'Content-Type': 'application/json' },
                                        body: JSON.stringify(item),
                                    });                                 
                                    if (!putResponse.ok){
                                        throw new Error (`Errore HTTP! status: ${putResponse.status}`);
                                    }
                                    const updatedRelatedItem = await putResponse.json();
                                    updatedRelatedItems.push(updatedRelatedItem);  // Aggiungi l'item aggiornato
                                }catch(error){
                                    console.error(`Errore nella modifica dei dati correlati: ${error}`);
                                    throw error;
                                }
                            }
                        }

                        // Cancella le righe rimosse
                        await Promise.all(Object.values(deletedItems).map(async item => {
                                try{
                                    const deleteResponse = await fetch(`${field.apiEndpoint}/${keyProp(updatedItem)}/${item[field.subKey]}`, {
                                        method: 'DELETE',
                                        headers: { 'Content-Type': 'application/json' },
                                    })                             
                                    if (!deleteResponse.ok){
                                        throw new Error (`Errore HTTP! status: ${deleteResponse.status}`);
                                    }
                                }catch(error){
                                    console.error(`Errore nella cancellazione dei dati correlati: ${error}`);
                                    throw error;
                                }
                            }
                        ));
                        setDeletedItems({});

                        // Aggiungi i dati aggiornati degli oggetti correlati all'item principale
                        updatedItem = {
                            ...updatedItem,
                            [field.key]: updatedRelatedItems  // Aggiorna il campo con i valori correlati
                        };
                    }
                }));
                // Aggiorna lo stato sostituendo il record modificato
                handleUpdatedData(updatedItem);
                handleCloseModal();
            } else {
                console.error("Errore durante la modifica del record");
            }
        } catch (error) {
            console.error("Errore di rete:", error);
        }
    };

    // Chiamata API per cancellare un record
    const handleDelete = async (data) => {
        try {
            const response = await fetch(`${url}/${keyProp(data)}`, {
                method: 'DELETE',
            });
            if (response.ok) {
                const deletedItem = await response.json();
                // Aggiorna lo stato rimuovendo il record cancellato
                handleDeletedData(deletedItem);
                handleCloseModal();
            } else {
                console.error("Errore durante la cancellazione del record");
            }
        } catch (error) {
            console.error("Errore di rete:", error);
        }
    };

    //fine gestione RUD

    const handleCloseModal = () => {
        setModalOpen(false);
        setModalData({});
    }

    //funzioni per campi oggetto (innestati)

    const addObjectFieldRow = (fieldKey) => {
        setModalData((prevData) => {
          const field = dataProps.find((prop) => prop.key === fieldKey);
          
          if (field && field.type === "Object") {
            // Creiamo una nuova riga dinamicamente basata sulla definizione di "fields" in dataProps
            const newObject = field.fields.reduce((obj, subField) => {
              obj[subField.key] = renderField(subField, '', handleFieldChange); // Definiamo il valore di default in base al tipo
              return obj;
            }, {});
      
            return {
              ...prevData,
              [fieldKey]: [...(prevData[fieldKey] || []), {...newObject, isNew: true}] // Aggiungiamo la nuova riga
            };
          }
      
          return prevData; // Se il campo non esiste o non è di tipo Object, non facciamo nulla
        });
    };
      
    const removeObjectFieldRow = (fieldKey, index) => {

        const removedItem = modalData[fieldKey][index];
          
        if (!removedItem.isNew){
          setDeletedItems(prevDeleted => ({...prevDeleted, removedItem}));
        }

        setModalData(prevData => ({ ...prevData, [fieldKey]: prevData[fieldKey].filter((_, i) => i !== index) }));
    };

    const handleFieldChange = (fieldKey, newValue) => {
        setModalData(prevData => {
          const keys = fieldKey.split('.');  // Separa la chiave in caso di annidamento
      
          // Funzione per aggiornare annidamenti profondi in modo immutabile
          const updateNestedValue = (prevData, keys, value) => {
            const key = keys[0];

            if (keys.length === 1) {
                return {
                    ...prevData,
                    [keys[0]]: value
                };
            }

            // Controlla se la chiave contiene un array (es: '_nomearray_[0]')
            const arrayMatch = key.match(/^(.+)\[(\d+)\]$/);
      
            if (arrayMatch) {
                const arrayKey = arrayMatch[1];  // Nome dell'array
                const index = parseInt(arrayMatch[2], 10);  // Indice dell'array
        
                const currentArray = prevData[arrayKey] || [];  // Recupera l'array corrente o ne crea uno vuoto
        
                // Assicura che stiamo modificando solo l'elemento all'indice specificato senza aggiungere nuovi elementi
                return {
                  ...prevData,
                  [arrayKey]: currentArray.map((item, i) => 
                    i === index ? updateNestedValue(item, keys.slice(1), value) : item
                  )
                };
            }
      
            return {
                ...prevData,
                [keys[0]]: updateNestedValue(prevData[keys[0]] || {}, keys.slice(1), value)
            };
          };

          return updateNestedValue(prevData, keys, newValue);
        });
    };

    const renderField = (field, value, onChange, parentKey = null) => {

        const fieldKey = parentKey ? `${parentKey}.${field.key}` : field.key;
      
        // Logica per gestire il campo in base al tipo
        if (field.type === 'select') {
            const optionValue = field.optionValue || 'nome';  
            const optionLabel = field.optionLabel || 'nome';
            const selectOptions = options[field.key]?.map(option => ({value: option[optionValue], label: option[optionLabel]}));

            return(
                <Select                 
                    key={field.key}
                    id={field.key + (parentKey ?? '')}
                    name={field.key}
                    placeholder={field.name}
                    value={selectOptions?.filter(option => option.value == value).pop() || ''} 
                    onChange={option => onChange(fieldKey, option.value)}
                    options={selectOptions}
                />
            )
        }
      
        if (field.type === 'Object') {
            return (
              <div>
                {/* Pulsante per aggiungere una nuova riga */}
                <button type="button" className={styles.addButton} onClick={() => addObjectFieldRow(fieldKey)}>
                    <FontAwesomeIcon className={styles.icon} icon={fas.faPlus}/>
                </button>
                {value?.map((item, index) => (
                  <div key={index} id={index} className={styles.subFieldRow}>
                    {/* Renderizza i sotto-campi per ogni oggetto */}
                    {field.fields.map(subField => (
                      <div key={subField.key} className={styles.subFieldItem}>
                        {renderField(subField, item[subField.key], onChange, `${fieldKey}[${index}]`)}
                      </div>
                    ))}
                    {/* Pulsante per rimuovere una riga */}
                    <button  type="button" className={styles.removeButton} onClick={() => removeObjectFieldRow(fieldKey, index)}>
                        <FontAwesomeIcon className={styles.icon} icon={fas.faMinus}/>
                    </button>
                  </div>
                ))}

              </div>
            );
          }
      
        // Altri tipi di campo come text, number, ecc.
        return (
            <input
                key={field.key}
                id={field.key + (parentKey ?? '')}
                name={field.key}
                type={field.type}
                value={value}
                onChange={(e) => onChange(fieldKey, e.target.value)}  // Passa la chiave completa
            />
        );
    };

    return(        
        <Modal isOpen={modalOpen} onClose={handleCloseModal} modalTitle={modalType === "C" ? 'Inserimento' : modalType === "U" ? 'Modifica' : 'Cancellazione'}>
            {modalType === "D" ? (
                <div className={styles.divCancellazione}>
                    <p>Sei sicuro di voler cancellare questo record?</p>
                    <button onClick={() => handleDelete(modalData)}>Conferma</button>
                    <button onClick={handleCloseModal}>Annulla</button>
                </div>
            ) : (
                <form key={`form${dataProps.keyProp}`} className={styles.form} onSubmit={(e) => {
                    e.preventDefault();
                    if (modalType === "C") {
                        handleInsert(modalData);
                    } else if (modalType === "U") {
                        handleUpdate(modalData);
                    }
                }}>

                    {
                        modalOpen &&
                        dataProps.map((item) => (
                                <Fragment key={`fragment${item.key}`}>
                                    <label htmlFor={(item.type == "Object" ? '' : item.key)}>
                                        {item.name}
                                    </label>
                                    {renderField(item, modalData[item.key], handleFieldChange)}
                                </Fragment>
                            )
                        )
                    }
                    <div className={styles.buttonContainer}>
                        <button type="button" onClick={handleCloseModal}>Annulla</button>
                        <button type="submit">Salva</button>
                    </div>
                </form>
            )}
        </Modal>
      );
}

export default DataChanger;