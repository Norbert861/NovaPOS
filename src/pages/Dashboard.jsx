import { useState, useEffect } from 'react';
import { DollarSign, ShoppingBag, PackageOpen, TrendingUp } from 'lucide-react';
import { getSales, getProducts } from '../data/db';

export default function Dashboard() {
  const [stats, setStats] = useState({
    todaySales: 0,
    totalOrders: 0,
    lowStockItems: 0,
    topProduct: 'None'
  });
  const [recentSales, setRecentSales] = useState([]);

  useEffect(() => {
    const sales = getSales();
    const products = getProducts();
    
    // Quick calculations
    const today = new Date().toISOString().split('T')[0];
    const todaysSales = sales.filter(s => s.date.startsWith(today));
    const revenue = todaysSales.reduce((sum, s) => sum + s.total, 0);
    
    // Top Product
    const productCounts = {};
    sales.forEach(sale => {
      sale.items.forEach(item => {
        productCounts[item.product.name] = (productCounts[item.product.name] || 0) + item.quantity;
      });
    });
    
    let top = { name: 'None', qty: 0 };
    for (const [name, qty] of Object.entries(productCounts)) {
      if (qty > top.qty) top = { name, qty };
    }

    setStats({
      todaySales: revenue,
      totalOrders: todaysSales.length,
      lowStockItems: products.filter(p => p.stock <= 10).length,
      topProduct: top.name
    });

    // Recent 5 sales
    setRecentSales(sales.sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 5));
  }, []);

  return (
    <div className="page-container">
      <div className="flex justify-between items-center" style={{ marginBottom: '2rem' }}>
        <h2>Store Overview</h2>
        <button className="btn btn-primary" onClick={() => window.location.href='/pos'}>
          <ShoppingBag size={18} />
          New Sale
        </button>
      </div>

      {/* Analytics Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        <StatCard 
          title="Today's Revenue" 
          value={`$${stats.todaySales.toFixed(2)}`} 
          icon={<DollarSign size={24} color="var(--success)" />} 
          trend="+12% from yesterday"
          trendColor="var(--success)"
        />
        <StatCard 
          title="Today's Orders" 
          value={stats.totalOrders} 
          icon={<ShoppingBag size={24} color="var(--primary)" />} 
          trend="Steady"
          trendColor="var(--text-muted)"
        />
        <StatCard 
          title="Low Stock Items" 
          value={stats.lowStockItems} 
          icon={<PackageOpen size={24} color="var(--danger)" />} 
          trend="Needs Attention"
          trendColor={stats.lowStockItems > 0 ? "var(--danger)" : "var(--text-muted)"}
        />
        <StatCard 
          title="Top Selling Item" 
          value={stats.topProduct} 
          icon={<TrendingUp size={24} color="var(--warning)" />} 
          trend="Based on all time sales"
          trendColor="var(--text-muted)"
          valueSize="1.2rem"
        />
      </div>

      {/* Recent Transactions */}
      <div className="card" style={{ flex: 1 }}>
        <div className="flex justify-between items-center" style={{ marginBottom: '1.5rem' }}>
          <h3>Recent Transactions</h3>
          <button className="btn btn-secondary" style={{ padding: '0.4rem 1rem', fontSize: '0.875rem' }}>View All</button>
        </div>
        
        {recentSales.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--text-muted)' }}>
            <ShoppingBag size={48} style={{ opacity: 0.2, marginBottom: '1rem' }} />
            <p>No sales recorded yet today.</p>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--border)', color: 'var(--text-muted)' }}>
                <th style={{ padding: '0.75rem', fontWeight: 500 }}>Transaction ID</th>
                <th style={{ padding: '0.75rem', fontWeight: 500 }}>Date/Time</th>
                <th style={{ padding: '0.75rem', fontWeight: 500 }}>Items</th>
                <th style={{ padding: '0.75rem', fontWeight: 500 }}>Payment</th>
                <th style={{ padding: '0.75rem', fontWeight: 500 }}>Total</th>
              </tr>
            </thead>
            <tbody>
              {recentSales.map(sale => (
                <tr key={sale.id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '1rem 0.75rem', fontWeight: 500 }}>{sale.id}</td>
                  <td style={{ padding: '1rem 0.75rem', color: 'var(--text-muted)' }}>
                    {new Date(sale.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td style={{ padding: '1rem 0.75rem' }}>{sale.items.reduce((s, i) => s + i.quantity, 0)} items</td>
                  <td style={{ padding: '1rem 0.75rem' }}>
                    <span className="badge badge-success">{sale.paymentMethod}</span>
                  </td>
                  <td style={{ padding: '1rem 0.75rem', fontWeight: 600 }}>${sale.total.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, trend, trendColor, valueSize = '2rem' }) {
  return (
    <div className="card flex-col justify-between" style={{ padding: '1.5rem', gap: '1rem' }}>
      <div className="flex justify-between items-start">
        <div>
          <h4 style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '0.5rem', fontWeight: 500 }}>{title}</h4>
          <div style={{ fontSize: valueSize, fontWeight: 700, color: 'var(--text-main)', lineHeight: 1.1 }}>{value}</div>
        </div>
        <div style={{ padding: '0.75rem', background: 'var(--background)', borderRadius: 'var(--radius-md)' }}>
          {icon}
        </div>
      </div>
      <div style={{ fontSize: '0.8rem', color: trendColor || 'var(--text-muted)', fontWeight: 500 }}>
        {trend}
      </div>
    </div>
  );
}
