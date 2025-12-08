import { cn } from '../lib/utils';

interface CategoryNavProps {
    categories: { id: string; title: string }[];
    activeCategory: string;
    onSelect: (id: string) => void;
}

export function CategoryNav({ categories, activeCategory, onSelect }: CategoryNavProps) {
    return (
        <div className="sticky top-16 z-40 bg-background/95 backdrop-blur-md border-b border-white/5 py-4">
            <div className="max-w-6xl mx-auto px-4">
                <div className="flex flex-wrap justify-center gap-2">
                    {categories.map((cat) => (
                        <button
                            key={cat.id}
                            onClick={() => onSelect(cat.id)}
                            className={cn(
                                "px-4 py-2 rounded-lg font-medium text-sm transition-all duration-300",
                                activeCategory === cat.id
                                    ? "bg-gradient-to-r from-primary to-accent text-background shadow-lg shadow-primary/20"
                                    : "bg-surface-light text-text-muted hover:text-text hover:bg-surface border border-white/5"
                            )}
                        >
                            {cat.title}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}
