import { useState } from 'react';
import { getProducts, getCategories, saveProduct } from '../data/db';
import { AlertCircle, Edit } from 'lucide-react';

export default function Inventory() {
  const [products, setProducts] = useState(getProducts());
  const [categories] = useState(getCategories());
  const [selectedCategory, setSelectedCategory] = useState('All');

  const filteredProducts = products.filter(p => 
    selectedCategory === 'All' || p.category === selectedCategory
  );

  const handleManualStockUpdate = (id, newStock) => {
    const stock = parseInt(newStock);
    if (isNaN(stock) || stock < 0) return;
    
    const product = products.find(p => p.id === id);
    if (product) {
      const updated = { ...product, stock };
      saveProduct(updated);
      setProducts(getProducts());
    }
  };

  return (
    <div className="page-container">
      <div className="flex justify-between items-center" style={{ marginBottom: '2rem' }}>
        <h2>Inventory tracking</h2>
        <div className="flex gap-2">
          <select 
            className="input" 
            value={selectedCategory} 
            onChange={e => setSelectedCategory(e.target.value)}
          >
            <option value="All">All Categories</option>
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>

      <div className="card" style={{ overflowX: 'auto', padding: 0 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: 'var(--background)' }}>
              <th style={{ padding: '1rem', fontWeight: 600, borderBottom: '1px solid var(--border)' }}>Product</th>
              <th style={{ padding: '1rem', fontWeight: 600, borderBottom: '1px solid var(--border)' }}>Category / Size</th>
              <th style={{ padding: '1rem', fontWeight: 600, borderBottom: '1px solid var(--border)' }}>Stock Level</th>
              <th style={{ padding: '1rem', fontWeight: 600, borderBottom: '1px solid var(--border)' }}>Status</th>
              <th style={{ padding: '1rem', fontWeight: 600, borderBottom: '1px solid var(--border)', width: 150 }}>Manual Adjust</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.map(p => {
              const isLowStock = p.stock <= 10;
              const isOutOfStock = p.stock === 0;

              return (
                <tr key={p.id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '1rem', fontWeight: 500 }}>{p.name}</td>
                  <td style={{ padding: '1rem', color: 'var(--text-muted)' }}>{p.category} | {p.size}</td>
                  <td style={{ padding: '1rem' }}>
                    <div className="flex items-center gap-2">
                      <span style={{ fontSize: '1.1rem', fontWeight: 600, color: isOutOfStock ? 'var(--danger)' : isLowStock ? 'var(--warning)' : 'inherit' }}>
                        {p.stock}
                      </span>
                    </div>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    {isOutOfStock ? (
                      <span className="badge badge-danger flex items-center gap-1 w-max"><AlertCircle size={14}/> Out of Stock</span>
                    ) : isLowStock ? (
                      <span className="badge badge-warning flex items-center gap-1 w-max"><AlertCircle size={14}/> Low Stock</span>
                    ) : (
                      <span className="badge badge-success">In Stock</span>
                    )}
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <input 
                      type="number" 
                      className="input" 
                      style={{ width: 80, padding: '0.4rem', fontSize: '0.875rem' }} 
                      defaultValue={p.stock}
                      onBlur={(e) => handleManualStockUpdate(p.id, e.target.value)}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
