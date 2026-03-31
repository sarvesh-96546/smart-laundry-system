const supabase = require('../config/supabase');

const getMachinery = async (req, res) => {
    try {
        const { data: machinesData, error } = await supabase
            .from('machinery')
            .select(`
                *,
                orders (customer_name)
            `)
            .order('type', { ascending: true })
            .order('name', { ascending: true });

        if (error) throw error;

        // Map it to match the sqlite shape that the frontend expects
        const machines = machinesData.map(m => ({
            ...m,
            assigned_customer: m.orders ? m.orders.customer_name : null
        }));

        res.json(machines);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const startMachine = async (req, res) => {
    const { machine_id } = req.params;
    const { order_id, duration } = req.body;
    
    const startTime = new Date().toISOString();
    const durationMs = (duration || 30) * 60000;
    const endTime = new Date(Date.now() + durationMs).toISOString();

    try {
        // 1. Fetch current usage count
        const { data: currentMachine } = await supabase
            .from('machinery')
            .select('usage_count, type')
            .eq('id', machine_id)
            .single();

        // 2. Update Machine
        const { error: updateError } = await supabase
            .from('machinery')
            .update({
                assigned_order_id: order_id,
                cycle_start_time: startTime,
                expected_end_time: endTime,
                status: 'Running',
                usage_count: (currentMachine?.usage_count || 0) + 1
            })
            .eq('id', machine_id);

        if (updateError) throw updateError;

        const io = req.app.get('io');
        io.emit('machine_update', { machine_id, status: 'Running' });

        // 3. Auto-update order status
        if (currentMachine) {
            const newStatus = currentMachine.type.includes('Washing') ? 'Washing' : 'Drying';
            
            await supabase.from('orders').update({ status: newStatus }).eq('id', order_id);
            await supabase.from('order_updates').insert({ order_id, status: newStatus });
            
            io.emit('status_update', { order_id, new_status: newStatus });
        }

        res.json({ success: true, end_time: endTime });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const stopMachine = async (req, res) => {
    const { machine_id } = req.params;
    try {
        const { data: currentMachine, error: fetchErr } = await supabase
            .from('machinery')
            .select('assigned_order_id, type')
            .eq('id', machine_id)
            .single();

        if (fetchErr) throw fetchErr;

        const order_id = currentMachine?.assigned_order_id;

        // Update Machine
        const { error: updateErr } = await supabase
            .from('machinery')
            .update({
                assigned_order_id: null,
                cycle_start_time: null,
                expected_end_time: null,
                status: 'Operational'
            })
            .eq('id', machine_id);

        if (updateErr) throw updateErr;

        const io = req.app.get('io');
        io.emit('machine_update', { machine_id, status: 'Operational' });

        if (order_id) {
            const nextStatus = currentMachine.type.includes('Washing') ? 'Drying' : 'Ironing';
            
            await supabase.from('orders').update({ status: nextStatus }).eq('id', order_id);
            await supabase.from('order_updates').insert({ order_id, status: nextStatus });
            
            io.emit('status_update', { order_id, new_status: nextStatus });
        }

        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = { getMachinery, startMachine, stopMachine };
