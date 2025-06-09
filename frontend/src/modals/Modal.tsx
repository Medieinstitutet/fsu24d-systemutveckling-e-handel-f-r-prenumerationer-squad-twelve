import React from "react";
import "../styles/modal.css";

type ModalProps = {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
};

const Modal: React.FC<ModalProps> = ({
  title,
  message,
  confirmText = "OK",
  cancelText,
  onConfirm,
  onCancel,
}) => {
  return (
    <div className="modal-backdrop">
      <div className="modal-content">
        <h3>{title}</h3>
        <p>{message}</p>
        <div className="modal-buttons">
          {onConfirm && (
            <button onClick={onConfirm}>
              {confirmText}
            </button>
          )}
          {onCancel && (
            <button onClick={onCancel}>
              {cancelText}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Modal;
