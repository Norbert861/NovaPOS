import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const AppContext = createContext(null);

// ── helpers ──────────────────────────────────────────────────────────────────
const read  = (key, fallback) => { try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; } catch { return fallback; } };
const write = (key, value)    => { try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* quota */ } };

// ── seed data ─────────────────────────────────────────────────────────────────
const SEED_PRODUCTS = [
  { id: 'p1', name: 'Pampers Size 1', category: 'Diapers', size: 'Size 1', brand: 'Pampers', price: 12.00, costPrice: 8.00, sku: 'PAM-S1', supplierId: 's1' },
  { id: 'p2', name: 'Pampers Size 2', category: 'Diapers', size: 'Size 2', brand: 'Pampers', price: 13.00, costPrice: 9.00, sku: 'PAM-S2', supplierId: 's1' },
  { id: 'p3', name: 'Pampers Size 3', category: 'Diapers', size: 'Size 3', brand: 'Pampers', price: 14.00, costPrice: 10.00, sku: 'PAM-S3', supplierId: 's1' },
  { id: 'p4', name: 'Pampers Size 4', category: 'Diapers', size: 'Size 4', brand: 'Pampers', price: 15.00, costPrice: 11.00, sku: 'PAM-S4', supplierId: 's1' },
  { id: 'p5', name: 'Huggies Newborn',category: 'Diapers', size: 'Newborn',brand: 'Huggies', price: 11.00, costPrice: 7.50, sku: 'HUG-NB', supplierId: 's2' },
  { id: 'p6', name: 'Huggies Size 3', category: 'Diapers', size: 'Size 3', brand: 'Huggies', price: 14.50, costPrice: 10.50,sku: 'HUG-S3', supplierId: 's2' },
  { id: 'p7', name: 'Baby Wipes (80ct)',category:'Wipes',  size: null,      brand: 'WaterWipes',price:5.50, costPrice:3.00, sku:'WW-80', supplierId:'s2' },
  { id: 'p8', name: 'Baby Wipes (120ct)',category:'Wipes', size: null,      brand: 'WaterWipes',price:7.50, costPrice:4.50, sku:'WW-120',supplierId:'s2' },
  { id: 'p9', name: 'Lavender Baby Soap',category:'Soap', size: null,      brand: 'Johnson\'s', price:3.00, costPrice:1.80, sku:'JBL-SOA',supplierId:'s3' },
  { id:'p10', name: 'Gentle Baby Soap', category:'Soap',  size: null,      brand: 'Dove',       price:3.50, costPrice:2.00, sku:'DOVE-SOA',supplierId:'s3' },
];

const SEED_INVENTORY = [
  { id:'i1', productId:'p1', quantity:45, lowStockThreshold:10, expiryDate:'2026-12-01' },
  { id:'i2', productId:'p2', quantity:30, lowStockThreshold:10, expiryDate:'2026-12-01' },
  { id:'i3', productId:'p3', quantity: 8, lowStockThreshold:10, expiryDate:'2026-11-01' },
  { id:'i4', productId:'p4', quantity:20, lowStockThreshold:10, expiryDate:'2026-12-01' },
  { id:'i5', productId:'p5', quantity: 5, lowStockThreshold:10, expiryDate:'2026-10-01' },
  { id:'i6', productId:'p6', quantity:18, lowStockThreshold:10, expiryDate:'2026-12-01' },
  { id:'i7', productId:'p7', quantity:60, lowStockThreshold:15, expiryDate:null },
  { id:'i8', productId:'p8', quantity:40, lowStockThreshold:15, expiryDate:null },
  { id:'i9', productId:'p9', quantity: 3, lowStockThreshold:10, expiryDate:'2027-06-01' },
  { id:'i10',productId:'p10',quantity:22, lowStockThreshold:10, expiryDate:'2027-06-01' },
];

const SEED_SUPPLIERS = [
  { id:'s1', name:'DiapersGH Distributors', contact:'Kwame Asante', phone:'0244123456', email:'kwame@diapergh.com',    address:'Accra, Ghana' },
  { id:'s2', name:'BabyCare Wholesale',     contact:'Ama Boateng',   phone:'0277654321', email:'ama@babywholesale.com', address:'Kumasi, Ghana' },
  { id:'s3', name:'Hygiene Imports Ltd',    contact:'Kofi Mensah',   phone:'0201987654', email:'kofi@hygienimp.com',   address:'Takoradi, Ghana' },
];

