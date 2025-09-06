import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import RecordForm from "./pages/RecordForm";
import RecordView from "./pages/RecordView";

function ProtectedRoute({ children }) {
    const key = sessionStorage.getItem("nursia_access_key");
    if (!key) return <Navigate to="/login" replace />;
    return children;
}

function Layout({ children }) {
    const location = useLocation();
    const hideNavbar = location.pathname === "/login";
    return (
        <div className="min-h-screen bg-white text-gray-900">
            {!hideNavbar && <Navbar />}
            <main className={!hideNavbar ? "pt-20" : ""}>{children}</main>
        </div>
    );
}

export default function App() {
    return (
        <BrowserRouter>
            <Layout>
                <Routes>
                    {/* Público */}
                    <Route path="/login" element={<Login />} />

                    {/* Protegidas */}
                    <Route
                        path="/"
                        element={
                            <ProtectedRoute>
                                <Navigate to="/dashboard" replace />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/dashboard"
                        element={
                            <ProtectedRoute>
                                <Dashboard />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/records/new"
                        element={
                            <ProtectedRoute>
                                <RecordForm mode="create" />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/records/new/:draftId"
                        element={
                            <ProtectedRoute>
                                <RecordForm mode="create" />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/records/:id/edit"
                        element={
                            <ProtectedRoute>
                                <RecordForm mode="edit" />
                            </ProtectedRoute>
                        }
                    />
                    {/* Fallback */}
                    <Route path="*" element={<Navigate to="/dashboard" replace />} />
                    <Route path="/records/:id" element={<RecordView />} />
                </Routes>
            </Layout>
        </BrowserRouter>
    );
}
