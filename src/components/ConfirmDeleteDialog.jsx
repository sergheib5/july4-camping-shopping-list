import { useEffect } from 'react';
import './ConfirmDeleteDialog.css';

const ConfirmDeleteDialog = ({
  open,
  title = 'Remove this item?',
  message = 'It will disappear from the list. You can add it again anytime.',
  detail = null,
  cancelLabel = 'Cancel',
  confirmLabel = 'Remove',
  onCancel,
  onConfirm,
}) => {
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') onCancel();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onCancel]);

  if (!open) return null;

  return (
    <div
      className="confirm-delete-dialog__backdrop"
      role="presentation"
      onClick={onCancel}
    >
      <div
        className="confirm-delete-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-delete-dialog-title"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="confirm-delete-dialog-title" className="confirm-delete-dialog__title">
          {title}
        </h2>
        {detail ? (
          <p className="confirm-delete-dialog__detail">{detail}</p>
        ) : null}
        <p className="confirm-delete-dialog__message">{message}</p>
        <div className="confirm-delete-dialog__actions">
          <button
            type="button"
            className="confirm-delete-dialog__btn confirm-delete-dialog__btn--secondary"
            onClick={onCancel}
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            className="confirm-delete-dialog__btn confirm-delete-dialog__btn--primary"
            onClick={onConfirm}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDeleteDialog;
