/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/exhaustive-deps */

import { useState, useEffect, useCallback, Suspense } from 'react';
import DataTable from '../DataTable';
import DataChanger from '../DataChanger';
import TableFooter from '../TableFooter';
import useTable from "@/app/hooks/useTable";
import useFetch from "@/app/hooks/useFetch";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { fas } from "@fortawesome/free-solid-svg-icons";
import { utils, writeFile } from 'xlsx';
import styles from "./DataViewer.module.css";
import Loading from '@/app/loading';
import { ErrorBoundary } from 'next/dist/client/components/error-boundary';
import Error from 'next/error';
import "./datetimepicker.css";

const DataViewer = ({url, dataProps, itemsPerPage = 25, keyProp, keyProps = ["key"], refreshInterval = 0, randomRefresher = 0, crud = "R", clickHandler = (_event) => {}, children}) => {

  const {data, setData, loading, error} = useFetch(url, refreshInterval, randomRefresher);
  const [relatedDataLoaded, setRelatedDataLoaded] = useState(false);
  const [sortState, setSort] = useState('none');
  const [sortField, setSortField] = useState(keyProp);
  const [filterField, setFilterField] = useState([]);
  const [filterState, setFilter] = useState('');
  const [filteredData, setFilteredData] = useState(data);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState("C");
  const [modalData, setModalData] = useState({});
  const [updatingItem, setUpdatingItem] = useState({});
  const [originalKey, setOriginalKey] = useState(null);
  const [columns, setColumns] = useState([]);

  const fetchNestedData = async (item, url) => {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Error in fetchNestedData ${response.status}: ${response.statusText}`);
      }
      return await response.json();
    }catch (error){
      console.error(`Error fetching data for ${item}:`, error);
      throw error;
    }
  };

  useEffect(() => {
      const fetchRelatedData = async () => {
          try {
              // Create a copy of data to avoid mutating state directly
              const updatedData = [];

              for (const item of data){                      
                const updatedItem = { ...item };

                for (const prop of dataProps.filter(dataProp => dataProp.type === 'Object' && dataProp.apiEndpoint)) {
                    const data = await fetchNestedData(prop, `${prop.apiEndpoint}/${item[keyProp]}`);
                    updatedItem[prop.key] = data;
                }

                updatedData.push(updatedItem);
              }

              setData(updatedData); // Set the data with related fields included
              setRelatedDataLoaded(true); // Mark related data as loaded
          } catch (error) {
              console.error("Errore fetching related data:", error);
          }
      };

      if (data.length > 0 && !relatedDataLoaded) {
          fetchRelatedData(); // Call the async function
      }
  }, [data, dataProps, keyProp, relatedDataLoaded]); // Ensure all dependencies are included

  useEffect(() => {
    const filterMethod = (o) => {
      return filterField.length > 0 
      ? filterField.some(entry => {
        // Trova la colonna corrispondente alla chiave specificata in filterField
        const column = columns.find(col => col.key === entry);
        const rawValue = o[entry];
        const renderedValue = column?.render ? column.render(o) : rawValue;
        return String(renderedValue).toLowerCase().includes(filterState.toLowerCase());
      })
      // Filtra su tutte le colonne, incluse quelle con il render
      : columns.some(col => {
        const rawValue = o[col.key];
        const renderedValue = col.render ? col.render(o) : rawValue;
        return String(renderedValue).toLowerCase().includes(filterState.toLowerCase());
      });
    };
    
    const filteredData = filterState == 'none' ? data : data.filter(filterMethod);
    const sortMethods = {
      none: { method: (a, b) => dynamicSort(a[keyProp],b[keyProp])},
      asc: { method: (a, b) => dynamicSort(a[sortField],b[sortField])},
      desc: { method: (a, b) => dynamicSort(b[sortField],a[sortField])},
    };
    const sorted = [...filteredData].sort(sortMethods[sortState].method);
    setFilteredData(sorted);
  }, [filterState, filterField.length, data, sortState]);

  useEffect(() => {
    //prepara dati per passarli a datatable
    setColumns(Object.keys(dataProps).map((index) => ({
      //crea header per tabella con nome e controlli per filtro e ordinamento
      header: (
        <div>
            {dataProps[index].name}
            <button className={styles.toggleOrder} onClick={() => handleSorting(dataProps[index].key)}>
                <FontAwesomeIcon className={`${styles.icon} ${sortField.includes(dataProps[index].key) ? styles.active : ''}`} 
                  icon={sortField.includes(dataProps[index].key) ? (sortState.includes('asc') ? fas.faChevronUp : fas.faChevronDown) : fas.faChevronDown} 
                />
            </button>
            <button className={styles.toggleFilter} onClick={() => handleFilteringField(dataProps[index].key)}>
                <FontAwesomeIcon className={`${styles.icon} ${filterField.includes(dataProps[index].key) ? styles.active : ''}`} icon={fas.faFilter} />
            </button>
        </div>
      ),
      //se esiste nei dati una funzione di render, chiama quella, passandogli l'elemento, altrimenti restituisce il valore dell'elemento
      render: dataProps[index].render ? item => dataProps[index].render(item) : item => renderValue(item, dataProps[index].key),
      //per la gestione dei moduli css, se esiste className (che è una funzione), gli passa l'elemento e riceve indietro il nome della classe, altrimenti la stringa vuota
      className: dataProps[index].className ? item => dataProps[index].className(item) : _item => '',
      //il valore dell'elemento
      key: dataProps[index].key
    })));

  }, [dataProps]);

  const [rows, setRows] = useState(itemsPerPage);
  const [page, setPage] = useState(1);
  const { slice, range } = useTable(filteredData, page, rows);

  const insertRecord = () => {
    setModalType("C");
    setModalOpen(true);
  }

  const updateRecord = (item) => {
    setModalType("U");
    //open modal
    setModalOpen(true);
    //insert data
    setOriginalKey(buildKeyString(item));
    setModalData(item);
    setUpdatingItem(item);
  }

  const deleteRecord = (item) => {
    setModalType("D");
    //open confirm modal
    setModalOpen(true);
    //delete data
    setModalData(item);
  }

  const handleInsertedData = (newData) => {
    setData(prevData => prevData ? [...prevData, newData] : [newData]);
  }

  const handleUpdatedData = (updatedItem) => {
    setData(prevData => prevData.map(dataItem => JSON.stringify(dataItem) === JSON.stringify(updatingItem) ? updatedItem : dataItem));
  }

  const handleDeletedData = (deletedItem) => {
    setData(prevData => prevData.filter(dataItem => JSON.stringify(dataItem) !== JSON.stringify(deletedItem)));
  }

  const dynamicSort = (a, b) => {
    if (typeof a === 'string' && typeof b === 'string') {
        return a.localeCompare(b);
    } else if (typeof a === 'number' && typeof b === 'number') {
        return a - b;
    } else {
        // In caso di dati misti o valori nulli/undefined
        return String(a).localeCompare(String(b));
    }
  }

  const handleSorting = (field) => {
    if (sortState == 'none'){
        setSortField(field);
        setSort('desc');
    }else if (sortState == 'desc'){
        setSortField(field);
        setSort('asc');
    }else if (sortState == 'asc'){
        setSortField(keyProp);
        setSort('none');
    }
  }

  const handleFiltering = (e) => {
    setFilter(e.target.value);
  }

  const handleFilteringField = (field) => {
    let helper = [...filterField];
    if (filterField.includes(field)){
        helper = filterField.filter((a) => (a != field));
    }else{            
        helper.push(field);
    }
    setFilterField(helper);
  }

  const exportFile = useCallback(() => {
    const ws = utils.json_to_sheet(filteredData);
    const wb = utils.book_new();
    utils.book_append_sheet(wb, ws, "Data");
    writeFile(wb, `Export_File.xlsx`);
  }, [filteredData]);

  // Funzione per ottenere la url
  const buildKeyString = (item) => {
    return keyProps.length > 0 ? keyProps.map(key => item[key]).join('/') : item[keyProp];
  };

  // Funzione per determinare se il valore è un array di relazioni
  const renderValue = (item, key) => {
    const value = item[key];    
    // Se è un array, combina i valori in una stringa
    if (Array.isArray(value)) {
      return value.map(subItem => Object.values(subItem).join(' - ')).join(', ');
    }
    
    // Se è un valore semplice, lo stampiamo direttamente
    return value;
  };

  return (
    <ErrorBoundary fallback={<Error/>}>
      <Suspense fallback={<Loading/>}>
        <DataChanger 
          url={url} modalData={modalData} originalKey={originalKey} keyProp={buildKeyString}
          handleInsertedData={handleInsertedData} handleUpdatedData={handleUpdatedData} handleDeletedData={handleDeletedData}
          modalOpen={modalOpen} modalType={modalType} setModalData={setModalData} setModalOpen={setModalOpen} dataProps={dataProps} 
        />
        <div className={styles.tableControls}>   
          {children}
          <span>Totale: {data.length}</span>
          <span>Mostra</span>
          <select className={styles.range} onChange={e => setRows(e.target.value)} value={rows} name='pageRange'>
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
          <span>righe.</span>

          <input type='search' onChange={handleFiltering} value={filterState} placeholder='Filtra cliccando sulle icone nelle intestazioni delle colonne' 
            className={styles.filter} name='recordFilter'/>
          {
            crud.includes("C") &&
            <button onClick={insertRecord}>
              <FontAwesomeIcon className={styles.icon} icon={fas.faPlus} />
            </button>
          }
          <button onClick={exportFile}>
            <FontAwesomeIcon className={styles.icon} icon={fas.faFileExcel} />
          </button>
        </div>
        <div className={styles.tableContainer}>
          <DataTable data={slice} columns={columns} keyProp={keyProp} clickHandler={crud.includes("U") ? updateRecord : clickHandler} deleteHandler={crud.includes("D") ? deleteRecord : null}/>
          <TableFooter range={range} slice={slice} setPage={setPage} page={page} colspan={columns.length}/>
        </div>
      </Suspense>
    </ErrorBoundary>
  );
}

export default DataViewer;
