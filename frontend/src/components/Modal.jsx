import "./Modal.css";

function Modal({ isOpen, title, children, onConfirm, onCancel }) {

    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
        <div className="modal-box">

            <h3 className="modal-title">{title}</h3>

            <div className="modal-content">
            {children}
            </div>

            <div className="modal-buttons">
            <button className="btn-cancel" onClick={onCancel}>
                Cancelar
            </button>

            <button className="btn-confirm" onClick={onConfirm}>
                Confirmar
            </button>
            </div>

        </div>
        </div>
    );
}

export default Modal;