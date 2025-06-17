import { ReactNode } from "react";

type ModalPosition = "center" | "top-left" | "top-right" | "bottom-left" | "bottom-right";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  position?: ModalPosition;
  title?: string;
  className?: string;
}

const positionClasses = {
  center: "items-center justify-center",
  "top-left": "items-start justify-start",
  "top-right": "items-start justify-end", 
  "bottom-left": "items-end justify-start",
  "bottom-right": "items-end justify-end",
};

export function Modal({
  isOpen,
  onClose,
  children,
  position = "center",
  title,
  className = "",
}: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className="modal modal-open">
      <div 
        className="modal-backdrop" 
        onClick={onClose}
      />
      <div className={`fixed inset-0 flex p-4 pointer-events-none z-50 ${positionClasses[position]}`}>
        <div className={`modal-box pointer-events-auto max-w-lg w-full ${className}`}>
          {title && (
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-lg">{title}</h3>
              <button 
                className="btn btn-sm btn-circle btn-ghost"
                onClick={onClose}
              >
                ✕
              </button>
            </div>
          )}
          {!title && (
            <button 
              className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
              onClick={onClose}
            >
              ✕
            </button>
          )}
          <div className={title ? "" : "pt-8"}>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}