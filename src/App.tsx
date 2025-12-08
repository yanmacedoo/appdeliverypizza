import { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { CategoryNav } from './components/CategoryNav';
import { ProductCard } from './components/ProductCard';
import { PizzaModal } from './components/PizzaModal';
import { CartSidebar } from './components/CartSidebar';
import { CheckoutModal } from './components/CheckoutModal';
import { menu, type Product } from './data/menu';
import { ChevronDown, Flame } from 'lucide-react';

function App() {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState(menu[0]?.id || '');

  // Special marker to open pizza builder without pre-selected flavor
  // We use an empty object with just the type to trigger the modal
  const PIZZA_BUILDER_MARKER = { id: '__builder__', type: 'pizza' as const } as Product;

  const openPizzaBuilder = () => {
    setSelectedProduct(PIZZA_BUILDER_MARKER);
  };

  const categories = menu.map(cat => ({ id: cat.id, title: cat.title }));

  const scrollToCategory = (id: string) => {
    setActiveCategory(id);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

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
  }, []);

  return (
    <div className="min-h-screen bg-background relative z-10">
      <Header onOpenCart={() => setIsCartOpen(true)} />

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
        categories={categories}
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
              {category.items.map((product, index) => (
                <div
                  key={product.id}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <ProductCard
                    product={product}
                    onSelect={setSelectedProduct}
                  />
                </div>
              ))}
            </div>
          </section>
        ))}
      </main>

      {/* Footer */}
      <footer className="bg-surface py-12 border-t border-white/5 mt-12">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Flame className="w-6 h-6 text-secondary" />
            <span className="font-display text-2xl text-primary">FOME DE PIZZA</span>
            <Flame className="w-6 h-6 text-secondary" />
          </div>
          <p className="text-text-muted text-sm mb-2">Pizza Grande (8 fatias) • Até 2 sabores por pizza</p>
          <p className="text-text-muted text-sm">Entrega GRÁTIS para pedidos acima de R$ 100,00</p>
          <div className="mt-6 pt-6 border-t border-white/10">
            <p className="text-text-muted text-xs">&copy; {new Date().getFullYear()} Fome de Pizza. Todos os direitos reservados.</p>

            {/* Desenvolvido por Nuscorre */}
            <a
              href="https://nuscorre.com.br"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 flex items-center justify-center gap-2 hover:opacity-80 transition-opacity"
            >
              <span className="text-text-muted text-xs">Desenvolvido por</span>
              <img
                src="/nuscorre-logo.png"
                alt="Nuscorre"
                className="h-6 w-auto"
              />
            </a>
          </div>
        </div>
      </footer>

      {/* Modals & Drawers */}
      {selectedProduct && (
        <PizzaModal
          product={selectedProduct}
          isOpen={!!selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />
      )}

      <CartSidebar
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        onCheckout={() => {
          setIsCartOpen(false);
          setIsCheckoutOpen(true);
        }}
      />

      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
      />
    </div>
  );
}

export default App;
