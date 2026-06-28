import { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { CategoryNav } from './components/CategoryNav';
import { ProductCard } from './components/ProductCard';
import { PizzaModal } from './components/PizzaModal';
import { DrinkModal } from './components/DrinkModal';
import { CartSidebar } from './components/CartSidebar';
import { CookieConsent } from './components/CookieConsent';
import { CheckoutModal } from './components/CheckoutModal';
import { InstallPrompt } from './components/InstallPrompt';
import { PaymentSuccessModal } from './components/PaymentSuccessModal';


import { type Product } from './data/menu';
import { useMenuStore } from './store/menuStore';
import { subscribeToStoreStatus } from './services/storeService';
import { ChevronDown, Flame, XCircle } from 'lucide-react';
import { Footer } from './components/Footer';

function App() {
  // Use menu from store (synced with Firebase)
  const { categories: menu, initializeFromFirebase } = useMenuStore();

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedDrink, setSelectedDrink] = useState<Product | null>(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState(menu[0]?.id || '');
  const [isStoreOpen, setIsStoreOpen] = useState(true);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(() => {
    const searchParams = new URLSearchParams(window.location.search);
    return searchParams.has('session_id') && searchParams.has('order_id');
  });

  // Handle product selection - route to appropriate modal
  const handleProductSelect = useCallback((product: Product) => {
    // Only show drink selection for "Refrigerante 1L"
    if (product.type === 'drink' && product.name.toLowerCase().includes('refrigerante')) {
      setSelectedDrink(product);
    } else if (product.type === 'pizza') {
      setSelectedProduct(product);
    } else {
      // Other drinks - add directly to cart
      import('./store/cartStore').then(({ useCartStore }) => {
        useCartStore.getState().addItem({
          productId: product.id,
          name: product.name,
          price: product.price,
          quantity: 1,
          type: 'drink',
        });
      });
    }
  }, []);

  // Initialize menu from Firebase on mount
  useEffect(() => {
    const unsubscribe = initializeFromFirebase();
    return () => unsubscribe();
  }, [initializeFromFirebase]);

  // Subscribe to store open/close status
  useEffect(() => {
    const unsubscribe = subscribeToStoreStatus((status) => {
      setIsStoreOpen(status.isOpen);
    });
    return () => unsubscribe();
  }, []);

  // Special marker to open pizza builder without pre-selected flavor
  const PIZZA_BUILDER_MARKER = { id: '__builder__', type: 'pizza' as const } as Product;

  const openPizzaBuilder = () => {
    setSelectedProduct(PIZZA_BUILDER_MARKER);
  };

  const scrollToCategory = useCallback((id: string) => {
    setActiveCategory(id);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, []);

  // Update active category on scroll
  useEffect(() => {
    const handleScroll = () => {
      const sections = menu.map(cat => ({
        id: cat.id,
        el: document.getElementById(cat.id)
      }));

      for (const section of sections) {
        if (section.el) {
          const rect = section.el.getBoundingClientRect();
          if (rect.top <= 150 && rect.bottom >= 150) {
            setActiveCategory(section.id);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [menu]);

  // Memoize stable handlers to prevent re-renders of modals
  const handleClosePizzaModal = useCallback(() => setSelectedProduct(null), []);
  const handleCloseDrinkModal = useCallback(() => setSelectedDrink(null), []);
  const handleCloseCart = useCallback(() => setIsCartOpen(false), []);
  const handleCloseCheckout = useCallback(() => setIsCheckoutOpen(false), []);
  const handleOpenCheckout = useCallback(() => {
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  }, []);

  return (
    <div className="min-h-screen bg-background relative z-10">
      <Header onOpenCart={() => {
        if (isStoreOpen) {
          setIsCartOpen(true);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      }} />

      {/* Store Closed Banner */}
      {!isStoreOpen && (
        <div className="bg-red-500/90 text-white py-3 px-4 text-center sticky top-16 z-40">
          <div className="flex items-center justify-center gap-2">
            <XCircle className="w-5 h-5" />
            <span className="font-bold">Estamos fechados no momento</span>
          </div>
          <p className="text-sm text-white/80 mt-1">Volte mais tarde para fazer seu pedido</p>
        </div>
      )}

      {/* Hero Section */}
      <section className="relative h-[70vh] min-h-[500px] flex items-center justify-center overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?q=80&w=2000&auto=format&fit=crop"
            alt="Pizza Background"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/80 to-background" />
        </div>

        {/* Content */}
        <div className="relative z-10 text-center px-4 max-w-3xl mx-auto">
          {/* Logo Grande */}
          <img
            src="/images/logo-hero.png"
            alt="Fome de Pizza"
            className="w-40 h-40 mx-auto mb-4 mt-16 object-contain animate-[fade-in_0.5s_ease-out]"
          />

          <div className="flex items-center justify-center gap-2 mb-4">
            <Flame className="w-8 h-8 text-secondary animate-pulse" />
            <span className="text-text-muted uppercase tracking-widest text-sm">Delivery de Pizza</span>
            <Flame className="w-8 h-8 text-secondary animate-pulse" />
          </div>

          <h1 className="font-display text-6xl sm:text-7xl md:text-8xl tracking-wider mb-4 animate-[fade-in_0.8s_ease-out]">
            <span className="text-text">FOME DE </span>
            <span className="text-primary text-glow">PIZZA?</span>
          </h1>

          <p className="text-text-muted text-lg md:text-xl max-w-xl mx-auto mb-8 animate-[fade-in_1s_ease-out]">
            As melhores pizzas da região, feitas com ingredientes selecionados e muito amor.
            Peça agora e receba quentinha!
          </p>

          <button
            onClick={openPizzaBuilder}
            className="btn-fire px-8 py-4 text-lg inline-flex items-center gap-2 animate-[slide-up_1s_ease-out]"
          >
            Monte sua Pizza
            <ChevronDown className="w-5 h-5 animate-bounce" />
          </button>
        </div>

        {/* Decorative Elements */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
      </section>

      {/* Category Navigation */}
      <CategoryNav
        categories={menu.map(cat => ({ id: cat.id, title: cat.title }))}
        activeCategory={activeCategory}
        onSelect={scrollToCategory}
      />

      {/* Menu Sections */}
      <main className="max-w-6xl mx-auto px-4 py-8 space-y-16">
        {menu.map((category) => (
          <section
            key={category.id}
            id={category.id}
            className="scroll-mt-32"
          >
            {/* Category Header */}
            <div className="mb-8">
              <h2 className="font-display text-4xl md:text-5xl text-text tracking-wider uppercase">
                {category.title}
              </h2>
              <div className="h-1 w-24 bg-gradient-to-r from-primary to-accent rounded-full mt-3" />
            </div>

            {/* Products Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {category.items
                .filter(product => product.available !== false)
                .map((product, index) => (
                  <div
                    key={product.id}
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <ProductCard
                      product={product}
                      onSelect={handleProductSelect}
                    />
                  </div>
                ))}
            </div>
          </section>
        ))}
      </main>

      {/* Footer */}
      <Footer />

      {/* Modals & Drawers */}
      {selectedProduct && (
        <PizzaModal
          product={selectedProduct}
          isOpen={!!selectedProduct}
          onClose={handleClosePizzaModal}
        />
      )}

      {selectedDrink && (
        <DrinkModal
          product={selectedDrink}
          isOpen={!!selectedDrink}
          onClose={handleCloseDrinkModal}
        />
      )}

      <CartSidebar
        isOpen={isCartOpen}
        onClose={handleCloseCart}
        onCheckout={handleOpenCheckout}
      />

      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={handleCloseCheckout}
      />

      {isSuccessModalOpen && (
        <PaymentSuccessModal
          onClose={() => setIsSuccessModalOpen(false)}
        />
      )}

      <InstallPrompt />
      <CookieConsent />
    </div>
  );
}

export default App;
