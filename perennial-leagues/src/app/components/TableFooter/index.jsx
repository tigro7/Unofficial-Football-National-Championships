import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { fas } from '@fortawesome/free-solid-svg-icons';

import styles from "./TableFooter.module.css";

const TableFooter = ({ range, setPage, page, slice}) => {

  const [searchPage, setSearchpage] = useState(page);

  const handleSearchpage = (e) => {
    setSearchpage(parseInt(e.target.value));
  };

  const handleSetPage = (pageSelected) => {
    if ((pageSelected > 0) && pageSelected <= range.length){
      setPage(pageSelected);
    }
  };

  useEffect(() => {
    if (slice.length < 1 && page !== 1) {
      setPage(page - 1);
    }
    setSearchpage(page);
  }, [slice, page, setPage]);

  return (
    <div className={styles.tableFooter}>
      <button key='previousPage' className={styles.button} onClick={() => handleSetPage(page - 1)}>
        <FontAwesomeIcon icon={fas.faArrowLeft} />
        {' '}
        Precedente
      </button>
      {
        range.length == 0 
        ?
          ''
        : 
        <button key='firstPage' className={`${styles.button} ${page === 1 ? styles.activeButton : styles.inactiveButton}`} onClick={() => setPage(1)}>
          1
        </button>
      }
      {
        range.length >= 4 && page > 4
        ?
        <button key='firstEllipsis' className={`${styles.button} ${styles.inactiveButton}`} disabled={true}>
          ...
        </button>
        :
          ''
      }
      {range.map((el, index) => {
        if ((el >= (page - 2) && el <= (page + 2)) && el != 1 && el != range.length){
          return(
            <button key={index} className={`${styles.button} ${page === el ? styles.activeButton : styles.inactiveButton}`} onClick={() => setPage(el)}>
              {el}
            </button>
          );
        }
        return null; // Return null to avoid the warning when using map
      })}
      {
        range.length >= 4 && page < range.length - 3
        ?
        <button key='secondEllipsis' className={`${styles.button} ${styles.inactiveButton}`} disabled={true}>
          ...
        </button>
        :
          ''
      }
      {
        range.length == 1 
        ?
          ''
        : 
        <button key='lastPage' className={`${styles.button} ${page === range.length ? styles.activeButton : styles.inactiveButton}`} onClick={() => setPage(range.length)}>
          {range.length}
        </button>
      }
      <button key='nextPage' className={styles.button} onClick={() => handleSetPage(page + 1)}>
        Successiva
        {' '}
        <FontAwesomeIcon icon={fas.faArrowRight} />
      </button>
      <input type='number' min={range.length == 0 ? 0 : 1} max={range.length} className={styles.searchPage} onChange={handleSearchpage}
       value={range.length == 0 ? 0 : searchPage} name="pageSelector"/>
      <button key='searchPage' className={styles.searchPageButton} onClick={() => setPage(searchPage)}>
        <FontAwesomeIcon icon={fas.faSearch} />
      </button>
    </div>
  );
};

export default TableFooter;