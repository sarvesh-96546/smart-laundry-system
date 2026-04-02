import React, { useState, useEffect, useCallback } from 'react';
import { io } from 'socket.io-client';
import toast, { Toaster } from 'react-hot-toast';
import { authClient, useSession } from '../lib/auth-client';

const API_BASE_URL = import.meta.env.VITE_API_URL || "";

import { AppContext } from './useApp';

export const AppProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [socket, setSocket] = useState(null);
  const [stats, setStats] = useState({
    revenue: 0,
    in_progress: 0,
    ready: 0,
    total_orders: 0,
    chart_data: []
  });

  const getAuthHeaders = useCallback(() => {
    return {
      'Content-Type': 'application/json'
    };
  }, []);

  const fetchCustomers = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/customers`, {
        credentials: 'include'
      });
      const data = await res.json();
      setCustomers(data);
    } catch { /* empty */ }
  }, []);

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/stats`, { 
        headers: getAuthHeaders(),
        credentials: 'include'
      });
      if (!res.ok) return;
      const data = await res.json();
      if (data && data.revenue !== undefined) {
        setStats(data);
      }
    } catch { /* empty */ }
  }, [getAuthHeaders]);

  const fetchOrders = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/orders`, { 
        headers: getAuthHeaders(),
        credentials: 'include'
      });
      if (!res.ok) return;
      const data = await res.json();
      if (!Array.isArray(data)) return;
      setOrders(data.map(o => ({
        id: o.id,
        customer: o.customer_name,
        service: o.service_type || 'General',
        type: o.items_count > 1 ? 'Mixed' : 'Single',
        status: o.status,
        amount: o.amount
      })));
    } catch { /* empty */ }
  }, [getAuthHeaders]);

  const [machines, setMachines] = useState([]);

  const fetchMachinery = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/machinery`, { 
        headers: getAuthHeaders(),
        credentials: 'include'
      });
      if (!res.ok) return;
      const data = await res.json();
      if (Array.isArray(data)) setMachines(data);
    } catch { /* empty */ }
  }, [getAuthHeaders]);

  const startMachineCycle = async (machineId, orderId, duration = 30) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/machines/${machineId}/start`, {
        method: 'POST',
        headers: getAuthHeaders(),
        credentials: 'include',
        body: JSON.stringify({ order_id: orderId, duration })
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`Cycle initiated for Machine ${machineId}`);
        fetchMachinery();
        fetchOrders();
      }
    } catch {
      toast.error('Cycle initiation failed');
    }
  };

  const stopMachineCycle = async (machineId) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/machines/${machineId}/stop`, {
        method: 'POST',
        headers: getAuthHeaders(),
        credentials: 'include'
      });
      const data = await res.json();
      if (data.success) {
        fetchMachinery();
        fetchOrders();
        fetchStats();
      }
    } catch {
      toast.error('Manual override failed');
    }
  };

  useEffect(() => {
    const newSocket = io(API_BASE_URL);
    setSocket(newSocket);

    newSocket.on('connected', () => {});

    newSocket.on('new_order', (data) => {
      toast.success(`New ${data.priority} Protocol: ${data.order_id}`, {
        style: { border: data.priority === 'VIP' ? '2px solid #ffd700' : '1px solid rgba(143,245,255,0.1)' }
      });
      fetchOrders();
      fetchStats();
      fetchCustomers();
    });

    newSocket.on('status_update', () => {
      fetchOrders();
      fetchStats();
    });

    newSocket.on('machine_update', () => {
      fetchMachinery();
    });

    newSocket.on('notification', (data) => {
      toast(data.message, { icon: '🔔', duration: 5000 });
    });

    return () => newSocket.disconnect();
  }, [fetchStats, fetchOrders, fetchCustomers, fetchMachinery]);

  useEffect(() => {
    fetchStats();
    fetchMachinery();
    if (user) {
      fetchOrders();
      fetchCustomers();
    }
  }, [user, fetchStats, fetchOrders, fetchCustomers, fetchMachinery]);

  const [prices, setPrices] = useState({
    base: 40,
    dryClean: 150,
    ironing: 20,
    steamPress: 50
  });

  const { data: sessionData, isPending: isSessionPending } = useSession();

  useEffect(() => {
    if (sessionData?.user) {
      setUser({
        id: sessionData.user.id,
        email: sessionData.user.email,
        name: sessionData.user.name,
        role: sessionData.user.role || 'customer',
        phone_number: sessionData.user.phone_number || null,
        image: sessionData.user.image
      });
      localStorage.setItem('user', JSON.stringify(sessionData.user));
    } else if (!isSessionPending) {
      setUser(null);
      localStorage.removeItem('user');
    }
  }, [sessionData, isSessionPending]);

  const login = async (email, password) => {
    try {
      const { data, error } = await authClient.signIn.email({ 
        email, 
        password,
        callbackURL: window.location.origin
      });
      
      if (error) {
        toast.error(error.message || 'Login failed');
        return null;
      }

      if (data?.user) {
        toast.success(`Welcome back, ${data.user.name}!`);
        return data.user;
      }
      return null;
    } catch {
      toast.error('Connection to auth server failed');
      return null;
    }
  };

  const logout = async () => {
    await authClient.signOut();
    setUser(null);
    localStorage.removeItem('user');
    toast.success('System disconnected cleanly');
  };

  const createOrder = async (orderData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/orders`, {
        method: 'POST',
        headers: getAuthHeaders(),
        credentials: 'include',
        body: JSON.stringify(orderData),
      });
      const data = await response.json();

      if (response.ok && data.success) {
        fetchOrders();
        fetchStats();
        toast.success('Order created successfully!');
        return data.order;
      }
      
      const errorMessage = data.error || data.message || 'Mission Critical: Order Creation Failed';
      toast.error(errorMessage);
      throw new Error(errorMessage);
    } catch (err) {
      if (!err.message.includes('Mission')) {
        toast.error('System Connectivity Error: Please check your network');
      }
      throw err;
    }
  };

  const toggleMachineStatus = () => {
    toast('Use Start/Stop for mission-critical cycles', { icon: '⚠️' });
  };

  const deleteCustomer = (id) => {
    setCustomers(prev => prev.filter(c => c.id !== id));
  };

  return (
    <AppContext.Provider value={{
      user, orders, customers, stats, machines, prices, API_BASE_URL, socket,
      getAuthHeaders,
      setOrders, setCustomers, setMachines, setPrices,
      login, logout, toggleMachineStatus, deleteCustomer, createOrder,
      fetchStats, fetchOrders, fetchCustomers, fetchMachinery,
      startMachineCycle, stopMachineCycle
    }}>
      {children}
    </AppContext.Provider>
  );
};
