const db = require('../config/db');

const getStats = async (req, res) => {
    try {
        const [orders] = await db.execute('SELECT * FROM orders');
        
        let totalRevenue = 0;
        let inProgress = 0;
        let ready = 0;

        orders.forEach(o => {
            if (o.payment_status === 'Paid') totalRevenue += o.amount;
            if (o.status !== 'Delivered' && o.status !== 'Ready') inProgress++;
            if (o.status === 'Ready') ready++;
        });

        // Group by date for chart
        const chartDataMap = {};
        orders.forEach(o => {
            const date = o.created_at.split(' ')[0];
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
