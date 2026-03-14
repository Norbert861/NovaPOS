import { useState } from 'react';
import { getProducts, getCategories, saveProduct, deleteProduct, getSuppliers } from '../data/db';
import { Plus, Trash2, Edit2 } from 'lucide-react';

export default function Products() {
  const [products, setProducts] = useState(getProducts());
  const categories = getCategories();
  const suppliers = getSuppliers();

  const [isModalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '',
    category: categories[0] || '',
    size: 'Standard',
    price: '',
    stock: 0,
    supplierId: suppliers[0]?.id || ''
  });

  const handleOpenModal = (product = null) => {
    if (product) {
      setFormData(product);
      setEditingId(product.id);
    } else {
      setFormData({
        name: '', category: categories[0], size: 'Standard', price: '', stock: 0, supplierId: suppliers[0]?.id
      });
      setEditingId(null);
    }
    setModalOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    saveProduct({
      ...formData,
      id: editingId,
      price: parseFloat(formData.price),
      stock: parseInt(formData.stock)
    });
    setProducts(getProducts());
    setModalOpen(false);
  };

  const handleDelete = (id) => {
    if (confirm("Are you sure you want to delete this product?")) {
      deleteProduct(id);
      setProducts(getProducts());
    }
  };

  return (
    <div className="page-container">
      <div className="flex justify-between items-center" style={{ marginBottom: '2rem' }}>
        <h2>Product Catalog</h2>
        <button className="btn btn-primary" onClick={() => handleOpenModal()}>
          <Plus size={18} /> New Product
        </button>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: 'var(--background)' }}>
              <th style={{ padding: '1rem', fontWeight: 600, borderBottom: '1px solid var(--border)' }}>Name</th>
              <th style={{ padding: '1rem', fontWeight: 600, borderBottom: '1px solid var(--border)' }}>Category</th>
              <th style={{ padding: '1rem', fontWeight: 600, borderBottom: '1px solid var(--border)' }}>Size</th>
              <th style={{ padding: '1rem', fontWeight: 600, borderBottom: '1px solid var(--border)' }}>Price</th>
              <th style={{ padding: '1rem', fontWeight: 600, borderBottom: '1px solid var(--border)', textAlign: 'center' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map(p => (
              <tr key={p.id} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '1rem' }}>
                  <div style={{ fontWeight: 500 }}>{p.name}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Supplier: {suppliers.find(s=>s.id === p.supplierId)?.name || 'Unknown'}</div>
                </td>
                <td style={{ padding: '1rem' }}><span className="badge badge-success">{p.category}</span></td>
                <td style={{ padding: '1rem', color: 'var(--text-muted)' }}>{p.size}</td>
                <td style={{ padding: '1rem', fontWeight: 600 }}>${p.price.toFixed(2)}</td>
                <td style={{ padding: '1rem' }}>
                  <div className="flex justify-center gap-2">
                    <button className="btn btn-secondary" style={{ padding: '0.5rem' }} onClick={() => handleOpenModal(p)}>
                      <Edit2 size={16} />
                    </button>
                    <button className="btn btn-danger" style={{ padding: '0.5rem' }} onClick={() => handleDelete(p.id)}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div className="card" style={{ width: 400, padding: '2rem' }}>
            <h3 style={{ marginBottom: '1.5rem' }}>{editingId ? 'Edit Product' : 'New Product'}</h3>
            <form onSubmit={handleSubmit} className="flex-col gap-4">
              <div className="input-group">
                <label>Product Name</label>
                <input required type="text" className="input" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>
              <div className="flex gap-4">
                <div className="input-group flex-1">
                  <label>Category</label>
                  <select className="input" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="input-group flex-1">
                  <label>Size</label>
                  <input type="text" className="input" value={formData.size} onChange={e => setFormData({...formData, size: e.target.value})} />
                </div>
              </div>
              <div className="flex gap-4">
                <div className="input-group flex-1">
                  <label>Price ($)</label>
                  <input required min="0" step="0.01" type="number" className="input" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} />
                </div>
                <div className="input-group flex-1">
                  <label>Initial Stock</label>
                  <input required min="0" type="number" className="input" disabled={!!editingId} value={formData.stock} onChange={e => setFormData({...formData, stock: e.target.value})} />
                </div>
              </div>
              <div className="input-group">
                <label>Supplier</label>
                <select className="input" value={formData.supplierId} onChange={e => setFormData({...formData, supplierId: e.target.value})}>
                  {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>

              <div className="flex gap-2 justify-between" style={{ marginTop: '1rem' }}>
                <button type="button" className="btn btn-secondary flex-1" onClick={() => setModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary flex-1">Save Product</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
