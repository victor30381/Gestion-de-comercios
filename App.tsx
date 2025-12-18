import React, { useState, useEffect } from 'react';
import { auth } from './firebase';
import { onAuthStateChanged, User, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import CalculatorModal from './components/CalculatorModal';
import OrdersModal from './components/OrdersModal';

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isCalculatorOpen, setIsCalculatorOpen] = useState(false);
  const [isOrdersModalOpen, setIsOrdersModalOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<any>(null);
  const [selectedDateForNewOrder, setSelectedDateForNewOrder] = useState<Date | null>(null);
  const [isReadOnly, setIsReadOnly] = useState(false);

  // Auth State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [authError, setAuthError] = useState('');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const toggleCalculator = () => setIsCalculatorOpen(!isCalculatorOpen);
  const toggleOrdersModal = () => {
    setIsOrdersModalOpen(!isOrdersModalOpen);
    if (isOrdersModalOpen) {
      setEditingOrder(null);
      setSelectedDateForNewOrder(null);
    }
  }

  const handleEditOrder = (order: any) => {
    setEditingOrder(order);
    setIsReadOnly(false);
    setIsOrdersModalOpen(true);
  };

  const handleViewOrder = (order: any) => {
    setEditingOrder(order);
    setIsReadOnly(true);
    setIsOrdersModalOpen(true);
  };

  const handleNewOrderWithDate = (date: Date) => {
    setSelectedDateForNewOrder(date);
    setEditingOrder(null);
    setIsReadOnly(false);
    setIsOrdersModalOpen(true);
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    try {
      if (isRegistering) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
    } catch (err: any) {
      setAuthError(err.message || 'Error en autenticación');
    }
  };

  const handleLogout = () => signOut(auth);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-brand-beige text-brand-brown font-serif">Cargando...</div>;
  }

  // LOGIN SCREEN
  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-brand-beige">
        <div className="w-full max-w-md bg-white rounded-3xl shadow-xl p-8 border border-[#E5DCD3]">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-serif font-bold text-brand-brown mb-2">Alternativa Keto</h1>
            <p className="text-stone-500">Gestiona tu pastelería keto con estilo.</p>
          </div>

          <form onSubmit={handleAuth} className="space-y-5">
            <div>
              <label className="block text-sm font-bold text-brand-brown mb-1.5">Email</label>
              <input
                type="email"
                required
                className="w-full p-4 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-brand-accent/50 text-brand-brown bg-brand-cream placeholder-stone-400 transition-all shadow-sm"
                placeholder="nombre@ejemplo.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-brand-brown mb-1.5">Contraseña</label>
              <input
                type="password"
                required
                className="w-full p-4 rounded-xl border border-stone-200 focus:outline-none focus:ring-2 focus:ring-brand-accent/50 text-brand-brown bg-brand-cream placeholder-stone-400 transition-all shadow-sm"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
            </div>

            {authError && <p className="text-red-500 text-center text-sm bg-red-50 p-2 rounded-lg border border-red-100">{authError}</p>}

            <button type="submit" className="w-full bg-brand-brown text-white py-4 rounded-xl font-bold font-serif text-lg shadow-lg shadow-brand-brown/20 hover:bg-[#4A2E21] hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200">
              {isRegistering ? 'Crear Cuenta' : 'Ingresar al Dashboard'}
            </button>
          </form>

          <div className="mt-8 text-center pt-6 border-t border-stone-100">
            <button
              onClick={() => setIsRegistering(!isRegistering)}
              className="text-brand-accent hover:text-brand-brown text-sm font-bold underline transition-colors"
            >
              {isRegistering ? '¿Ya tienes cuenta? Ingresa aquí' : '¿Nuevo usuario? Regístrate gratis'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // MAIN APP
  return (
    <>
      <Layout
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        user={user}
        onLogout={() => signOut(auth)}
        onOpenCalculator={toggleCalculator}
        onOpenOrders={toggleOrdersModal}
      >
        {activeTab === 'dashboard' && <Dashboard userId={user?.uid || ''} onEditOrder={handleEditOrder} onViewOrder={handleViewOrder} onNewOrderWithDate={handleNewOrderWithDate} />}
        {/* Helper logic to keep other tabs valid if needed, though mostly using modals now */}
      </Layout>

      {/* Modals */}
      <CalculatorModal
        isOpen={isCalculatorOpen}
        onClose={() => setIsCalculatorOpen(false)}
        userId={user.uid}
      />

      <OrdersModal
        isOpen={isOrdersModalOpen}
        onClose={() => {
          setIsOrdersModalOpen(false);
          setEditingOrder(null);
          setIsReadOnly(false);
        }}
        userId={user.uid}
        initialOrder={editingOrder}
        isReadOnly={isReadOnly}
        initialDate={selectedDateForNewOrder}
      />
    </>
  );
}

export default App;