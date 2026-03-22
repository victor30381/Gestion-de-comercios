import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, query, where, onSnapshot, addDoc, doc, getDoc } from 'firebase/firestore';
import { Recipe } from '../types';

interface CatalogPageProps {
    userId: string;
}

interface CartItem {
    recipe: Recipe;
    quantity: number;
}

const ImageCarousel: React.FC<{ images: string[], alt: string }> = ({ images, alt }) => {
    const [currentIndex, setCurrentIndex] = useState(0);

    if (!images || images.length === 0) {
        return (
            <div className="w-full h-48 warm-gradient-brown flex items-center justify-center">
                <span className="text-5xl opacity-80">🍰</span>
            </div>
        );
    }

    if (images.length === 1) {
        return (
            <div className="w-full aspect-[4/3] overflow-hidden bg-brand-cream/50">
                <img src={images[0]} alt={alt} className="w-full h-full object-cover hover:scale-105 transition-transform duration-700" />
            </div>
        );
    }

    return (
        <div className="relative w-full aspect-[4/3] overflow-hidden group bg-brand-cream/50">
            <img src={images[currentIndex]} alt={alt} className="w-full h-full object-cover animate-fade-in hover:scale-105 transition-transform duration-700" key={currentIndex} />
            
            {/* Arrows */}
            <div className="absolute inset-0 flex items-center justify-between p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button 
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); setCurrentIndex(prev => prev === 0 ? images.length - 1 : prev - 1); }}
                    className="w-8 h-8 rounded-full bg-black/30 backdrop-blur-sm text-white flex items-center justify-center hover:bg-black/50 transition-colors shadow-sm"
                >
                   <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" /></svg>
                </button>
                <button 
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); setCurrentIndex(prev => prev === images.length - 1 ? 0 : prev + 1); }}
                    className="w-8 h-8 rounded-full bg-black/30 backdrop-blur-sm text-white flex items-center justify-center hover:bg-black/50 transition-colors shadow-sm"
                >
                   <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" /></svg>
                </button>
            </div>

            {/* Dots */}
            <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1.5">
                {images.map((_, idx) => (
                    <div key={idx} className={`w-1.5 h-1.5 rounded-full transition-colors shadow-sm ${idx === currentIndex ? 'bg-white scale-125' : 'bg-white/50'}`} />
                ))}
            </div>
        </div>
    );
};

