import { useState, useMemo } from 'react';
import { Pizza, Utensils, Check, RotateCcw } from 'lucide-react';
import { PizzaVisual } from './PizzaVisual';
import { FlavorSidebar } from './FlavorSidebar';
import { type Product } from '../data/menu';
import { useCartStore } from '../store/cartStore';
import { cn } from '../lib/utils';

interface PizzaBuilderProps {
    initialFlavor?: Product;
    onClose: () => void;
}

export function PizzaBuilder({ initialFlavor, onClose }: PizzaBuilderProps) {
    const addItem = useCartStore((state) => state.addItem);

    const [mode, setMode] = useState<'inteira' | 'meia'>('inteira');
    const [step, setStep] = useState<1 | 2>(1);
    const [leftFlavor, setLeftFlavor] = useState<Product | null>(initialFlavor || null);
    const [rightFlavor, setRightFlavor] = useState<Product | null>(null);
    const [observation, setObservation] = useState('');

    // Calculate final price
    const finalPrice = useMemo(() => {
        if (mode === 'inteira') {
            return leftFlavor?.price || 0;
        }
        // Meio a meio: max price prevails
        const leftPrice = leftFlavor?.price || 0;
        const rightPrice = rightFlavor?.price || 0;
        return Math.max(leftPrice, rightPrice);
    }, [mode, leftFlavor, rightFlavor]);

    // Check if can add to cart
    const canAddToCart = useMemo(() => {
        if (mode === 'inteira') return !!leftFlavor;
        return !!leftFlavor && !!rightFlavor;
    }, [mode, leftFlavor, rightFlavor]);

    // Active half for visual highlight
    const activeHalf = useMemo(() => {
        if (mode === 'inteira') return null;
        if (step === 1 && !leftFlavor) return 'left';
        if (step === 1 && leftFlavor) return 'right';
        if (step === 2 && !rightFlavor) return 'right';
        return null;
    }, [mode, step, leftFlavor, rightFlavor]);

    // Step label for sidebar header
    const stepLabel = useMemo(() => {
        if (mode === 'inteira') return undefined;
        if (!leftFlavor) return '🍕 Escolha o Sabor 1';
        if (!rightFlavor) return '🍕 Escolha o Sabor 2';
        return 'Seleção completa!';
    }, [mode, leftFlavor, rightFlavor]);

    // Instruction text below pizza
    const instructionText = useMemo(() => {
        if (mode === 'inteira') {
            return leftFlavor
                ? `Pizza ${leftFlavor.name} selecionada!`
                : 'Escolha um sabor para sua pizza';
        }
        if (!leftFlavor) {
            return 'Selecione o primeiro sabor na lista ao lado';
        }
        if (!rightFlavor) {
            return 'Agora selecione o segundo sabor';
        }
        return `½ ${leftFlavor.name} + ½ ${rightFlavor.name}`;
    }, [mode, leftFlavor, rightFlavor]);

    // Handle flavor selection (with toggle support)
    const handleSelectFlavor = (flavor: Product) => {
        if (mode === 'inteira') {
            // Toggle: if same flavor clicked, deselect it
            if (leftFlavor?.id === flavor.id) {
                setLeftFlavor(null);
            } else {
                setLeftFlavor(flavor);
            }
        } else {
            // Meio a meio mode
            // Check if clicking on already selected flavor to deselect
            if (leftFlavor?.id === flavor.id) {
                setLeftFlavor(null);
                setRightFlavor(null); // Also clear right if left is cleared
                setStep(1);
                return;
            }
            if (rightFlavor?.id === flavor.id) {
                setRightFlavor(null);
                return;
            }

            // Normal selection flow
            if (!leftFlavor) {
                setLeftFlavor(flavor);
                setStep(2);
            } else if (!rightFlavor) {
                setRightFlavor(flavor);
            }
        }
    };

    // Reset selections
    const handleReset = () => {
        setLeftFlavor(initialFlavor || null);
        setRightFlavor(null);
        setStep(1);
    };

    // Switch mode
    const handleModeChange = (newMode: 'inteira' | 'meia') => {
        setMode(newMode);
        if (newMode === 'inteira') {
            setRightFlavor(null);
        }
        setStep(1);
    };

    // Add to cart
    const handleAddToCart = () => {
        if (!canAddToCart || !leftFlavor) return;

        const flavors = mode === 'inteira'
            ? [leftFlavor.name]
            : [leftFlavor.name, rightFlavor!.name];

        addItem({
            productId: leftFlavor.id,
            name: mode === 'inteira'
                ? leftFlavor.name
                : `½ ${leftFlavor.name} + ½ ${rightFlavor!.name}`,
            price: finalPrice,
            quantity: 1,
            type: 'pizza',
            flavors,
            observation
        });

        onClose();
    };

    // Selected flavors for sidebar
    const selectedFlavors = useMemo(() => {
        const selected: Product[] = [];
        if (leftFlavor) selected.push(leftFlavor);
        if (rightFlavor) selected.push(rightFlavor);
        return selected;
    }, [leftFlavor, rightFlavor]);

    return (
        <div className="flex flex-col h-full">
            {/* Mode Toggle */}
            <div className="grid grid-cols-2 gap-3 mb-6 shrink-0">
                <button
                    onClick={() => handleModeChange('inteira')}
                    className={cn(
                        "p-4 rounded-xl border-2 transition-all duration-300 flex flex-col items-center gap-2",
                        mode === 'inteira'
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-white/10 bg-surface-light text-text-muted hover:border-white/20"
                    )}
                >
                    <Pizza className="w-7 h-7" />
                    <span className="font-semibold text-sm">Inteira</span>
                    <span className="text-xs opacity-70">1 sabor</span>
                </button>

                <button
                    onClick={() => handleModeChange('meia')}
                    className={cn(
                        "p-4 rounded-xl border-2 transition-all duration-300 flex flex-col items-center gap-2",
                        mode === 'meia'
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-white/10 bg-surface-light text-text-muted hover:border-white/20"
                    )}
                >
                    <Utensils className="w-7 h-7" />
                    <span className="font-semibold text-sm">Meio a Meio</span>
                    <span className="text-xs opacity-70">2 sabores</span>
                </button>
            </div>

            {/* Main Content: Pizza + Sidebar */}
            <div className="flex-1 flex flex-col lg:flex-row gap-6 overflow-hidden min-h-0">
                {/* Pizza Visual Section */}
                <div className="flex flex-col items-center justify-center lg:flex-1 shrink-0">
                    <div className="relative">
                        <PizzaVisual
                            mode={mode}
                            leftFlavor={leftFlavor ? {
                                pattern: leftFlavor.visualPattern!,
                                colors: leftFlavor.patternColors!
                            } : null}
                            rightFlavor={rightFlavor ? {
                                pattern: rightFlavor.visualPattern!,
                                colors: rightFlavor.patternColors!
                            } : null}
                            activeHalf={activeHalf as 'left' | 'right' | null}
                            size={260}
                        />
                    </div>

                    {/* Instruction text */}
                    <p className={cn(
                        "mt-4 text-center text-sm font-medium transition-all duration-300",
                        activeHalf ? "text-primary animate-pulse" : "text-text-muted"
                    )}>
                        {instructionText}
                    </p>

                    {/* Selected flavors display for meio a meio */}
                    {mode === 'meia' && (leftFlavor || rightFlavor) && (
                        <div className="mt-3 flex flex-col gap-1 text-xs text-center">
                            {leftFlavor && (
                                <span className="text-text-muted">
                                    <span className="text-primary font-medium">Sabor 1:</span> {leftFlavor.name}
                                </span>
                            )}
                            {rightFlavor && (
                                <span className="text-text-muted">
                                    <span className="text-primary font-medium">Sabor 2:</span> {rightFlavor.name}
                                </span>
                            )}
                        </div>
                    )}

                    {/* Reset button */}
                    {(leftFlavor || rightFlavor) && (
                        <button
                            onClick={handleReset}
                            className="mt-2 text-text-muted hover:text-text text-xs flex items-center gap-1 transition-colors"
                        >
                            <RotateCcw className="w-3 h-3" />
                            Recomeçar
                        </button>
                    )}
                </div>

                {/* Flavor Selection Sidebar */}
                <div className="lg:w-72 flex-1 lg:flex-none min-h-0 overflow-hidden">
                    <FlavorSidebar
                        onSelectFlavor={handleSelectFlavor}
                        selectedFlavors={selectedFlavors}
                        disabled={false}
                        stepLabel={stepLabel}
                    />
                </div>
            </div>

            {/* Observations */}
            <div className="mt-4 shrink-0">
                <textarea
                    className="w-full bg-background border border-white/10 rounded-xl p-3 text-text text-sm resize-none h-16 input-glow transition-all placeholder:text-text-muted/60"
                    placeholder="Observações (ex: tirar cebola, pouco molho...)"
                    value={observation}
                    onChange={(e) => setObservation(e.target.value)}
                />
            </div>

            {/* Footer: Price + Add Button */}
            <div className="mt-4 flex items-center justify-between gap-4 shrink-0">
                <div className="flex flex-col">
                    <span className="text-text-muted text-xs">Total:</span>
                    <span className="text-2xl font-bold text-primary text-glow">
                        R$ {finalPrice.toFixed(2).replace('.', ',')}
                    </span>
                    {mode === 'meia' && leftFlavor && rightFlavor && leftFlavor.price !== rightFlavor.price && (
                        <span className="text-xs text-text-muted">
                            * Valor do sabor mais caro
                        </span>
                    )}
                </div>

                <button
                    onClick={handleAddToCart}
                    disabled={!canAddToCart}
                    className="btn-fire py-3 px-6 flex items-center justify-center gap-2 text-base disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                    <Check className="w-5 h-5" />
                    Adicionar ao Pedido
                </button>
            </div>
        </div>
    );
}
