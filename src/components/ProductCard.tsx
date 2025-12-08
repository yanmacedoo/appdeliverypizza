import { Plus } from 'lucide-react';
import { type Product } from '../data/menu';

interface ProductCardProps {
    product: Product;
    onSelect: (product: Product) => void;
}

export function ProductCard({ product, onSelect }: ProductCardProps) {
    return (
        <div
            className="group glass-card overflow-hidden cursor-pointer transition-all duration-500 hover:scale-[1.02] hover:fire-glow animate-[slide-up_0.5s_ease-out]"
            onClick={() => onSelect(product)}
            style={{ animationFillMode: 'both' }}
        >
            {/* Image Container */}
            <div className="h-44 overflow-hidden relative">
                <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent opacity-80" />

                {/* Price Badge */}
                <div className="absolute bottom-3 right-3 bg-primary/90 backdrop-blur-sm text-background font-bold px-3 py-1 rounded-lg text-sm shadow-lg">
                    R$ {product.price.toFixed(2).replace('.', ',')}
                </div>
            </div>

            {/* Content */}
            <div className="p-4">
                <h3 className="text-lg font-bold text-text group-hover:text-primary transition-colors duration-300 leading-tight mb-2">
                    {product.name}
                </h3>

                {product.description && (
                    <p className="text-sm text-text-muted line-clamp-2 mb-4">
                        {product.description}
                    </p>
                )}

                {/* Add Button */}
                <button
                    className="w-full btn-fire py-2.5 flex items-center justify-center gap-2 text-sm"
                    onClick={(e) => {
                        e.stopPropagation();
                        onSelect(product);
                    }}
                >
                    <Plus className="w-4 h-4" />
                    Adicionar
                </button>
            </div>
        </div>
    );
}
