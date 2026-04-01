const supabase = require('../config/supabase');

const getStats = async (req, res) => {
    try {
        const { data: orders, error } = await supabase.from('orders').select('*');
        if (error) throw error;
        
        let totalRevenue = 0;
        let inProgress = 0;
        let ready = 0;

        orders.forEach(o => {
            if (o.payment_status === 'Paid') totalRevenue += Number(o.amount);
            if (o.status !== 'Delivered' && o.status !== 'Ready' && o.status !== 'Completed') inProgress++;
            if (o.status === 'Ready' || o.status === 'Completed') ready++;
        });

        const chartDataMap = {};
        orders.forEach(o => {
            const date = new Date(o.created_at).toISOString().split('T')[0];
            chartDataMap[date] = (chartDataMap[date] || 0) + 1;
        });

        const chart_data = Object.keys(chartDataMap).map(date => ({
            date,
            orders: chartDataMap[date]
        })).sort((a, b) => new Date(a.date) - new Date(b.date)).slice(-7);

        res.json({
            revenue: totalRevenue,
            in_progress: inProgress,
            ready,
            total_orders: orders.length,
            chart_data
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = { getStats };
