import { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { supabase } from "./lib/supabase";
import Navbar from "./Components/Navbar";
import Footer from "./Components/Footer";
import Index from "./Components/Index";
import Services from "./Components/Services";
import Pricing from "./Components/Pricing";
import ContactUs from "./Components/Contact-us";
import AuthPage from "./Components/AuthPage";
import DashboardLayout from "./Components/Dashboard/DashboardLayout";
import DashboardHome from "./Components/Dashboard/DashboardHome";
import Tasks from "./Components/Dashboard/Tasks";
import Meetings from "./Components/Dashboard/Meetings";
import Email from "./Components/Dashboard/Email";
import Expenses from "./Components/Dashboard/Expenses";
import Projects from "./Components/Dashboard/Projects";
import Team from "./Components/Dashboard/Team";
import AI from "./Components/Dashboard/AI";
import Settings from "./Components/Dashboard/Settings";
import SyncComponent from "./Components/Dashboard/Sync";
import AnalyticsDashboard from "./Components/Dashboard/AnalyticsDashboard";
import Reports from "./Components/Dashboard/Reports";
import { Toaster } from "react-hot-toast";


export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user || null);
      setLoading(false);
    };

    getSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user || null);
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  // Loading component
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <Toaster position="top-right" />
      <Routes>
        {/* Public Routes (with Navbar & Footer) */}
        <Route path="/" element={
          <>
            <Navbar />
            <Index />
            <Footer />
          </>
        } />
        <Route path="/services" element={
          <>
            <Navbar />
            <Services />
            <Footer />
          </>
        } />
        <Route path="/pricing" element={
          <>
            <Navbar />
            <Pricing />
            <Footer />
          </>
        } />
        <Route path="/contact" element={
          <>
            <Navbar />
            <ContactUs />
            <Footer />
          </>
        } />
        <Route path="/auth" element={
          user ? <Navigate to="/dashboard" /> : <AuthPage />
        } />
        <Route path="/login" element={<Navigate to="/auth" />} />

        {/* Protected Dashboard Routes */}
        <Route path="/dashboard" element={
          user ? <DashboardLayout /> : <Navigate to="/auth" />
        }>
          <Route index element={<DashboardHome />} />
          <Route path="tasks" element={<Tasks />} />
          <Route path="meetings" element={<Meetings />} />
          <Route path="email" element={<Email />} />
          <Route path="expenses" element={<Expenses />} />
          <Route path="projects" element={<Projects />} />
          <Route path="team" element={<Team />} />
          <Route path="ai" element={<AI />} />
          <Route path="settings" element={<Settings />} /> 
          <Route path="sync" element={<SyncComponent />} />
          <Route path="analytics" element={<AnalyticsDashboard />} />
          <Route path="reports" element={<Reports />} />
        </Route>

        {/* Catch all */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}
  