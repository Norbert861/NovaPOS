import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { ref, onValue, set, push, remove, update, serverTimestamp } from 'firebase/database';
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  signOut 
} from 'firebase/auth';
import { auth, db } from '../lib/firebase';

const AppContext = createContext(null);

// ── seed data (as fallback/initial) ──────────────────────────────────────────
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

// Realistic sale records seed
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

// ── DB init (Helper to seed Firebase once) ───────────────────────────────────
export async function initDB() {
  const productsRef = ref(db, 'products');
  onValue(productsRef, (snapshot) => {
    if (!snapshot.exists()) {
      // Seed if empty
      SEED_PRODUCTS.forEach(p => set(ref(db, `products/${p.id}`), p));
      SEED_INVENTORY.forEach(i => set(ref(db, `inventory/${i.id}`), i));
      SEED_SUPPLIERS.forEach(s => set(ref(db, `suppliers/${s.id}`), s));
      SEED_USERS.forEach(u => set(ref(db, `users/${u.id}`), u));
      // Sales might be too many for individual set calls, but okay for seed
      buildSeedSales().forEach(s => set(ref(db, `sales/${s.id}`), s));
    }
  }, { onlyOnce: true });
}

// ── Provider ──────────────────────────────────────────────────────────────────
export function AppProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [products,    setProducts]    = useState([]);
  const [inventory,   setInventory]   = useState([]);
  const [suppliers,   setSuppliers]   = useState([]);
  const [sales,       setSales]       = useState([]);
  const [users,       setUsers]       = useState([]);
  const [isLoading,   setIsLoading]   = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Sync Auth
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // Fetch user details from RTDB
        const userRef = ref(db, `users/${user.uid.substring(0, 10)}`); // Simplified mapping
        onValue(userRef, (snapshot) => {
          if (snapshot.exists()) {
            setCurrentUser(snapshot.val());
          } else {
            // Fallback for new users or if mapping doesn't exist
            setCurrentUser({ email: user.email, role: 'cashier', name: user.email.split('@')[0] });
          }
        });
      } else {
        setCurrentUser(null);
      }
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Sync Data
  useEffect(() => {
    const unsubProducts = onValue(ref(db, 'products'), (snap) => setProducts(snap.exists() ? Object.values(snap.val()) : []));
    const unsubInventory = onValue(ref(db, 'inventory'), (snap) => setInventory(snap.exists() ? Object.values(snap.val()) : []));
    const unsubSuppliers = onValue(ref(db, 'suppliers'), (snap) => setSuppliers(snap.exists() ? Object.values(snap.val()) : []));
    const unsubSales = onValue(ref(db, 'sales'), (snap) => {
      const data = snap.exists() ? Object.values(snap.val()) : [];
      setSales(data.sort((a,b) => new Date(b.date) - new Date(a.date)));
    });
    const unsubUsers = onValue(ref(db, 'users'), (snap) => setUsers(snap.exists() ? Object.values(snap.val()) : []));

    return () => {
      unsubProducts();
      unsubInventory();
      unsubSuppliers();
      unsubSales();
      unsubUsers();
    };
  }, []);

  // ── Auth ────────────────────────────────────────────────────────────────────
  const login = useCallback(async (email, pin) => {
    try {
      // Functional POS systems often use PINs but Firebase Auth uses passwords.
      // For this "functional" upgrade, we'll try to find the user by email/pin in RTDB
      // AND use a secret password for Firebase Auth, or just mock the Firebase Auth logic.
      // Better: Use Firebase Auth with email and the PIN as password (if PINs are unique enough).
      const result = await signInWithEmailAndPassword(auth, email, pin + "novapos_secret"); 
      return { ok: true };
    } catch (error) {
      // Fallback: Check if user exists in RTDB with that PIN for initial "functional" test
      const user = users.find(u => u.email === email && u.pin === pin);
      if (user) {
        setCurrentUser(user);
        return { ok: true };
      }
      return { ok: false, error: 'Invalid email or PIN.' };
    }
  }, [users]);

  const logout = useCallback(() => signOut(auth).then(() => setCurrentUser(null)), []);

  // ── Products ────────────────────────────────────────────────────────────────
  const addProduct = useCallback(async (product) => {
    const newId = `p${Date.now()}`;
    const newProduct = { ...product, id: newId };
    await set(ref(db, `products/${newId}`), newProduct);
    // auto-create inventory row
    const inventoryId = `i${Date.now()}`;
    await set(ref(db, `inventory/${inventoryId}`), { id: inventoryId, productId: newId, quantity: 0, lowStockThreshold: 10, expiryDate: null });
    return newProduct;
  }, []);

  const updateProduct = useCallback(async (id, updates) => {
    await update(ref(db, `products/${id}`), updates);
  }, []);

  const deleteProduct = useCallback(async (id) => {
    await remove(ref(db, `products/${id}`));
    // Also remove from inventory
    const item = inventory.find(i => i.productId === id);
    if (item) await remove(ref(db, `inventory/${item.id}`));
  }, [inventory]);

  // ── Inventory ───────────────────────────────────────────────────────────────
  const updateStock = useCallback(async (productId, newQuantity, threshold, expiryDate) => {
    const item = inventory.find(i => i.productId === productId);
    if (item) {
      const updates = { quantity: newQuantity };
      if (threshold !== undefined) updates.lowStockThreshold = threshold;
      if (expiryDate !== undefined) updates.expiryDate = expiryDate;
      await update(ref(db, `inventory/${item.id}`), updates);
    }
  }, [inventory]);

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
  const processSale = useCallback(async (cartItems, paymentMethod, amountPaid) => {
    const total = cartItems.reduce((sum, item) => sum + item.subtotal, 0);
    const change = amountPaid - total;
    const saleId = `sale${Date.now()}`;
    const newSale = {
      id: saleId,
      date: new Date().toISOString(),
      cashierId: currentUser?.id || 'u2',
      items: cartItems,
      total,
      paymentMethod,
      amountPaid,
      change,
      status: 'completed',
    };
    
    await set(ref(db, `sales/${saleId}`), newSale);

    // Deduct from inventory
    for (const item of cartItems) {
      const invItem = inventory.find(i => i.productId === item.productId);
      if (invItem) {
        await update(ref(db, `inventory/${invItem.id}`), {
          quantity: Math.max(0, invItem.quantity - item.qty)
        });
      }
    }
    return newSale;
  }, [currentUser, inventory]);

  // ── Suppliers ───────────────────────────────────────────────────────────────
  const addSupplier = useCallback(async (supplier) => {
    const id = `s${Date.now()}`;
    const newSupplier = { ...supplier, id };
    await set(ref(db, `suppliers/${id}`), newSupplier);
    return newSupplier;
  }, []);

  const updateSupplier = useCallback(async (id, updates) => {
    await update(ref(db, `suppliers/${id}`), updates);
  }, []);

  const deleteSupplier = useCallback(async (id) => {
    await remove(ref(db, `suppliers/${id}`));
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
    currentUser, login, logout, isLoading,
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
