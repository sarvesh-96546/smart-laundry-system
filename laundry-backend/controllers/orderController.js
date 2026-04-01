const supabase = require('../config/supabase');

const statusSequence = ['Pending', 'Washing', 'Drying', 'Ironing', 'Completed', 'Delivered'];

const createOrder = async (req, res) => {
    const { customer_name, phone, address, notes, items_count, amount, priority_level, service_type } = req.body;
    const orderId = `LD-${Math.floor(10000 + Math.random() * 90000)}`;
    const customer_id = req.userId || req.body.customer_id;

    try {
        if (!service_type) return res.status(400).json({ success: false, error: 'Missing service_type' });
        
        const orderData = {
            id: orderId,
            customer_id: customer_id || null,
            customer_name: customer_name || 'Walk-in',
            phone: phone || '0000000000',
            address: address || null,
            notes: notes || null,
            items_count: items_count || 1,
            amount: amount || 0,
            priority_level: priority_level || 'Standard',
            service_type: service_type,
            status: 'Pending'
        };

        const { error: insertError } = await supabase.from('orders').insert(orderData);
        if (insertError) throw insertError;

        const { error: updateError } = await supabase.from('order_updates').insert({
            order_id: orderId, status: 'Pending'
        });
        if (updateError) throw updateError;

        const io = req.app.get('io');
        if (io) {
            io.emit('new_order', { 
                order_id: orderId, 
                customer_name: orderData.customer_name, 
                priority: orderData.priority_level 
            });
        }

        res.status(201).json({ success: true, order: orderData });
    } catch (error) {
        console.error(`[ORDER_CREATE_ERROR] Order ID: ${orderId}, Error:`, error);
        res.status(500).json({ success: false, error: error.message || 'Internal Server Error' });
    }
};

const getOrders = async (req, res) => {
    try {
        let query = supabase.from('orders').select('*').order('created_at', { ascending: false });

        if (req.userRole === 'staff') {
            query = query.eq('assigned_staff_id', req.userId);
        } else if (req.userRole === 'customer') {
            query = query.eq('customer_id', req.userId);
        }

        const { data: orders, error } = await query;
        if (error) throw error;

        res.json(orders);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getOrderById = async (req, res) => {
    const id = req.params.id;
    try {
        const { data: order, error: orderErr } = await supabase.from('orders').select('*').eq('id', id).single();
        if (orderErr || !order) return res.status(404).json({ error: 'Order not found' });

        const { data: updates, error: updateErr } = await supabase.from('order_updates').select('*').eq('order_id', id).order('timestamp', { ascending: false });
        if (updateErr) throw updateErr;

        if (req.userRole === 'customer' && order.customer_id !== req.userId) {
            return res.status(403).json({ error: 'Unauthorized to view this order' });
        }

        res.json({ order, updates });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const updateOrderStatus = async (req, res) => {
    const { status } = req.body;
    const orderId = req.params.id;

    try {
        const { data: currentOrder, error: fetchErr } = await supabase.from('orders').select('status, customer_id, customer_name').eq('id', orderId).single();
        if (fetchErr || !currentOrder) return res.status(404).json({ error: 'Order not found' });
        
        const currentStatus = currentOrder.status;

        if (req.userRole !== 'staff' && req.userRole !== 'admin') {
            return res.status(403).json({ error: 'Unauthorized: Only Staff or Admin can update status' });
        }

        const currentIndex = statusSequence.indexOf(currentStatus);
        const nextIndex = statusSequence.indexOf(status);

        if (nextIndex === -1) return res.status(400).json({ error: `Invalid status` });

        if (nextIndex !== currentIndex + 1 && req.userRole !== 'admin') {
            return res.status(400).json({ error: `Invalid transition` });
        }

        const { error: updateErr } = await supabase.from('orders').update({ status }).eq('id', orderId);
        if (updateErr) throw updateErr;
        
        const { error: logErr } = await supabase.from('order_updates').insert({ order_id: orderId, status });
        if (logErr) throw logErr;

        if (status === 'Completed' || status === 'Ready') {
            if (currentOrder.customer_id) {
                const { data: userData } = await supabase.from('user').select('email').eq('id', currentOrder.customer_id).single();
                if (userData?.email) {
                    const { sendOrderReadyEmail } = require('../utils/emailService');
                    sendOrderReadyEmail(userData.email, currentOrder.customer_name, orderId);
                }
            }
        }
        
        const io = req.app.get('io');
        io.emit('status_update', { order_id: orderId, new_status: status });

        res.json({ success: true, message: `Status updated to ${status}` });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = { createOrder, getOrders, getOrderById, updateOrderStatus };
