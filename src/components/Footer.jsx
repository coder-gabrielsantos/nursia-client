export default function Footer() {
    return (
        <footer className="border-t border-gray-200 bg-white">
            <div className="mx-auto max-w-6xl px-6 py-6 text-center text-sm text-gray-500">
                <p>
                    © {new Date().getFullYear()}{" "}
                    <span className="font-semibold text-gray-700">Nursia</span>.
                    Apoio ao cuidado em enfermagem.
                </p>
            </div>
        </footer>
    );
}