const SEED_USERS = [
  { id:'u1', name:'Sarah Mensah',   email:'sarah@novapos.com',    role:'owner',    pin:'1234' },
  { id:'u2', name:'Jennifer Park',  email:'jennifer@novapos.com', role:'cashier',  pin:'5678' },
  { id:'u3', name:'Kofi Boateng',   email:'kofi@novapos.com',     role:'inventory',pin:'9012' },
];

// Seed 30 days of realistic sale records
function buildSeedSales() {
  const sales = [];
  const now = new Date();
  let saleCounter = 1;
  for (let d = 29; d >= 0; d--) {
    const date = new Date(now);
    date.setDate(now.getDate() - d);
    const txCount = Math.floor(Math.random() * 6) + 2;
    for (let t = 0; t < txCount; t++) {
      const pid = `p${Math.floor(Math.random() * 10) + 1}`;
      const product = SEED_PRODUCTS.find(p => p.id === pid);
      const qty  = Math.floor(Math.random() * 3) + 1;
      const total = product.price * qty;
      sales.push({
        id: `sale${saleCounter++}`,
        date: date.toISOString(),
        cashierId: Math.random() > 0.5 ? 'u2' : 'u1',
        items: [{ productId: pid, productName: product.name, qty, unitPrice: product.price, subtotal: total }],
        total,
        paymentMethod: Math.random() > 0.4 ? 'cash' : 'mobile_money',
        amountPaid: total + (Math.random() > 0.4 ? Math.ceil(total % 5 === 0 ? 0 : 5 - (total % 5)) : 0),
        change: 0,
        status: 'completed',
      });
    }
  }
  return sales;
}

// ── DB init ───────────────────────────────────────────────────────────────────
export function initDB() {
  if (!localStorage.getItem('nova_products'))  write('nova_products',  SEED_PRODUCTS);
  if (!localStorage.getItem('nova_inventory')) write('nova_inventory', SEED_INVENTORY);
  if (!localStorage.getItem('nova_suppliers')) write('nova_suppliers', SEED_SUPPLIERS);
  if (!localStorage.getItem('nova_users'))     write('nova_users',     SEED_USERS);
  if (!localStorage.getItem('nova_sales'))     write('nova_sales',     buildSeedSales());
}

