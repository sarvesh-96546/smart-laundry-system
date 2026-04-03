import React from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { useApp } from './context/useApp';
import { Toaster } from 'react-hot-toast';

import CustomerHome from './components/CustomerHome';
import AdminDashboard from './components/AdminDashboard';
import CustomerNetwork from './components/CustomerNetwork';
import Pricing from './components/Pricing';
import Machinery from './components/Machinery';
import Login from './components/Login';
import Footer from './components/Footer';
import OrderDetails from './components/OrderDetails';
import NewOrderPage from './components/NewOrderPage';
import StaffPanel from './components/StaffPanel';
import UserManagement from './components/UserManagement';
import PrivacyCipher from './components/PrivacyCipher';
import TermsOfService from './components/TermsOfService';
import DataProtocol from './components/DataProtocol';
import SupportIntelligence from './components/SupportIntelligence';
import FabricSolutions from './components/FabricSolutions';
import ProtocolExpansion from './components/ProtocolExpansion';
import ErrorProtocol from './components/ErrorProtocol';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user } = useApp();
  if (!user) return <Login />;
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return (
      <div className="min-h-screen bg-background text-white flex flex-center items-center justify-center font-['Plus_Jakarta_Sans'] font-bold uppercase tracking-widest text-xs">
        Access Denied: Protocol Violation
      </div>
    );
  }
  return children;
};

function NavigationWrapper({ children }) {
  return (
    <>
      {children}
    </>
  );
}

function App() {
  return (
    <AppProvider>
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#111',
            color: '#fff',
            border: '1px solid rgba(143,245,255,0.1)',
            borderRadius: '16px',
            fontSize: '12px',
            fontWeight: '600',
            padding: '16px',
            boxShadow: '0 20px 50px rgba(0,0,0,0.5)'
          }
        }}
      />
      <BrowserRouter>
        <NavigationWrapper>
          <Routes>
            <Route path="/" element={<CustomerHome />} />
            <Route path="/login" element={<Login />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/admin" element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>} />
            <Route path="/admin/users" element={<ProtectedRoute allowedRoles={['admin']}><UserManagement /></ProtectedRoute>} />
            <Route path="/admin/new-order" element={<ProtectedRoute allowedRoles={['admin', 'staff', 'customer']}><NewOrderPage /></ProtectedRoute>} />
            <Route path="/staff" element={<ProtectedRoute allowedRoles={['admin', 'staff']}><StaffPanel /></ProtectedRoute>} />
            <Route path="/machinery" element={<ProtectedRoute allowedRoles={['admin', 'staff', 'customer']}><Machinery /></ProtectedRoute>} />
            <Route path="/customers" element={<ProtectedRoute allowedRoles={['admin', 'staff']}><CustomerNetwork /></ProtectedRoute>} />
            <Route path="/order/:id" element={<OrderDetails />} />
            <Route path="/privacy" element={<PrivacyCipher />} />
            <Route path="/terms" element={<TermsOfService />} />
            <Route path="/data-protocol" element={<DataProtocol />} />
            <Route path="/membership" element={<ProtocolExpansion />} />
            <Route path="/support" element={<SupportIntelligence />} />
            <Route path="/solutions" element={<FabricSolutions />} />
            <Route path="*" element={<ErrorProtocol />} />
          </Routes>
          <Footer />
        </NavigationWrapper>
      </BrowserRouter>
    </AppProvider>
  );
}

export default App;
