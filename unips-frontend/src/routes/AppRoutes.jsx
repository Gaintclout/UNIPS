import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { useEffect, useState } from "react";

import Login from "../pages/Login"
import Register from "../pages/Register"
import Dashboard from "../pages/Dashboard"
import Forecast from "../pages/Forecast"
import Alerts from "../pages/Alerts"
import Analytics from "../pages/Analytics"
import Reports from "../pages/Reports"
import Settings from "../pages/Settings"
import MainLayout from "../layouts/MainLayout";
import {
    INACTIVITY_TIMEOUT_MS,
    clearSession,
    isAuthenticated,
    isSessionExpired,
    refreshActivity,
} from "../services/session";

function ProtectedRoute({ children }) {
    if (!isAuthenticated()) {
        return <Navigate to="/" replace />;
    }

    return <MainLayout>{children}</MainLayout>;
}

function AppRoutes(){
    const [, setSessionTick] = useState(0);

    useEffect(() => {
        const activityEvents = ["click", "keydown", "mousemove", "scroll", "touchstart"];

        function handleActivity() {
            if (isAuthenticated()) {
                refreshActivity();
            }
        }

        function checkExpiry() {
            if (isSessionExpired()) {
                clearSession();
                setSessionTick((value) => value + 1);
            }
        }

        activityEvents.forEach((eventName) => {
            window.addEventListener(eventName, handleActivity, { passive: true });
        });

        const intervalId = window.setInterval(checkExpiry, 60 * 1000);
        const timeoutId = window.setTimeout(checkExpiry, INACTIVITY_TIMEOUT_MS);

        return () => {
            activityEvents.forEach((eventName) => {
                window.removeEventListener(eventName, handleActivity);
            });
            window.clearInterval(intervalId);
            window.clearTimeout(timeoutId);
        };
    }, []);

    return(<BrowserRouter>
    <Routes>
        <Route path="/" element={<Login/>}/>
        <Route path="/register" element={<Register/>}/>
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard/></ProtectedRoute>}/>
        <Route path="/forecast" element={<ProtectedRoute><Forecast/></ProtectedRoute>}/>
        <Route path="/alerts" element={<ProtectedRoute><Alerts/></ProtectedRoute>}/>
        <Route path="/analytics" element={<ProtectedRoute><Analytics/></ProtectedRoute>}/>
        <Route path="/reports" element={<ProtectedRoute><Reports/></ProtectedRoute>}/>
        <Route path="/settings" element={<ProtectedRoute><Settings/></ProtectedRoute>}/>
        <Route path="*" element={<Navigate to="/dashboard" replace />}/>
    </Routes>
    </BrowserRouter>
    )
}

export default AppRoutes;
