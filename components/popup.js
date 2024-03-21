import React from "react";

const Popup = ({ open, closeOnDocumentClick, onClose, children }) => {
  if (!open) return null;

  return (
    <div className="popup">
      <div className="popup-inner">
        {closeOnDocumentClick && (
          <div
            className="popup-background"
            onClick={onClose}
            style={{ position: "fixed", top: 0, right: 0, bottom: 0, left: 0 }}
          />
        )}
        <button className="close" onClick={onClose}>
          &times;
        </button>
        {children}
      </div>
    </div>
  );
};

export default Popup;
