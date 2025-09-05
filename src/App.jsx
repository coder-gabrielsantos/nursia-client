import { BrowserRouter, Routes, Route, useLocation, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import Login from "./pages/Login";

// telas placeholder
function Dashboard() {
    return <div className="pt-24 mx-auto max-w-6xl p-4">Bem-vindo à Nursia 👋</div>;
}

function RecordsList() {
    return <div className="pt-24 mx-auto max-w-6xl p-4">Lista de registros</div>;
}

function Layout({ children }) {
    const location = useLocation();
    const hideNavbar = location.pathname === "/login";
    return (
        <div className="min-h-screen bg-gray-950 text-gray-100">
            {!hideNavbar && <Navbar/>}
            {children}
        </div>
    );
}

function ProtectedRoute({ children }) {
    const key = sessionStorage.getItem("nursia_access_key");
    if (!key) return <Navigate to="/login" replace/>;
    return children;
}

export default function App() {
    return (
        <BrowserRouter>
            <Layout>
                <Routes>
                    <Route path="/login" element={<Login/>}/>
                    <Route
                        path="/"
                        element={
                            <ProtectedRoute>
                                <Dashboard/>
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/dashboard"
                        element={
                            <ProtectedRoute>
                                <Dashboard/>
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/records"
                        element={
                            <ProtectedRoute>
                                <RecordsList/>
                            </ProtectedRoute>
                        }
                    />
                    <Route path="*" element={<Navigate to="/" replace/>}/>
                </Routes>
            </Layout>
        </BrowserRouter>
    );
}
