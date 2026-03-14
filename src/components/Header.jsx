import { Bell } from 'lucide-react';
import { useState, useEffect } from 'react';
import { getProducts } from '../data/db';

export default function Header() {
  const [alerts, setAlerts] = useState(0);

  useEffect(() => {
    // Check for low stock (e.g., <= 10 items)
    const checkAlerts = () => {
      const products = getProducts();
      const lowStock = products.filter(p => p.stock <= 10).length;
      setAlerts(lowStock);
    };

    checkAlerts();
    // Poll every 5s for simplicity in this mock
    const interval = setInterval(checkAlerts, 5000);
    return () => clearInterval(interval);
  }, []);

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric'
  });

  return (
    <header className="top-header">
      <div>
        <h3 style={{ margin: 0, fontWeight: 500 }}>Dashboard</h3>
        <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>{today}</span>
      </div>
      
      <div className="flex items-center gap-4">
        <div style={{ position: 'relative', cursor: 'pointer' }}>
          <Bell size={24} color="var(--text-muted)" />
          {alerts > 0 && (
            <span style={{
              position: 'absolute',
              top: -4,
              right: -4,
              backgroundColor: 'var(--danger)',
              color: 'white',
              fontSize: '0.65rem',
              fontWeight: 'bold',
              minWidth: '16px',
              height: '16px',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '0 4px',
              border: '2px solid var(--surface)'
            }}>
              {alerts}
            </span>
          )}
        </div>
        <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold' }}>
          JD
        </div>
      </div>
    </header>
  );
}
