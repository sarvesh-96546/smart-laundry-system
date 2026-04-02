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
  const { user, logout } = useApp();
  return (
    <>
      <div className="fixed top-0 right-0 z-9999 bg-[#111]/90 text-white p-2 flex items-center gap-4 border border-white/10 rounded-bl-xl text-xs backdrop-blur-md shadow-lg">
        {user ? (
          <>
            <span className="text-primary font-semibold">[{user.role.toUpperCase()}] {user.name}</span>
            <button onClick={logout} className="text-red-400 hover:text-red-300 font-bold">Logout</button>
            <div className="h-4 w-px bg-white/10 mx-1"></div>
            <Link to="/" className="text-slate-400 hover:text-white">Home</Link>
            {user.role === 'admin' && (
              <>
                <Link to="/admin" className="text-primary hover:text-white">Dashboard</Link>
                <Link to="/admin/users" className="text-primary hover:text-white">Users</Link>
              </>
            )}
            {(user.role === 'admin' || user.role === 'staff') && (
              <Link to="/staff" className="text-yellow-400 hover:text-white">Staff Panel</Link>
            )}
          </>
        ) : (
          <Link to="/login" className="text-primary hover:text-white px-2">System Login</Link>
        )}
      </div>
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
            <Route path="/admin" element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>} />
            <Route path="/admin/users" element={<ProtectedRoute allowedRoles={['admin']}><UserManagement /></ProtectedRoute>} />
            <Route path="/admin/new-order" element={<ProtectedRoute allowedRoles={['admin', 'staff']}><NewOrderPage /></ProtectedRoute>} />
            <Route path="/staff" element={<ProtectedRoute allowedRoles={['admin', 'staff']}><StaffPanel /></ProtectedRoute>} />
            <Route path="/machinery" element={<ProtectedRoute allowedRoles={['admin', 'staff']}><Machinery /></ProtectedRoute>} />
            <Route path="/customers" element={<ProtectedRoute allowedRoles={['admin', 'staff']}><CustomerNetwork /></ProtectedRoute>} />
            <Route path="/pricing" element={<ProtectedRoute allowedRoles={['admin', 'staff']}><Pricing /></ProtectedRoute>} />
            <Route path="/order/:id" element={<OrderDetails />} />
          </Routes>
          <Footer />
        </NavigationWrapper>
      </BrowserRouter>
    </AppProvider>
  );
}

export default App;
