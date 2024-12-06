import styles from "./modal.module.css";

const Modal = ({ isOpen, children, modalTitle, /*onClose, submitText = 'Close'*/ }) => {
  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modal}>
        <div className={styles.modalHeader}>
          <h2>{modalTitle}</h2>
        </div>
        <div className={styles.modalBody}>
          <div className={styles.modalContent}>{children}</div>
        </div>
        {/*
        <div className={styles.modalFooter}>
          <button className={styles.button} onClick={onClose}>
            {submitText}
          </button>
        </div>
        */}
      </div>
    </div>
  );
};

export default Modal;
