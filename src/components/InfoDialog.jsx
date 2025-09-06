import Modal from "./Modal";
import { CheckCircle2, Info } from "lucide-react";

export default function InfoDialog({
                                       open,
                                       onClose,
                                       title = "Tudo certo!",
                                       message,
                                       okText = "Ok",
                                       variant = "success", // 'success' | 'info'
                                   }) {
    const isSuccess = variant === "success";
    return (
        <Modal open={open} onClose={onClose}>
            <div className="p-5">
                <div
                    className={[
                        "mb-3 inline-flex items-center gap-2 rounded-lg border px-2.5 py-1.5 text-sm",
                        isSuccess
                            ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                            : "border-blue-200 bg-blue-50 text-blue-700",
                    ].join(" ")}
                >
                    {isSuccess ? <CheckCircle2 size={16}/> : <Info size={16}/>}
                    <span className="font-medium">{title}</span>
                </div>

                {message && <p className="text-sm text-gray-700">{message}</p>}

                <div className="mt-5 flex justify-end">
                    <button
                        type="button"
                        onClick={onClose}
                        className="cursor-pointer h-9 rounded-lg bg-emerald-600 px-3 text-sm font-medium text-white hover:bg-emerald-700"
                    >
                        {okText}
                    </button>
                </div>
            </div>
        </Modal>
    );
}
