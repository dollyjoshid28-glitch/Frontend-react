import React from "react";
import Modal from "react-modal";
import Register from "../pages/Register";

Modal.setAppElement("#root");

export default function RegisterModal({
  isOpen,
  onClose,
  onRegisterSuccess,
  onSwitchToLogin,
}) {
  return (
    <>
      <style>
        {`
          /* Dark background overlay */
          .register-overlay {
            position: fixed !important;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.6);
            z-index: 9999;
            display: flex;
            justify-content: center;
            align-items: center;
          }

          /* Centered modal container */
          .register-modal {
            position: relative;
            outline: none;
            border: none;
            background: transparent;
            display: flex;
            justify-content: center;
            align-items: center;
            width: auto;
          }

          /* The white inner register box */
          .register-modal-inner {
            background: #fff;
            border-radius: 16px;
            padding: 35px;
            width: 100%;
            max-width: 550px; /* ✅ wider box same as login */
            box-shadow: 0 6px 30px rgba(0, 0, 0, 0.25);
            position: relative;
            z-index: 10000;
            animation: fadeIn 0.25s ease-in-out;
          }

          /* Close button "×" */
          .close-btn {
            position: absolute;
            top: 12px;
            right: 18px;
            font-size: 22px;
            background: none;
            border: none;
            cursor: pointer;
            color: #333;
            font-weight: bold;
            line-height: 1;
            transition: color 0.2s ease;
          }

          .close-btn:hover {
            color: #e63946;
          }

          /* Smooth animation */
          @keyframes fadeIn {
            from {
              opacity: 0;
              transform: translateY(-15px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
        `}
      </style>

      <Modal
        isOpen={isOpen}
        onRequestClose={onClose}
        className="register-modal"
        overlayClassName="register-overlay"
        shouldCloseOnOverlayClick={true}
      >
        <div className="register-modal-inner">
          <button className="close-btn" onClick={onClose}>
            ×
          </button>

          <Register
            onRegisterSuccess={onRegisterSuccess}
            onSwitchToLogin={() => {
              onClose();
              if (onSwitchToLogin) onSwitchToLogin();
            }}
          />
        </div>
      </Modal>
    </>
  );
}
