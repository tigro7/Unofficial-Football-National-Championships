import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { fas } from "@fortawesome/free-solid-svg-icons";
import styles from "./datatable.module.css";
import { useState, useRef, useEffect } from "react";


const DataTable = ({ data, columns, keyProp, clickHandler, deleteHandler }) => {
  const tbodyRef = useRef(null);
  const [isScrollable, setIsScrollable] = useState(false);

  useEffect(() => {
    if (tbodyRef.current) {
      setIsScrollable(tbodyRef.current.scrollHeight > tbodyRef.current.clientHeight);
    }
  }, [data]);

  return (
    <table className={styles.table}>
      <thead>
        <tr>
          {columns.map((col, index) => (
            <th key={index}>{col.header}</th>
          ))}
          {deleteHandler && <th key="deleteHeader">Elimina</th>}
        </tr>
      </thead>
      <tbody className={`${isScrollable ? styles.scrollable : ''}`} ref={tbodyRef}>
        {data.map((item, rowIndex) => (
          <tr key={item[keyProp]} onClick={clickHandler ? () => clickHandler(item) : ''}>
            {columns.map((col, colIndex) => <td key={colIndex} className={col.className(item) || ''}>{col.render(item)}</td>)}
            {deleteHandler &&
              <td key={rowIndex} onClick={(e) => e.stopPropagation()}>
                <button onClick={() => deleteHandler(item)} className={styles.button}>
                  <FontAwesomeIcon className={styles.icon} icon={fas.faTrashCan}/>
                </button>
              </td>
            }
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default DataTable;
