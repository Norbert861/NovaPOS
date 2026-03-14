import { useState, useMemo } from 'react';
import { Search, Plus, Minus, Trash2, CreditCard, Banknote, CheckCircle } from 'lucide-react';
import { getProducts, processSale } from '../data/db';

export default function POS() {
  const [products, setProducts] = useState(getProducts());
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  
  const [cart, setCart] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState('');
  const [amountTendered, setAmountTendered] = useState('');
  const [receipt, setReceipt] = useState(null);

  // Derived state
  const categories = ['All', ...new Set(products.map(p => p.category))];
  
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchCat = category === 'All' || p.category === category;
      const matchQuery = p.name.toLowerCase().includes(search.toLowerCase());
      return matchCat && matchQuery && p.stock > 0;
    });
  }, [products, search, category]);

  const cartTotal = cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  const change = amountTendered ? (parseFloat(amountTendered) - cartTotal).toFixed(2) : 0;

  // Actions
  const addToCart = (product) => {
    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        if (existing.quantity >= product.stock) return prev; // Cannot exceed stock
        return prev.map(item => item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const updateQuantity = (id, delta) => {
    setCart(prev => prev.map(item => {
      if (item.product.id === id) {
        const newQ = item.quantity + delta;
        if (newQ > item.product.stock) return item;
        if (newQ <= 0) return null; // Marked for removal
        return { ...item, quantity: newQ };
      }
      return item;
    }).filter(Boolean));
  };

  const checkout = () => {
    if (cart.length === 0 || !paymentMethod) return;
    if (paymentMethod === 'Cash' && (!amountTendered || parseFloat(amountTendered) < cartTotal)) {
      alert("Amount tendered is less than the total.");
      return;
    }

    const sale = {
      items: cart,
      paymentMethod,
      total: cartTotal,
      tendered: paymentMethod === 'Cash' ? parseFloat(amountTendered) : cartTotal
    };

    const record = processSale(sale);
    setReceipt(record);
    
    // Refresh UI
    setCart([]);
    setPaymentMethod('');
    setAmountTendered('');
    setProducts(getProducts());
  };

  return (
    <div className="flex h-full w-full" style={{ overflow: 'hidden' }}>
      
      {/* LEFT: Products Grid */}
      <div className="flex-col" style={{ flex: 1, padding: '1.5rem', overflowY: 'auto' }}>
        
        <div className="flex justify-between items-center" style={{ marginBottom: '1.5rem', gap: '1rem' }}>
          <div className="input-group" style={{ flex: 1, position: 'relative' }}>
            <Search size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '1rem', top: '12px' }} />
            <input 
              type="text" 
              className="input" 
              placeholder="Search products..." 
              style={{ paddingLeft: '2.5rem' }}
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <div className="flex gap-2" style={{ overflowX: 'auto', paddingBottom: '4px' }}>
            {categories.map(cat => (
              <button 
                key={cat} 
                className={`btn ${category === cat ? 'btn-primary' : 'btn-secondary'}`}
                style={{ borderRadius: 'var(--radius-full)', padding: '0.5rem 1rem', whiteSpace: 'nowrap' }}
                onClick={() => setCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
          {filteredProducts.map(product => (
            <div 
              key={product.id} 
              className="card flex-col justify-between" 
              style={{ cursor: 'pointer', padding: '1rem' }}
              onClick={() => addToCart(product)}
            >
              <div>
                <div className="badge badge-success" style={{ marginBottom: '0.5rem', display: 'inline-block' }}>{product.category}</div>
                <h4 style={{ fontSize: '1rem', marginBottom: '0.25rem' }}>{product.name}</h4>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Size: {product.size} • Stock: {product.stock}</p>
              </div>
              <div className="flex justify-between items-end" style={{ marginTop: '1rem' }}>
                <span style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--primary)' }}>${product.price.toFixed(2)}</span>
                <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--primary-light)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Plus size={16} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* RIGHT: Cart & Checkout Panel */}
      <div className="card flex-col" style={{ width: 380, height: '100%', margin: 0, borderRight: 'none', borderTop: 'none', borderBottom: 'none', borderRadius: 0, background: 'var(--surface)' }}>
        <h3 style={{ padding: '1.5rem', borderBottom: '1px solid var(--border)' }}>Current Sale</h3>
        
        <div style={{ flex: 1, overflowY: 'auto', padding: '1rem 1.5rem' }}>
          {cart.length === 0 ? (
            <div style={{ textAlign: 'center', color: 'var(--text-muted)', marginTop: '3rem' }}>
              <ShoppingCart size={48} style={{ opacity: 0.2, margin: '0 auto 1rem' }} />
              <p>Cart is empty</p>
            </div>
          ) : (
            <div className="flex-col gap-4">
              {cart.map(item => (
                <div key={item.product.id} className="flex justify-between items-center bg-gray-50" style={{ padding: '0.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                  <div style={{ flex: 1 }}>
                    <h5 style={{ fontSize: '0.875rem' }}>{item.product.name}</h5>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>${item.product.price.toFixed(2)} each</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => updateQuantity(item.product.id, -1)} style={{ border: 'none', background: 'var(--border)', width: 24, height: 24, borderRadius: 4, cursor: 'pointer' }}><Minus size={14} style={{ margin: 'auto' }} /></button>
                    <span style={{ fontWeight: 600, width: 20, textAlign: 'center' }}>{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.product.id, 1)} style={{ border: 'none', background: 'var(--primary-light)', color: 'white', width: 24, height: 24, borderRadius: 4, cursor: 'pointer' }}><Plus size={14} style={{ margin: 'auto' }} /></button>
                  </div>
                  <div style={{ width: 60, textAlign: 'right', fontWeight: 600 }}>
                    ${(item.quantity * item.product.price).toFixed(2)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={{ padding: '1.5rem', borderTop: '1px solid var(--border)', background: 'var(--background)' }}>
          <div className="flex justify-between" style={{ marginBottom: '0.5rem', color: 'var(--text-muted)' }}>
            <span>Subtotal</span>
            <span>${cartTotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between" style={{ marginBottom: '1rem', fontSize: '1.5rem', fontWeight: 700 }}>
            <span>Total</span>
            <span style={{ color: 'var(--primary)' }}>${cartTotal.toFixed(2)}</span>
          </div>

          {cart.length > 0 && (
            <div className="flex-col gap-2" style={{ marginBottom: '1rem' }}>
              <p style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-muted)' }}>Payment Method</p>
              <div className="flex gap-2">
                <button 
                  className={`btn ${paymentMethod === 'Cash' ? 'btn-primary' : 'btn-secondary'} flex-1`}
                  onClick={() => setPaymentMethod('Cash')}
                ><Banknote size={18} /> Cash</button>
                <button 
                  className={`btn ${paymentMethod === 'Mobile Money' ? 'btn-primary' : 'btn-secondary'} flex-1`}
                  onClick={() => setPaymentMethod('Mobile Money')}
                ><CreditCard size={18} /> Mobile Money</button>
              </div>

              {paymentMethod === 'Cash' && (
                <div className="input-group" style={{ marginTop: '0.5rem' }}>
                  <label>Amount Tendered ($)</label>
                  <input 
                    type="number" 
                    className="input" 
                    value={amountTendered} 
                    onChange={e => setAmountTendered(e.target.value)} 
                    placeholder="e.g. 50"
                  />
                  {parseFloat(amountTendered) >= cartTotal && (
                    <div style={{ color: 'var(--success)', fontWeight: 600, marginTop: '0.25rem', fontSize: '0.875rem' }}>
                      Change: ${change}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          <button 
            className="btn btn-primary w-full" 
            style={{ padding: '1rem', fontSize: '1.1rem' }}
            disabled={cart.length === 0 || !paymentMethod}
            onClick={checkout}
          >
            Process Payment
          </button>
        </div>
      </div>

      {/* RECEIPT MODAL */}
      {receipt && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div className="card flex-col items-center" style={{ width: 400, animation: 'fadeIn 0.2s', padding: '2rem' }}>
            <CheckCircle size={64} color="var(--success)" style={{ marginBottom: '1rem' }} />
            <h2 style={{ marginBottom: '0.5rem' }}>Payment Successful</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>Transaction ID: {receipt.id}</p>
            
            <div style={{ width: '100%', borderTop: '1px dashed var(--border)', borderBottom: '1px dashed var(--border)', padding: '1rem 0', marginBottom: '1.5rem' }}>
              {receipt.items.map(i => (
                <div key={i.product.id} className="flex justify-between" style={{ fontSize: '0.875rem', marginBottom: '0.5rem' }}>
                  <span>{i.quantity}x {i.product.name}</span>
                  <span>${(i.product.price * i.quantity).toFixed(2)}</span>
                </div>
              ))}
              <div className="flex justify-between items-center" style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border)', fontWeight: 'bold' }}>
                <span>Total</span>
                <span>${receipt.total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center" style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                <span>Paid via {receipt.paymentMethod}</span>
                <span>${receipt.tendered.toFixed(2)}</span>
              </div>
            </div>

            <button className="btn btn-primary w-full" onClick={() => setReceipt(null)}>
              New Sale
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// Minimal ShoppingCart icon missing above
import { ShoppingCart } from 'lucide-react';
