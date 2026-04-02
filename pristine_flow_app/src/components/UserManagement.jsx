import React, { useState, useEffect, useCallback } from 'react';
import { useApp } from '../context/useApp';
import toast from 'react-hot-toast';

export default function UserManagement() {
    const { API_BASE_URL } = useApp();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'customer', phone_number: '' });
    const [editingId, setEditingId] = useState(null);

    const fetchUsers = useCallback(async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/api/users`, {
                credentials: 'include'
            });
            const data = await res.json();
            if (res.ok) {
                setUsers(data);
            } else {
                toast.error(data.message || 'Failed to fetch users');
            }
        } catch {
            toast.error('Error connecting to server');
        } finally {
            setLoading(false);
        }
    }, [API_BASE_URL]);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const url = editingId ? `${API_BASE_URL}/api/users/${editingId}` : `${API_BASE_URL}/api/register`;
        const method = editingId ? 'PUT' : 'POST';

        try {
            const res = await fetch(url, {
                method,
                headers: { 
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify(formData)
            });
            const data = await res.json();
            if (res.ok) {
                toast.success(editingId ? 'User updated' : 'User created');
                setShowModal(false);
                setFormData({ name: '', email: '', password: '', role: 'customer', phone_number: '' });
                setEditingId(null);
                fetchUsers();
            } else {
                toast.error(data.message || 'Operation failed');
            }
        } catch {
            toast.error('Network error');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this user?')) return;
        try {
            const res = await fetch(`${API_BASE_URL}/api/users/${id}`, {
                method: 'DELETE',
                credentials: 'include'
            });
            if (res.ok) {
                toast.success('User deleted');
                fetchUsers();
            } else {
                toast.error('Failed to delete');
            }
        } catch {
            toast.error('Network error');
        }
    };

    if (loading) return <div className="p-8 text-center text-slate-500 uppercase tracking-widest text-xs">Accessing User Database...</div>;

    return (
        <div className="min-h-screen bg-background text-white p-8 pt-24 font-['Plus_Jakarta_Sans']">
            <div className="max-w-6xl mx-auto">
                <header className="flex justify-between items-center mb-10">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight uppercase">User Management</h1>
                        <p className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.2em] mt-1">Admin Control Interface</p>
                    </div>
                    <button 
                        onClick={() => { setShowModal(true); setEditingId(null); setFormData({ name: '', email: '', password: '', role: 'customer', phone_number: '' }); }}
                        className="px-6 py-2.5 bg-primary text-black font-bold rounded-full hover:bg-white transition-all flex items-center gap-2 text-sm shadow-lg shadow-primary/10"
                    >
                        <span className="material-symbols-outlined text-sm">person_add</span>
                        New Operator
                    </button>
                </header>

                <div className="bg-[#121212] rounded-4xl border border-white/5 overflow-hidden shadow-2xl">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="text-[10px] text-slate-500 uppercase tracking-[0.2em] border-b border-white/5 bg-white/2">
                                <th className="px-8 py-6">Identity</th>
                                <th className="px-8 py-6">Role</th>
                                <th className="px-8 py-6">Contact</th>
                                <th className="px-8 py-6">Joined</th>
                                <th className="px-8 py-6 text-right">Protocol</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/3">
                            {users.map(user => (
                                <tr key={user.id} className="group hover:bg-white/2 transition-colors">
                                    <td className="px-8 py-6">
                                        <div className="font-bold text-sm">{user.name}</div>
                                        <div className="text-[10px] text-slate-500 font-mono tracking-tighter">{user.email}</div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <span className={`px-2 py-1 rounded text-[9px] font-bold uppercase tracking-widest ${
                                            user.role === 'admin' ? 'bg-primary/10 text-primary' : 
                                            user.role === 'staff' ? 'bg-yellow-500/10 text-yellow-500' : 
                                            'bg-white/5 text-slate-500'
                                        }`}>
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className="px-8 py-6 text-xs text-slate-400">{user.phone_number || 'N/A'}</td>
                                    <td className="px-8 py-6 text-[10px] text-slate-500 uppercase">{new Date(user.createdAt).toLocaleDateString()}</td>
                                    <td className="px-8 py-6 text-right">
                                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button 
                                                onClick={() => { setEditingId(user.id); setFormData({ ...user, password: '' }); setShowModal(true); }}
                                                className="p-2 hover:bg-white/5 rounded-lg text-slate-400 hover:text-primary transition-colors"
                                            >
                                                <span className="material-symbols-outlined text-sm">edit</span>
                                            </button>
                                            <button 
                                                onClick={() => handleDelete(user.id)}
                                                className="p-2 hover:bg-white/5 rounded-lg text-slate-400 hover:text-red-400 transition-colors"
                                            >
                                                <span className="material-symbols-outlined text-sm">delete</span>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {showModal && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-100 flex items-center justify-center p-4">
                    <div className="bg-[#121212] border border-white/10 rounded-4xl w-full max-w-md p-8 shadow-2xl">
                        <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary">settings_input_composite</span>
                            {editingId ? 'Modify Operator' : 'Register New Operator'}
                        </h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-[10px] uppercase tracking-widest text-slate-500 mb-1.5 ml-1">Full Name</label>
                                <input 
                                    type="text" 
                                    required
                                    className="w-full bg-[#1a1a1a] border border-white/10 rounded-xl py-3 px-4 text-sm outline-none focus:border-primary/50 transition-all"
                                    value={formData.name}
                                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] uppercase tracking-widest text-slate-500 mb-1.5 ml-1">Email Address (ID)</label>
                                <input 
                                    type="email" 
                                    required
                                    className="w-full bg-[#1a1a1a] border border-white/10 rounded-xl py-3 px-4 text-sm outline-none focus:border-primary/50 transition-all"
                                    value={formData.email}
                                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                                />
                            </div>
                            {!editingId && (
                                <div>
                                    <label className="block text-[10px] uppercase tracking-widest text-slate-500 mb-1.5 ml-1">Access Password</label>
                                    <input 
                                        type="password" 
                                        required
                                        className="w-full bg-[#1a1a1a] border border-white/10 rounded-xl py-3 px-4 text-sm outline-none focus:border-primary/50 transition-all"
                                        value={formData.password}
                                        onChange={(e) => setFormData({...formData, password: e.target.value})}
                                    />
                                </div>
                            )}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] uppercase tracking-widest text-slate-500 mb-1.5 ml-1">Designation</label>
                                    <select 
                                        className="w-full bg-[#1a1a1a] border border-white/10 rounded-xl py-3 px-4 text-sm outline-none focus:border-primary/50 transition-all"
                                        value={formData.role}
                                        onChange={(e) => setFormData({...formData, role: e.target.value})}
                                    >
                                        <option value="customer">Customer</option>
                                        <option value="staff">Staff</option>
                                        <option value="admin">Admin</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[10px] uppercase tracking-widest text-slate-500 mb-1.5 ml-1">Uplink Code (Phone)</label>
                                    <input 
                                        type="text" 
                                        className="w-full bg-[#1a1a1a] border border-white/10 rounded-xl py-3 px-4 text-sm outline-none focus:border-primary/50 transition-all"
                                        value={formData.phone_number}
                                        onChange={(e) => setFormData({...formData, phone_number: e.target.value})}
                                    />
                                </div>
                            </div>
                            <div className="pt-4 flex gap-3">
                                <button 
                                    type="button" 
                                    onClick={() => setShowModal(false)}
                                    className="flex-1 px-6 py-3 bg-white/5 text-slate-400 font-bold rounded-xl hover:bg-white/10 transition-all"
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit" 
                                    className="flex-1 px-6 py-3 bg-primary text-black font-bold rounded-xl hover:bg-white transition-all shadow-lg shadow-primary/10"
                                >
                                    {editingId ? 'Update' : 'Confirm'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
