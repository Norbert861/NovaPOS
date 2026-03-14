import { NavLink } from 'react-router-dom';
import { LayoutDashboard, ShoppingCart, Package, Tags, Users, Truck } from 'lucide-react';

export default function Sidebar() {
  const links = [
    { to: '/', icon: <LayoutDashboard size={20} />, label: 'Dashboard' },
    { to: '/pos', icon: <ShoppingCart size={20} />, label: 'Point of Sale' },
    { to: '/inventory', icon: <Package size={20} />, label: 'Inventory' },
    { to: '/products', icon: <Tags size={20} />, label: 'Products' },
    { to: '/suppliers', icon: <Truck size={20} />, label: 'Restock & Suppliers' }
  ];

  return (
    <aside className="sidebar">
      <div className="logo-container">
        <div className="logo-icon">
          <ShoppingCart size={24} />
        </div>
        <div>
          <h2 style={{ fontSize: '1.25rem', letterSpacing: '-0.02em' }}>Nova POS</h2>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Baby Care Store</span>
        </div>
      </div>
      
      <nav className="nav-menu">
        {links.map(link => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            {link.icon}
            <span>{link.label}</span>
          </NavLink>
        ))}
      </nav>

      <div style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
        <button className="btn btn-secondary w-full" style={{ justifyContent: 'flex-start', border: 'none' }}>
          <Users size={20} />
          <div className="flex-col" style={{ alignItems: 'flex-start', gap: 0 }}>
            <span style={{ fontSize: '0.875rem' }}>Store Owner</span>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Admin Role</span>
          </div>
        </button>
      </div>
    </aside>
  );
}
