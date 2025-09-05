export default function Navbar() {
    return (
        <header className="fixed top-0 left-0 right-0 z-40 border-b border-white/10 bg-gray-900/70 backdrop-blur-md">
            <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
                <div className="text-lg font-semibold tracking-tight">
                    <span className="text-white">Nursia</span>
                </div>
                <nav className="flex items-center gap-4 text-sm text-gray-300">
                    <a href="/" className="hover:text-white transition">Início</a>
                    <a href="/dashboard" className="hover:text-white transition">Dashboard</a>
                    <a href="/records" className="hover:text-white transition">Registros</a>
                </nav>
            </div>
        </header>
    );
}
