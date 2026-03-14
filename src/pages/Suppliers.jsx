import { useState } from 'react';
import { getSuppliers, getProducts, receiveRestock } from '../data/db';
import { PackagePlus, Truck } from 'lucide-react';

export default function Suppliers() {
  const [suppliers] = useState(getSuppliers());
  const [products, setProducts] = useState(getProducts());

  const [restockModal, setRestockModal] = useState({ open: false, product: null, qty: 10 });

  const handleRestock = (e) => {
    e.preventDefault();
    receiveRestock(restockModal.product.id, parseInt(restockModal.qty));
    setProducts(getProducts());
    setRestockModal({ open: false, product: null, qty: 10 });
  };

  const lowStockProducts = products.filter(p => p.stock <= 10);

  return (
    <div className="page-container flex gap-4" style={{ alignItems: 'flex-start' }}>
      
      {/* LEFT: Dashboard of Low Stock & Suppliers */}
      <div className="flex-col gap-4" style={{ flex: 2 }}>
        <div className="flex justify-between items-center">
          <h2>Restock Management</h2>
        </div>

        {lowStockProducts.length > 0 && (
           <div className="card" style={{ borderColor: 'var(--danger)', background: 'var(--danger-light)' }}>
             <h3 style={{ color: 'var(--danger)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Truck size={20} /> Low Stock Restock Alerts
             </h3>
             <ul style={{ listStyle: 'none' }}>
               {lowStockProducts.map(p => (
                 <li key={p.id} className="flex justify-between items-center" style={{ padding: '0.75rem 0', borderBottom: '1px dashed rgba(239, 68, 68, 0.3)' }}>
                    <div>
                      <div style={{ fontWeight: 600 }}>{p.name}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--danger)' }}>Only {p.stock} left. Supplier: {suppliers.find(s=>s.id === p.supplierId)?.name}</div>
                    </div>
                    <button className="btn btn-primary" style={{ padding: '0.4rem 1rem', fontSize: '0.875rem' }} onClick={() => setRestockModal({ open: true, product: p, qty: 20 })}>
                      Order More
                    </button>
                 </li>
               ))}
             </ul>
           </div>
        )}

        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border)' }}>
            <h3>Supplier Directory</h3>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: 'var(--background)' }}>
                <th style={{ padding: '1rem', fontWeight: 600, borderBottom: '1px solid var(--border)' }}>Supplier Name</th>
                <th style={{ padding: '1rem', fontWeight: 600, borderBottom: '1px solid var(--border)' }}>Contact</th>
                <th style={{ padding: '1rem', fontWeight: 600, borderBottom: '1px solid var(--border)' }}>Categories Supplied</th>
              </tr>
            </thead>
            <tbody>
              {suppliers.map(s => (
                <tr key={s.id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '1rem', fontWeight: 500 }}>{s.name}</td>
                  <td style={{ padding: '1rem', color: 'var(--text-muted)' }}>{s.contact}</td>
                  <td style={{ padding: '1rem' }}><span className="badge badge-success">{s.products.join(', ')}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* RIGHT: Quick Restock Panel */}
      <div className="card flex-col" style={{ flex: 1, position: 'sticky', top: 0 }}>
        <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <PackagePlus size={20} /> Quick Restock
        </h3>
        
        <div style={{ marginBottom: '1.5rem', maxHeight: 400, overflowY: 'auto' }} className="flex-col gap-2">
          {products.map(p => (
            <div key={p.id} className="flex justify-between items-center" style={{ padding: '0.75rem', background: 'var(--background)', borderRadius: 'var(--radius-md)' }}>
              <div style={{ overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis', maxWidth: '140px' }} title={p.name}>
                <div style={{ fontSize: '0.875rem', fontWeight: 500 }}>{p.name}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Stock: {p.stock}</div>
              </div>
              <button 
                className="btn btn-secondary" 
                style={{ padding: '0.25rem 0.5rem', fontSize: '0.8rem' }}
                onClick={() => setRestockModal({ open: true, product: p, qty: 10 })}
              >
                Restock
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* RESTOCK MODAL */}
      {restockModal.open && (
         <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
         <div className="card" style={{ width: 400, padding: '2rem' }}>
           <h3 style={{ marginBottom: '0.5rem' }}>Restock Inventory</h3>
           <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>Receiving new stock for <br/><strong>{restockModal.product.name}</strong></p>
           
           <form onSubmit={handleRestock} className="flex-col gap-4">
             <div className="input-group">
               <label>Quantity Received</label>
               <input 
                 required 
                 min="1" 
                 type="number" 
                 className="input" 
                 value={restockModal.qty} 
                 onChange={e => setRestockModal({...restockModal, qty: e.target.value})} 
               />
             </div>
             
             <div className="flex gap-2 justify-between" style={{ marginTop: '1rem' }}>
               <button type="button" className="btn btn-secondary flex-1" onClick={() => setRestockModal({ open: false, product: null, qty: 10 })}>Cancel</button>
               <button type="submit" className="btn btn-success flex-1" style={{ background: 'var(--success)', color: 'white' }}>Receive Stock</button>
             </div>
           </form>
         </div>
       </div>
      )}
    </div>
  );
}
