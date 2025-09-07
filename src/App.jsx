import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useEffect } from "react";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import RecordForm from "./pages/RecordForm";
import RecordView from "./pages/RecordView";

/* --- ScrollToTop --- */
function ScrollToTop() {
    const { pathname } = useLocation();
    useEffect(() => {
        window.scrollTo(0, 0);
    }, [pathname]);
    return null;
}

/* --- Guard --- */
function ProtectedRoute({ children }) {
    const key = sessionStorage.getItem("nursia_access_key");
    if (!key) return <Navigate to="/login" replace/>;
    return children;
}

/* --- Layout com Navbar/Footer (oculta no /login) --- */
function Layout({ children }) {
    const location = useLocation();
    const hideLayout = location.pathname === "/login";

    return (
        <div className="min-h-screen bg-white text-gray-900 flex flex-col">
            {!hideLayout && <Navbar/>}
            <main className={!hideLayout ? "pt-20 flex-1" : "flex-1"}>{children}</main>
            {!hideLayout && <Footer/>}
        </div>
    );
}

export default function App() {
    return (
        <BrowserRouter>
            <ScrollToTop/>
            <Layout>
                <Routes>
                    {/* Público */}
                    <Route path="/login" element={<Login/>}/>

                    {/* Protegidas */}
                    <Route
                        path="/"
                        element={
                            <ProtectedRoute>
                                <Navigate to="/dashboard" replace/>
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

                    {/* Criar prontuário (wizard com drafts) */}
                    <Route
                        path="/records/new"
                        element={
                            <ProtectedRoute>
                                <RecordForm mode="create"/>
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/records/new/:draftId"
                        element={
                            <ProtectedRoute>
                                <RecordForm mode="create"/>
                            </ProtectedRoute>
                        }
                    />

                    {/* Visualizar prontuário */}
                    <Route
                        path="/records/:id"
                        element={
                            <ProtectedRoute>
                                <RecordView/>
                            </ProtectedRoute>
                        }
                    />

                    {/* Editar prontuário (modo edição + drafts) */}
                    <Route
                        path="/records/:id/edit"
                        element={
                            <ProtectedRoute>
                                <RecordForm mode="edit"/>
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/records/:id/edit/:draftId"
                        element={
                            <ProtectedRoute>
                                <RecordForm mode="edit"/>
                            </ProtectedRoute>
                        }
                    />

                    {/* Fallback */}
                    <Route path="*" element={<Navigate to="/dashboard" replace/>}/>
                </Routes>
            </Layout>
        </BrowserRouter>
    );
}