// ── Provider ──────────────────────────────────────────────────────────────────
export function AppProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(() => read('nova_current_user', null));
  const [products,    setProductsState]   = useState(() => read('nova_products',  []));
  const [inventory,   setInventoryState]  = useState(() => read('nova_inventory', []));
  const [suppliers,   setSuppliersState]  = useState(() => read('nova_suppliers', []));
  const [sales,       setSalesState]      = useState(() => read('nova_sales',     []));
  const [users]                           = useState(() => read('nova_users',     []));
  const [sidebarOpen, setSidebarOpen]     = useState(false);

  // Persist on change
  useEffect(() => { write('nova_products',  products);  }, [products]);
  useEffect(() => { write('nova_inventory', inventory); }, [inventory]);
  useEffect(() => { write('nova_suppliers', suppliers); }, [suppliers]);
  useEffect(() => { write('nova_sales',     sales);     }, [sales]);
  useEffect(() => { if (currentUser) write('nova_current_user', currentUser); else localStorage.removeItem('nova_current_user'); }, [currentUser]);

  // ── Auth ────────────────────────────────────────────────────────────────────
  const login = useCallback((email, pin) => {
    const user = users.find(u => u.email === email && u.pin === pin);
    if (user) { setCurrentUser(user); return { ok: true }; }
    return { ok: false, error: 'Invalid email or PIN.' };
  }, [users]);

  const logout = useCallback(() => setCurrentUser(null), []);

  // ── Products ────────────────────────────────────────────────────────────────
  const addProduct = useCallback((product) => {
    const newProduct = { ...product, id: `p${Date.now()}` };
    setProductsState(prev => [...prev, newProduct]);
    // auto-create inventory row
    setInventoryState(prev => [...prev, { id: `i${Date.now()}`, productId: newProduct.id, quantity: 0, lowStockThreshold: 10, expiryDate: null }]);
    return newProduct;
  }, []);

  const updateProduct = useCallback((id, updates) => {
    setProductsState(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
  }, []);

  const deleteProduct = useCallback((id) => {
    setProductsState(prev => prev.filter(p => p.id !== id));
    setInventoryState(prev => prev.filter(i => i.productId !== id));
  }, []);

  // ── Inventory ───────────────────────────────────────────────────────────────
  const updateStock = useCallback((productId, newQuantity, threshold, expiryDate) => {
    setInventoryState(prev => prev.map(i =>
      i.productId === productId
        ? { ...i, quantity: newQuantity, ...(threshold !== undefined && { lowStockThreshold: threshold }), ...(expiryDate !== undefined && { expiryDate }) }
        : i
    ));
  }, []);

  const getStockForProduct = useCallback((productId) => {
    return inventory.find(i => i.productId === productId) || null;
  }, [inventory]);

  const getLowStockItems = useCallback(() => {
    return inventory.filter(i => i.quantity <= i.lowStockThreshold).map(i => ({
      ...i,
      product: products.find(p => p.id === i.productId),
    }));
  }, [inventory, products]);

  // ── Sales ───────────────────────────────────────────────────────────────────
  const processSale = useCallback((cartItems, paymentMethod, amountPaid) => {
    const total = cartItems.reduce((sum, item) => sum + item.subtotal, 0);
    const change = amountPaid - total;
    const newSale = {
      id: `sale${Date.now()}`,
      date: new Date().toISOString(),
      cashierId: currentUser?.id || 'u2',
      items: cartItems,
      total,
      paymentMethod,
      amountPaid,
      change,
      status: 'completed',
    };
    setSalesState(prev => [newSale, ...prev]);
    // Deduct from inventory
    cartItems.forEach(item => {
      setInventoryState(prev => prev.map(i =>
        i.productId === item.productId
          ? { ...i, quantity: Math.max(0, i.quantity - item.qty) }
          : i
      ));
    });
    return newSale;
  }, [currentUser]);

  // ── Suppliers ───────────────────────────────────────────────────────────────
  const addSupplier = useCallback((supplier) => {
    const newSupplier = { ...supplier, id: `s${Date.now()}` };
    setSuppliersState(prev => [...prev, newSupplier]);
    return newSupplier;
  }, []);

  const updateSupplier = useCallback((id, updates) => {
    setSuppliersState(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
  }, []);

  const deleteSupplier = useCallback((id) => {
    setSuppliersState(prev => prev.filter(s => s.id !== id));
  }, []);

  // ── Analytics helpers ────────────────────────────────────────────────────────
  const getSalesByDateRange = useCallback((days = 7) => {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);
    return sales.filter(s => new Date(s.date) >= cutoff);
  }, [sales]);

  const getTodaySales = useCallback(() => {
    const today = new Date().toDateString();
    return sales.filter(s => new Date(s.date).toDateString() === today);
  }, [sales]);

  const getTopProducts = useCallback((days = 7, limit = 5) => {
    const recent = getSalesByDateRange(days);
    const counts = {};
    recent.forEach(sale => {
      sale.items.forEach(item => {
        counts[item.productId] = (counts[item.productId] || 0) + item.qty;
      });
    });
    return Object.entries(counts)
      .map(([productId, qty]) => ({ product: products.find(p => p.id === productId), qty }))
      .filter(x => x.product)
      .sort((a, b) => b.qty - a.qty)
      .slice(0, limit);
  }, [getSalesByDateRange, products]);

  const value = {
    // Auth
    currentUser, login, logout,
    // UI
    sidebarOpen, setSidebarOpen,
    // Data
    products, inventory, suppliers, sales, users,
    // Product actions
    addProduct, updateProduct, deleteProduct,
    // Inventory actions
    updateStock, getStockForProduct, getLowStockItems,
    // Sale actions
    processSale,
    // Supplier actions
    addSupplier, updateSupplier, deleteSupplier,
    // Analytics
    getSalesByDateRange, getTodaySales, getTopProducts,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside <AppProvider>');
  return ctx;
}
