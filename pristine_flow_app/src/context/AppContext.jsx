import React, { useState, useEffect, useCallback } from 'react';
import { io } from 'socket.io-client';
import toast, { Toaster } from 'react-hot-toast';
import { supabase } from '../lib/supabase';
import { authClient, useSession } from '../lib/auth-client';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

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
    const headers = {
      'Content-Type': 'application/json'
    };
    const token = localStorage.getItem('token');
    if (token) headers['Authorization'] = `Bearer ${token}`;
    return headers;
  }, []);

  const fetchCustomers = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/customers`);
      const data = await res.json();
      setCustomers(data);
    } catch (err) {
      console.error('Fetch customers error:', err);
    }
  }, []);

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/stats`, { headers: getAuthHeaders() });
      if (!res.ok) return;
      const data = await res.json();
      if (data && data.revenue !== undefined) {
        setStats(data);
      }
    } catch (err) {
      console.error('Stats fetch error:', err);
    }
  }, [getAuthHeaders]);

  const fetchOrders = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/orders`, { headers: getAuthHeaders() });
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
    } catch (err) {
      console.error('Fetch orders error:', err);
    }
  }, [getAuthHeaders]);

  const [machines, setMachines] = useState([]);

  const fetchMachinery = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/machinery`, { headers: getAuthHeaders() });
      if (!res.ok) return;
      const data = await res.json();
      if (Array.isArray(data)) setMachines(data);
    } catch (err) {
      console.error('Fetch machinery error:', err);
    }
  }, [getAuthHeaders]);

  const startMachineCycle = async (machineId, orderId, duration = 30) => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/machines/${machineId}/start`, {
        method: 'POST',
        headers: getAuthHeaders(),
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
        headers: getAuthHeaders()
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

    newSocket.on('connected', (data) => console.log('Socket connected:', data));

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
    fetchOrders();
    fetchCustomers();
    fetchMachinery();
  }, [fetchStats, fetchOrders, fetchCustomers, fetchMachinery]);

  const [prices, setPrices] = useState({
    base: 40,
    dryClean: 150,
    ironing: 20,
    steamPress: 50
  });

  // --- Better Auth Session Hook ---
  const { data: sessionData, isPending: isSessionPending } = useSession();

  useEffect(() => {
    if (sessionData?.user) {
      const formattedUser = {
        id: sessionData.user.id,
        email: sessionData.user.email,
        name: sessionData.user.name,
        role: sessionData.user.role || 'customer',
        image: sessionData.user.image
      };
      setUser(formattedUser);
    } else if (!isSessionPending) {
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (session) {
                supabase.from('user').select('role').eq('id', session.user.id).single().then(({ data: userData }) => {
                  setUser({
                    id: session.user.id,
                    email: session.user.email,
                    name: session.user.user_metadata?.full_name || session.user.email.split('@')[0],
                    role: userData?.role || 'customer'
                  });
                  localStorage.setItem('token', session.access_token);
                });
            } else {
                setUser(null);
            }
        });
    }
  }, [sessionData, isSessionPending]);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!sessionData?.user && session) {
         const { data: userData } = await supabase.from('user').select('role').eq('id', session.user.id).single();
         setUser({
          id: session.user.id,
          email: session.user.email,
          name: session.user.user_metadata?.full_name || session.user.email.split('@')[0],
          role: userData?.role || 'customer'
        });
        localStorage.setItem('token', session.access_token);
      } else if (!sessionData?.user && !session) {
        setUser(null);
        localStorage.removeItem('token');
      }
    });

    return () => subscription.unsubscribe();
  }, [sessionData]);

  const login = async (email, password) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await response.json();
      if (response.ok) {
        setUser(data.user);
        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem('token', data.token);
        toast.success(`Welcome back, ${data.user.name}!`);
        return data.user;
      } else {
        toast.error(data.message || 'Login failed');
        return null;
      }
    } catch {
      toast.error('Connection to auth server failed');
      return null;
    }
  };

  const logout = async () => {
    await authClient.signOut();
    await supabase.auth.signOut();
    
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    toast.success('System disconnected cleanly');
  };

  const createOrder = async (orderData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/orders`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(orderData),
      });
      const data = await response.json();
      if (response.ok && data.success) {
        fetchOrders();
        fetchStats();
        toast.success('Order created successfully!');
        return data.order;
      }
      throw new Error(data.error || 'Failed to create order');
    } catch (err) {
      toast.error(err.message || 'Create order error');
      console.error('Create order error:', err);
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
