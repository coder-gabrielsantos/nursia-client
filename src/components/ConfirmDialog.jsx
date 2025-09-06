import { AlertTriangle, Info } from "lucide-react";
import Modal from "./Modal";

export default function ConfirmDialog({
                                          open,
                                          title = "Are you sure?",
                                          message,
                                          confirmText = "Confirm",
                                          cancelText = "Cancel",
                                          variant = "danger", // 'danger' | 'info'
                                          loading = false,
                                          onConfirm,
                                          onClose,
                                      }) {
    const isDanger = variant === "danger";
    return (
        <Modal open={open} onClose={loading ? undefined : onClose}>
            <div className="p-5">
                <div
                    className={[
                        "mb-3 inline-flex items-center gap-2 rounded-lg border px-2.5 py-1.5 text-sm",
                        isDanger
                            ? "border-rose-200 bg-rose-50 text-rose-700"
                            : "border-blue-200 bg-blue-50 text-blue-700",
                    ].join(" ")}
                >
                    {isDanger ? <AlertTriangle size={16}/> : <Info size={16}/>}
                    <span className="font-medium">{title}</span>
                </div>

                {message && <p className="text-sm text-gray-700">{message}</p>}

                <div className="mt-5 flex justify-end gap-2">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={loading}
                        className="cursor-pointer h-9 rounded-lg border border-gray-300 bg-white px-3 text-sm font-medium text-gray-800 hover:bg-gray-50 disabled:opacity-60"
                    >
                        {cancelText}
                    </button>
                    <button
                        type="button"
                        onClick={onConfirm}
                        disabled={loading}
                        className={[
                            "cursor-pointer h-9 rounded-lg px-3 text-sm font-medium text-white disabled:opacity-60",
                            isDanger
                                ? "bg-rose-600 hover:bg-rose-700"
                                : "bg-blue-600 hover:bg-blue-700",
                        ].join(" ")}
                    >
                        {loading ? "Please wait..." : confirmText}
                    </button>
                </div>
            </div>
        </Modal>
    );
}
