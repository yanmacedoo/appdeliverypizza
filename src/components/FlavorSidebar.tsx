import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { getPizzasByCategory, type Product } from '../data/menu';
import { cn } from '../lib/utils';

interface FlavorSidebarProps {
    onSelectFlavor: (flavor: Product) => void;
    selectedFlavors: Product[];
    disabled?: boolean;
    stepLabel?: string; // "Escolha o Sabor 1" or "Escolha o Sabor 2"
}

export function FlavorSidebar({ onSelectFlavor, selectedFlavors, disabled, stepLabel }: FlavorSidebarProps) {
    const categories = getPizzasByCategory();
    const [openCategory, setOpenCategory] = useState<string>(categories[0]?.category || '');

    const isSelected = (flavorId: string) =>
        selectedFlavors.some(f => f.id === flavorId);

    return (
        <div className="flex flex-col h-full overflow-hidden">
            <h3 className={cn(
                "text-sm font-semibold uppercase tracking-wider mb-3 px-1 shrink-0 transition-colors",
                stepLabel ? "text-primary" : "text-text-muted"
            )}>
                {stepLabel || 'Escolha o Sabor'}
            </h3>

            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
                {categories.map(({ category, items }) => (
                    <div key={category} className="rounded-lg overflow-hidden">
                        {/* Accordion Header */}
                        <button
                            onClick={() => setOpenCategory(openCategory === category ? '' : category)}
                            className={cn(
                                "w-full flex items-center justify-between p-3 text-left transition-all",
                                openCategory === category
                                    ? "bg-primary/20 text-primary"
                                    : "bg-surface-light text-text hover:bg-surface-light/80"
                            )}
                        >
                            <span className="font-medium text-sm">{category}</span>
                            <ChevronDown
                                className={cn(
                                    "w-4 h-4 transition-transform duration-200",
                                    openCategory === category && "rotate-180"
                                )}
                            />
                        </button>

                        {/* Accordion Content */}
                        <div
                            className={cn(
                                "overflow-hidden transition-all duration-300",
                                openCategory === category ? "max-h-[600px]" : "max-h-0"
                            )}
                        >
                            <div className="bg-background p-2 space-y-1">
                                {items.map((flavor) => (
                                    <button
                                        key={flavor.id}
                                        onClick={() => !disabled && onSelectFlavor(flavor)}
                                        disabled={disabled}
                                        className={cn(
                                            "w-full p-3 rounded-lg text-left transition-all",
                                            isSelected(flavor.id)
                                                ? "bg-primary/20 text-primary ring-1 ring-primary/50"
                                                : disabled
                                                    ? "bg-surface-light/50 text-text-muted cursor-not-allowed"
                                                    : "bg-surface-light text-text hover:bg-surface-light/80 hover:scale-[1.01]"
                                        )}
                                    >
                                        <div className="flex items-start justify-between gap-2">
                                            <div className="flex items-start gap-2 min-w-0 flex-1">
                                                {/* Color indicator */}
                                                <div
                                                    className="w-3 h-3 rounded-full shrink-0 mt-1"
                                                    style={{
                                                        backgroundColor: flavor.patternColors?.primary || '#fcc419'
                                                    }}
                                                />
                                                <div className="min-w-0 flex-1">
                                                    <span className="block text-sm font-medium truncate">
                                                        {flavor.name}
                                                    </span>
                                                    {/* Ingredients description */}
                                                    {flavor.description && (
                                                        <span className="block text-xs text-text-muted mt-0.5 line-clamp-2 leading-tight">
                                                            {flavor.description}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            <span className={cn(
                                                "text-xs font-semibold whitespace-nowrap shrink-0",
                                                isSelected(flavor.id) ? "text-primary" : "text-primary/80"
                                            )}>
                                                R$ {flavor.price.toFixed(2).replace('.', ',')}
                                            </span>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