const CatalogPage: React.FC<CatalogPageProps> = ({ userId }) => {
    const [recipes, setRecipes] = useState<Recipe[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [shopName, setShopName] = useState('');
    const [shopLogo, setShopLogo] = useState('');
    const [sections, setSections] = useState<string[]>([]);

    // Cart state
    const [cart, setCart] = useState<CartItem[]>([]);
    const [showCart, setShowCart] = useState(false);

    // Checkout state
    const [showCheckout, setShowCheckout] = useState(false);
    const [clientName, setClientName] = useState('');
    const [clientPhone, setClientPhone] = useState('');
    const [clientAddress, setClientAddress] = useState('');
    const [deliveryDate, setDeliveryDate] = useState('');
    const [deliveryTime, setDeliveryTime] = useState('');
    const [clientNotes, setClientNotes] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [orderSuccess, setOrderSuccess] = useState(false);

    // Fetch shop profile
    useEffect(() => {
        if (!userId) return;
        const fetchProfile = async () => {
            try {
                const profileDoc = await getDoc(doc(db, 'userProfiles', userId));
                if (profileDoc.exists()) {
                    const data = profileDoc.data();
                    setShopName(data.companyName || 'Tienda');
                    setShopLogo(data.logoUrl || '');
                    setSections(data.catalogSections || []);
                }
            } catch (err) {
                console.error('Error fetching profile:', err);
            }
        };
        fetchProfile();
    }, [userId]);

    // Fetch catalog recipes
    useEffect(() => {
        if (!userId) return;
        const q = query(
            collection(db, 'recipes'),
            where('userId', '==', userId),
            where('showInCatalog', '==', true)
        );
        const unsub = onSnapshot(q, (snap) => {
            const data = snap.docs.map(d => ({ id: d.id, ...d.data() } as Recipe));
            data.sort((a, b) => (a.catalogOrder || 999) - (b.catalogOrder || 999) || a.name.localeCompare(b.name));
            setRecipes(data);
            setLoading(false);
            setError(false);
        }, (err) => {
            console.error('Error loading catalog:', err);
            setLoading(false);
            setError(true);
        });
        return () => unsub();
    }, [userId]);

    const cartTotal = cart.reduce((sum, item) => sum + (item.recipe.catalogPrice || 0) * item.quantity, 0);
    const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

    const addToCart = (recipe: Recipe) => {
        setCart(prev => {
            const existing = prev.find(i => i.recipe.id === recipe.id);
            if (existing) {
                return prev.map(i => i.recipe.id === recipe.id ? { ...i, quantity: i.quantity + 1 } : i);
            }
            return [...prev, { recipe, quantity: 1 }];
        });
    };

    const updateQuantity = (recipeId: string, qty: number) => {
        if (qty <= 0) {
            setCart(prev => prev.filter(i => i.recipe.id !== recipeId));
        } else {
            setCart(prev => prev.map(i => i.recipe.id === recipeId ? { ...i, quantity: qty } : i));
        }
    };

    const removeFromCart = (recipeId: string) => {
        setCart(prev => prev.filter(i => i.recipe.id !== recipeId));
    };

    const handleSubmitOrder = async () => {
        if (!clientName.trim()) { alert('Por favor ingresá tu nombre'); return; }
        if (!clientPhone.trim()) { alert('Por favor ingresá tu teléfono'); return; }
        if (!deliveryDate) { alert('Por favor seleccioná una fecha de entrega'); return; }
        if (cart.length === 0) { alert('Tu carrito está vacío'); return; }

        setIsSubmitting(true);
        try {
            const [y, m, d] = deliveryDate.split('-').map(Number);
            const dateObj = new Date(y, m - 1, d);

            const orderItems = cart.map(item => ({
                id: item.recipe.id,
                recipeId: item.recipe.id,
                name: item.recipe.name,
                amount: item.recipe.totalYieldWeight || 0,
                unit: 'un',
                quantity: item.quantity,
                price: item.recipe.catalogPrice || 0,
            }));

            await addDoc(collection(db, 'orders'), {
                userId,
                clientId: '',
                clientName: clientName.trim(),
                items: orderItems,
                deliveryDate: dateObj,
                deliveryTime: deliveryTime || '',
                status: 'pending',
                total: cartTotal,
                deposit: 0,
                createdAt: new Date(),
                source: 'catalog',
                clientPhone: clientPhone.trim(),
                clientAddress: clientAddress.trim(),
                clientNotes: clientNotes.trim(),
                isRead: false,
            });

            setOrderSuccess(true);
            setCart([]);
        } catch (err) {
            console.error('Error submitting order:', err);
            alert('Error al enviar el pedido. Intentá de nuevo.');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Set min date to today
    const today = new Date().toISOString().split('T')[0];

    if (loading) {
        return (
            <div className="min-h-screen warm-gradient-bg flex items-center justify-center">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-brand-brown/20 border-t-brand-brown rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-brand-brown/60 font-medium">Cargando catálogo...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen warm-gradient-bg flex items-center justify-center p-4">
                <div className="glass-card-strong rounded-3xl p-8 max-w-md w-full text-center animate-fade-in-up">
                    <div className="text-5xl mb-4">⚙️</div>
                    <h2 className="text-2xl font-serif font-bold text-brand-brown mb-2">Catálogo en Configuración</h2>
                    <p className="text-brand-brown/70 mb-4">
                        El catálogo se está configurando. Si sos el dueño, actualizá las reglas de Firestore para permitir acceso público al catálogo.
                    </p>
                    <div className="bg-brand-brown/5 rounded-xl p-4 text-left text-xs text-brand-brown/60 font-mono">
                        <p className="mb-1 font-bold text-brand-brown text-sm font-sans">Reglas necesarias:</p>
                        <p>match /recipes/&#123;doc&#125; &#123;</p>
                        <p className="pl-4">allow read: if resource.data.showInCatalog == true;</p>
                        <p>&#125;</p>
                        <p className="mt-1">match /orders/&#123;doc&#125; &#123;</p>
                        <p className="pl-4">allow create: if true;</p>
                        <p>&#125;</p>
                        <p className="mt-1">match /userProfiles/&#123;doc&#125; &#123;</p>
                        <p className="pl-4">allow read: if true;</p>
                        <p>&#125;</p>
                    </div>
                </div>
            </div>
        );
    }

    if (orderSuccess) {
        return (
            <div className="min-h-screen warm-gradient-bg flex items-center justify-center p-4">
                <div className="glass-card-strong rounded-3xl p-8 max-w-md w-full text-center animate-fade-in-up">
                    <div className="text-6xl mb-4">✅</div>
                    <h2 className="text-2xl font-serif font-bold text-brand-brown mb-2">¡Pedido Enviado!</h2>
                    <p className="text-brand-brown/70 mb-6">
                        Tu pedido fue recibido correctamente. {shopName ? `${shopName} se` : 'Se'} pondrá en contacto con vos para confirmar.
                    </p>
                    <div className="bg-brand-brown/5 rounded-xl p-4 mb-6 text-left space-y-1 text-sm text-brand-brown/70">
                        <p><strong>Nombre:</strong> {clientName}</p>
                        <p><strong>Teléfono:</strong> {clientPhone}</p>
                        <p><strong>Fecha:</strong> {deliveryDate.split('-').reverse().join('/')}</p>
                        {deliveryTime && <p><strong>Hora:</strong> {deliveryTime}hs</p>}
                    </div>
                    <button
                        onClick={() => {
                            setOrderSuccess(false);
                            setClientName(''); setClientPhone(''); setClientAddress('');
                            setDeliveryDate(''); setDeliveryTime(''); setClientNotes('');
                            setShowCheckout(false); setShowCart(false);
                        }}
                        className="w-full py-3 warm-gradient-brown text-white font-bold rounded-xl btn-glow"
                    >
                        Hacer Otro Pedido
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen warm-gradient-bg">
            {/* Floating Top Nav / Cart Button */}
            <div className="fixed top-4 right-4 md:top-6 md:right-8 z-40 animate-fade-in-up">
                <button
                    onClick={() => setShowCart(true)}
                    className="relative p-3.5 md:p-4 rounded-2xl bg-white/90 backdrop-blur-xl text-brand-brown shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-white hover:scale-105 hover:shadow-[0_12px_40px_rgb(0,0,0,0.16)] transition-all duration-300 group"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 md:h-7 md:w-7 group-hover:rotate-[15deg] transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
                    </svg>
                    {cartCount > 0 && (
                        <span className="absolute -top-2.5 -right-2.5 w-6 h-6 md:w-7 md:h-7 bg-brand-accent text-white text-[11px] md:text-[13px] font-black rounded-full flex items-center justify-center shadow-md animate-bounce-slow">
                            {cartCount}
                        </span>
                    )}
                </button>
            </div>

            {/* Stunning Hero Section */}
            <header className="relative pt-24 pb-14 md:pt-32 md:pb-24 px-4 overflow-hidden">
                {/* Immersive Decorative Elements */}
                <div className="absolute top-[-20%] left-[-10%] w-96 h-96 bg-brand-accent/20 rounded-full blur-[100px] pointer-events-none mix-blend-multiply"></div>
                <div className="absolute bottom-[-10%] right-[-5%] w-[30rem] h-[30rem] bg-orange-300/20 rounded-full blur-[120px] pointer-events-none mix-blend-multiply"></div>
                <div className="absolute top-[20%] right-[10%] w-32 h-32 bg-yellow-200/40 rounded-full blur-[60px] pointer-events-none"></div>
                
                <div className="max-w-4xl mx-auto flex flex-col items-center text-center relative z-10 animate-fade-in-up">
                    <div className="relative group mb-8 md:mb-10">
                        {/* Majestic Glow Effect */}
                        <div className="absolute -inset-3 bg-gradient-to-tr from-orange-200 via-brand-accent/40 to-yellow-100 rounded-full blur-2xl opacity-60 group-hover:opacity-80 transition duration-700 group-hover:scale-110"></div>
                        <img 
                            src={shopLogo || `${import.meta.env.BASE_URL}logo.png`} 
                            alt="Logo" 
                            className="relative w-40 h-40 md:w-56 md:h-56 rounded-full object-cover border-[6px] md:border-[8px] border-white shadow-[0_20px_50px_rgba(0,0,0,0.15)] bg-white transform transition duration-700 group-hover:scale-105 group-hover:rotate-3" 
                        />
                    </div>
                    
                    <h1 className="text-5xl md:text-7xl lg:text-8xl font-serif font-black text-brand-brown tracking-tighter mb-5 md:mb-6 drop-shadow-sm leading-[1.1] md:leading-[1.05] px-2">
                        {shopName || 'Nuestro Catálogo'}
                    </h1>
                    
                    <div className="h-1.5 md:h-2 w-24 md:w-32 bg-gradient-to-r from-brand-accent to-orange-400 rounded-full mb-6 md:mb-8 opacity-90 shadow-sm"></div>

                    <p className="text-brand-brown/80 uppercase tracking-[0.2em] md:tracking-[0.25em] text-xs md:text-sm font-bold bg-white/70 px-6 py-2.5 md:px-8 md:py-3 rounded-full inline-block backdrop-blur-md shadow-sm border border-white/60">
                        Descubre Nuestra Selección
                    </p>
                </div>
            </header>

            {/* Products Grid */}
            <main className="max-w-6xl mx-auto px-4 py-8 relative z-10">
                {recipes.length === 0 ? (
                    <div className="text-center py-20">
                        <div className="text-5xl mb-4">🍰</div>
                        <h2 className="text-xl font-serif font-bold text-brand-brown mb-2">Catálogo en Preparación</h2>
                        <p className="text-brand-brown/60">Pronto encontrarás nuestros productos aquí.</p>
                    </div>
                ) : (
                    <>
                        {(() => {
                            const groupedRecipes = new Map<string, Recipe[]>();
                            const unassigned: Recipe[] = [];

                            sections.forEach(sec => groupedRecipes.set(sec, []));

                            recipes.forEach(recipe => {
                                const sec = recipe.catalogSection;
                                if (sec && groupedRecipes.has(sec)) {
                                    groupedRecipes.get(sec)!.push(recipe);
                                } else if (sec) {
                                    if (!groupedRecipes.has(sec)) groupedRecipes.set(sec, []);
                                    groupedRecipes.get(sec)!.push(recipe);
                                } else {
                                    unassigned.push(recipe);
                                }
                            });

                            const sectionsToRender = Array.from(groupedRecipes.entries()).filter(([_, group]) => group.length > 0);
                            
                            if (unassigned.length > 0) {
                                if (sectionsToRender.length === 0) {
                                    sectionsToRender.push(['Nuestros Productos', unassigned]);
                                } else {
                                    sectionsToRender.push(['Otros Productos', unassigned]);
                                }
                            }

                            return (
                                <div className="space-y-16">
                                    {sectionsToRender.map(([sectionName, groupRecipes]) => (
                                        <div key={sectionName}>
                                            <div className="flex items-center justify-center gap-6 mb-8">
                                                <div className="h-px bg-brand-brown/20 flex-1 md:flex-none md:w-24"></div>
                                                <h2 className="text-2xl md:text-3xl font-serif font-bold text-brand-brown uppercase tracking-widest text-center">{sectionName}</h2>
                                                <div className="h-px bg-brand-brown/20 flex-1 md:flex-none md:w-24"></div>
                                            </div>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                                {groupRecipes.map(recipe => {
                                                    const inCart = cart.find(i => i.recipe.id === recipe.id);
                                                    return (
                                    <div key={recipe.id} className="glass-card rounded-2xl overflow-hidden card-hover-lift transition-all duration-300 flex flex-col">
                                        <ImageCarousel 
                                            images={recipe.catalogImages && recipe.catalogImages.length > 0 ? recipe.catalogImages : (recipe.catalogImage ? [recipe.catalogImage] : [])} 
                                            alt={recipe.name} 
                                        />

                                        <div className="p-5 flex flex-col flex-1">
                                            <h3 className="font-serif font-bold text-lg text-brand-brown mb-1">{recipe.name}</h3>
                                            {recipe.catalogDescription && (
                                                <p className="text-sm text-brand-brown/60 mb-3 line-clamp-2">{recipe.catalogDescription}</p>
                                            )}

                                            {/* Nutritional info pills */}
                                            {recipe.nutritionalInfo && (recipe.portionWeight || 0) > 0 && (
                                                <div className="flex flex-wrap gap-1.5 mb-3">
                                                    {(() => {
                                                        const factor = recipe.portionWeight / recipe.totalYieldWeight;
                                                        const cal = Math.round((recipe.nutritionalInfo?.calories || 0) * factor);
                                                        const prot = Math.round((recipe.nutritionalInfo?.protein || 0) * factor);
                                                        const carbs = Math.round((recipe.nutritionalInfo?.carbs || 0) * factor);
                                                        const fat = Math.round((recipe.nutritionalInfo?.fat || 0) * factor);
                                                        return (
                                                            <>
                                                                <span className="text-[10px] bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full font-bold">{cal} kcal</span>
                                                                <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-bold">P: {prot}g</span>
                                                                <span className="text-[10px] bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full font-bold">C: {carbs}g</span>
                                                                <span className="text-[10px] bg-red-100 text-red-700 px-2 py-0.5 rounded-full font-bold">G: {fat}g</span>
                                                            </>
                                                        );
                                                    })()}
                                                    <span className="text-[10px] bg-brand-brown/10 text-brand-brown px-2 py-0.5 rounded-full font-bold">porción {recipe.portionWeight}g</span>
                                                </div>
                                            )}

                                            {recipe.conservation && (
                                                <p className="text-[11px] text-brand-brown/50 mb-3 flex items-center gap-1">
                                                    <span>❄️</span> {recipe.conservation}
                                                </p>
                                            )}

                                            <div className="mt-auto flex items-center justify-between pt-3 border-t border-brand-brown/10">
                                                <span className="text-2xl font-bold text-brand-brown">${recipe.catalogPrice?.toLocaleString() || '0'}</span>
                                                {inCart ? (
                                                    <div className="flex items-center gap-2 bg-brand-brown/5 rounded-xl p-1">
                                                        <button
                                                            onClick={() => updateQuantity(recipe.id, inCart.quantity - 1)}
                                                            className="w-8 h-8 rounded-lg bg-white text-brand-brown font-bold shadow-sm hover:bg-brand-brown/10 transition-colors flex items-center justify-center"
                                                        >−</button>
                                                        <span className="w-6 text-center font-bold text-brand-brown">{inCart.quantity}</span>
                                                        <button
                                                            onClick={() => updateQuantity(recipe.id, inCart.quantity + 1)}
                                                            className="w-8 h-8 rounded-lg bg-white text-brand-brown font-bold shadow-sm hover:bg-brand-brown/10 transition-colors flex items-center justify-center"
                                                        >+</button>
                                                    </div>
                                                ) : (
                                                    <button
                                                        onClick={() => addToCart(recipe)}
                                                        className="py-2 px-4 warm-gradient-brown text-white text-sm font-bold rounded-xl hover:opacity-90 transition-opacity btn-glow"
                                                    >
                                                        Agregar
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                                                })}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            );
                        })()}
                    </>
                )}
            </main>

            {/* Floating cart button (mobile) */}
            {cartCount > 0 && !showCart && !showCheckout && (
                <div className="fixed bottom-6 left-4 right-4 z-30 md:hidden">
                    <button
                        onClick={() => setShowCart(true)}
                        className="w-full py-4 warm-gradient-brown text-white font-bold rounded-2xl shadow-xl flex items-center justify-center gap-3 btn-glow"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
                        </svg>
                        Ver Carrito ({cartCount}) · ${cartTotal.toLocaleString()}
                    </button>
                </div>
            )}

            {/* Cart Slide-over */}
            {showCart && (
                <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-sm animate-fade-in" onClick={() => setShowCart(false)}>
                    <div
                        className="w-full max-w-md bg-white/95 backdrop-blur-xl h-full shadow-2xl flex flex-col animate-fade-in-up"
                        onClick={e => e.stopPropagation()}
                    >
                        {/* Cart Header */}
                        <div className="p-4 border-b border-brand-brown/10 flex items-center justify-between">
                            <h2 className="text-xl font-serif font-bold text-brand-brown">Tu Pedido</h2>
                            <button onClick={() => setShowCart(false)} className="p-2 rounded-full hover:bg-brand-brown/10 text-brand-brown">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {/* Cart Items */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-3">
                            {cart.length === 0 ? (
                                <div className="text-center py-12 text-brand-brown/40">
                                    <div className="text-4xl mb-3">🛒</div>
                                    <p className="font-medium">Tu carrito está vacío</p>
                                    <p className="text-sm">Agregá productos del catálogo</p>
                                </div>
                            ) : (
                                cart.map(item => (
                                    <div key={item.recipe.id} className="flex items-center gap-3 bg-brand-brown/5 rounded-xl p-3">
                                        <div className="w-14 h-14 rounded-lg overflow-hidden flex-shrink-0 bg-white/80 border border-brand-brown/10">
                                            {item.recipe.catalogImages && item.recipe.catalogImages.length > 0 ? (
                                                <img src={item.recipe.catalogImages[0]} alt="" className="w-full h-full object-contain p-0.5" />
                                            ) : item.recipe.catalogImage ? (
                                                <img src={item.recipe.catalogImage} alt="" className="w-full h-full object-contain p-0.5" />
                                            ) : (
                                                <div className="w-full h-full warm-gradient-brown flex items-center justify-center text-xl">🍰</div>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-bold text-sm text-brand-brown truncate">{item.recipe.name}</h4>
                                            <p className="text-xs text-brand-brown/60">${item.recipe.catalogPrice?.toLocaleString()} c/u</p>
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <button onClick={() => updateQuantity(item.recipe.id, item.quantity - 1)} className="w-7 h-7 rounded-lg bg-white text-brand-brown font-bold text-sm shadow-sm hover:bg-brand-brown/10 flex items-center justify-center">−</button>
                                            <span className="w-5 text-center text-sm font-bold text-brand-brown">{item.quantity}</span>
                                            <button onClick={() => updateQuantity(item.recipe.id, item.quantity + 1)} className="w-7 h-7 rounded-lg bg-white text-brand-brown font-bold text-sm shadow-sm hover:bg-brand-brown/10 flex items-center justify-center">+</button>
                                        </div>
                                        <button onClick={() => removeFromCart(item.recipe.id)} className="p-1 text-red-400 hover:text-red-600">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                            </svg>
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Cart Footer */}
                        {cart.length > 0 && (
                            <div className="p-4 border-t border-brand-brown/10 bg-brand-cream/30 space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className="font-bold text-brand-brown">Total:</span>
                                    <span className="text-2xl font-bold text-brand-brown">${cartTotal.toLocaleString()}</span>
                                </div>
                                <button
                                    onClick={() => { setShowCart(false); setShowCheckout(true); }}
                                    className="w-full py-3.5 warm-gradient-brown text-white font-bold rounded-xl btn-glow text-lg"
                                >
                                    Continuar con el Pedido
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Checkout Modal */}
            {showCheckout && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-md animate-fade-in">
                    <div className="w-full max-w-lg glass-card-strong rounded-3xl shadow-2xl flex flex-col max-h-[90vh] animate-fade-in-up">
                        {/* Header */}
                        <div className="p-5 border-b border-brand-brown/10 flex items-center justify-between">
                            <h2 className="text-xl font-serif font-bold text-brand-brown">Completar Pedido</h2>
                            <button onClick={() => setShowCheckout(false)} className="p-2 rounded-full hover:bg-brand-brown/10 text-brand-brown">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {/* Form */}
                        <div className="flex-1 overflow-y-auto p-5 space-y-4">
                            {/* Order Summary */}
                            <div className="bg-brand-brown/5 rounded-xl p-4 space-y-2">
                                <h3 className="text-sm font-bold text-brand-brown mb-2">Resumen del Pedido</h3>
                                {cart.map(item => (
                                    <div key={item.recipe.id} className="flex justify-between text-sm text-brand-brown/70">
                                        <span>{item.quantity}x {item.recipe.name}</span>
                                        <span className="font-medium">${((item.recipe.catalogPrice || 0) * item.quantity).toLocaleString()}</span>
                                    </div>
                                ))}
                                <div className="border-t border-brand-brown/10 pt-2 flex justify-between font-bold text-brand-brown">
                                    <span>Total</span>
                                    <span>${cartTotal.toLocaleString()}</span>
                                </div>
                            </div>

                            {/* Client info */}
                            <div>
                                <label className="block text-sm font-bold text-brand-brown mb-1">Nombre *</label>
                                <input
                                    type="text"
                                    value={clientName}
                                    onChange={e => setClientName(e.target.value)}
                                    className="w-full p-3 rounded-xl border border-brand-brown/20 focus:ring-2 focus:ring-brand-accent/50 outline-none bg-white"
                                    placeholder="Tu nombre completo"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-brand-brown mb-1">Teléfono *</label>
                                <input
                                    type="tel"
                                    value={clientPhone}
                                    onChange={e => setClientPhone(e.target.value)}
                                    className="w-full p-3 rounded-xl border border-brand-brown/20 focus:ring-2 focus:ring-brand-accent/50 outline-none bg-white"
                                    placeholder="Ej. 11-2345-6789"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-brand-brown mb-1">Dirección <span className="font-normal text-brand-brown/50">(opcional)</span></label>
                                <input
                                    type="text"
                                    value={clientAddress}
                                    onChange={e => setClientAddress(e.target.value)}
                                    className="w-full p-3 rounded-xl border border-brand-brown/20 focus:ring-2 focus:ring-brand-accent/50 outline-none bg-white"
                                    placeholder="Tu dirección de entrega"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-sm font-bold text-brand-brown mb-1">Fecha de Entrega *</label>
                                    <input
                                        type="date"
                                        value={deliveryDate}
                                        onChange={e => setDeliveryDate(e.target.value)}
                                        min={today}
                                        className="w-full p-3 rounded-xl border border-brand-brown/20 focus:ring-2 focus:ring-brand-accent/50 outline-none bg-white"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-brand-brown mb-1">Hora <span className="font-normal text-brand-brown/50">(opcional)</span></label>
                                    <input
                                        type="time"
                                        value={deliveryTime}
                                        onChange={e => setDeliveryTime(e.target.value)}
                                        className="w-full p-3 rounded-xl border border-brand-brown/20 focus:ring-2 focus:ring-brand-accent/50 outline-none bg-white"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-brand-brown mb-1">Notas <span className="font-normal text-brand-brown/50">(opcional)</span></label>
                                <textarea
                                    value={clientNotes}
                                    onChange={e => setClientNotes(e.target.value)}
                                    className="w-full p-3 rounded-xl border border-brand-brown/20 focus:ring-2 focus:ring-brand-accent/50 outline-none bg-white resize-none"
                                    rows={2}
                                    placeholder="Ej. Sin frutos secos, con dedicatoria..."
                                />
                            </div>
                        </div>

                        {/* Submit */}
                        <div className="p-5 border-t border-brand-brown/10 flex gap-3">
                            <button
                                onClick={() => { setShowCheckout(false); setShowCart(true); }}
                                className="px-5 py-3 border border-brand-brown/20 rounded-xl text-brand-brown font-bold hover:bg-brand-brown/5 transition-colors"
                            >
                                Volver
                            </button>
                            <button
                                onClick={handleSubmitOrder}
                                disabled={isSubmitting}
                                className="flex-1 py-3 warm-gradient-brown text-white font-bold rounded-xl btn-glow disabled:opacity-50 text-lg"
                            >
                                {isSubmitting ? 'Enviando...' : `Enviar Pedido · $${cartTotal.toLocaleString()}`}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CatalogPage;
