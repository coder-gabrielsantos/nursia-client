import { useEffect } from "react";
import { createPortal } from "react-dom";

export default function Modal({ open, onClose, children }) {
    useEffect(() => {
        if (!open) return;
        const onKey = (e) => e.key === "Escape" && onClose?.();
        document.addEventListener("keydown", onKey);
        // travar scroll de fundo
        const prev = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        return () => {
            document.removeEventListener("keydown", onKey);
            document.body.style.overflow = prev;
        };
    }, [open, onClose]);

    if (!open) return null;

    return createPortal(
        <div
            className="fixed inset-0 z-[100] flex items-center justify-center p-4"
            onClick={onClose}
            aria-hidden="true"
        >
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm"/>
            <div
                role="dialog"
                aria-modal="true"
                onClick={(e) => e.stopPropagation()}
                className="relative w-full max-w-md rounded-2xl bg-white shadow-xl ring-1 ring-black/5"
            >
                {children}
            </div>
        </div>,
        document.body
    );
}
