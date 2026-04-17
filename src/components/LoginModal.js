import React from "react";
import Modal from "react-modal";
import Login from "../pages/Login";

Modal.setAppElement("#root");

export default function LoginModal({ isOpen, onClose, onSwitchToRegister }) {
  return (
    <>
      <style>
        {`
          /* Overlay */
          .login-overlay {
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

          /* Modal container */
          .login-modal {
            position: relative;
            outline: none;
            border: none;
            background: transparent;
            display: flex;
            justify-content: center;
            align-items: center;
            width: auto;
          }

          /* Inner modal box */
          .login-modal-inner {
            background: #fff;
            border-radius: 18px;
            padding: 45px;
            width: 100%;
            max-width: 500px; /* ✅ Wider box */
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
            position: relative;
            z-index: 10000;
            animation: fadeIn 0.25s ease-in-out;
          }

          /* Close button (X) */
         .close-btn {
  all: unset; /* ✅ Reset all inherited styles */
  position: absolute;
  top: 16px;
  right: 22px;
  font-size: 26px;
  cursor: pointer;
  color: #333;
  font-weight: bold;
  line-height: 1;
  transition: color 0.2s ease;
  z-index: 10001;
}

.close-btn:hover {
  color: red;
}


          /* Fade animation */
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
        className="login-modal"
        overlayClassName="login-overlay"
        shouldCloseOnOverlayClick={true}
      >
        <div className="login-modal-inner">
          <button className="close-btn" onClick={onClose}>
            ×
          </button>

          <Login
            onSwitchToRegister={() => {
              onClose();
              if (onSwitchToRegister) onSwitchToRegister();
            }}
          />
        </div>
      </Modal>
    </>
  );
}
