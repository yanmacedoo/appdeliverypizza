import { useState, useMemo } from 'react';
import { Pizza, Check, RotateCcw } from 'lucide-react';
import { PizzaVisual } from './PizzaVisual';
import { FlavorSidebar } from './FlavorSidebar';
import { type Product } from '../data/menu';
import { useCartStore } from '../store/cartStore';
import { cn, sanitizeInput } from '../lib/utils';

interface PizzaBuilderProps {
    initialFlavor?: Product;
    onClose: () => void;
}

export function PizzaBuilder({ initialFlavor, onClose }: PizzaBuilderProps) {
    const addItem = useCartStore((state) => state.addItem);

    const [mode, setMode] = useState<'inteira' | 'meia' | 'tercos'>('inteira');
    const [step, setStep] = useState<1 | 2 | 3>(1);
    const [leftFlavor, setLeftFlavor] = useState<Product | null>(initialFlavor || null);
    const [rightFlavor, setRightFlavor] = useState<Product | null>(null);
    const [thirdFlavor, setThirdFlavor] = useState<Product | null>(null);
    const [observation, setObservation] = useState('');

    // Calculate final price
    const finalPrice = useMemo(() => {
        if (mode === 'inteira') {
            return leftFlavor?.price || 0;
        }
        if (mode === 'meia') {
            // Meio a meio: max price prevails
            const leftPrice = leftFlavor?.price || 0;
            const rightPrice = rightFlavor?.price || 0;
            return Math.max(leftPrice, rightPrice);
        }
        // Terços (3 sabores): max price + R$5
        const leftPrice = leftFlavor?.price || 0;
        const rightPrice = rightFlavor?.price || 0;
        const thirdPrice = thirdFlavor?.price || 0;
        return Math.max(leftPrice, rightPrice, thirdPrice) + 5;
    }, [mode, leftFlavor, rightFlavor, thirdFlavor]);

    // Check if can add to cart
    const canAddToCart = useMemo(() => {
        if (mode === 'inteira') return !!leftFlavor;
        if (mode === 'meia') return !!leftFlavor && !!rightFlavor;
        return !!leftFlavor && !!rightFlavor && !!thirdFlavor;
    }, [mode, leftFlavor, rightFlavor, thirdFlavor]);

    // Active half/slice for visual highlight
    const activeHalf = useMemo(() => {
        if (mode === 'inteira') return null;

        if (mode === 'tercos') {
            if (step === 1) return 'slice1';
            if (step === 2) return 'slice2';
            if (step === 3) return 'slice3';
            return null;
        }

        // Meia (Half)
        if (step === 1) return 'left';
        if (step === 2) return 'right';
        return null;
    }, [mode, step]);

    // Step label for sidebar header
    const stepLabel = useMemo(() => {
        if (mode === 'inteira') return undefined;
        if (!leftFlavor) return '🍕 Escolha o Sabor 1';
        if (!rightFlavor) return '🍕 Escolha o Sabor 2';
        if (mode === 'tercos' && !thirdFlavor) return '🍕 Escolha o Sabor 3';
        return 'Seleção completa!';
    }, [mode, leftFlavor, rightFlavor, thirdFlavor]);

    // Summary text for the bottom section
    const summaryText = useMemo(() => {
        if (!leftFlavor) return 'Selecione os sabores...';

        if (mode === 'inteira') return leftFlavor.name;

        if (mode === 'meia') {
            const p1 = leftFlavor?.name || '...';
            const p2 = rightFlavor?.name || '...';
            return `½ ${p1} + ½ ${p2}`;
        }

        // tercos
        const p1 = leftFlavor?.name || '...';
        const p2 = rightFlavor?.name || '...';
        const p3 = thirdFlavor?.name || '...';
        return `⅓ ${p1} + ⅓ ${p2} + ⅓ ${p3}`;
    }, [mode, leftFlavor, rightFlavor, thirdFlavor]);

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
        if (mode === 'tercos' && !thirdFlavor) {
            return 'Agora selecione o terceiro sabor';
        }
        if (mode === 'meia') {
            return `½ ${leftFlavor.name} + ½ ${rightFlavor.name}`;
        }
        return `⅓ ${leftFlavor.name} + ⅓ ${rightFlavor.name} + ⅓ ${thirdFlavor?.name}`;
    }, [mode, leftFlavor, rightFlavor, thirdFlavor]);

    // Handle flavor selection (with toggle support)
    const handleSelectFlavor = (flavor: Product) => {
        if (mode === 'inteira') {
            // Toggle: if same flavor clicked, deselect it
            if (leftFlavor?.id === flavor.id) {
                setLeftFlavor(null);
            } else {
                setLeftFlavor(flavor);
            }
        } else if (mode === 'meia') {
            // Meio a meio mode
            // Check if clicking on already selected flavor to deselect
            if (leftFlavor?.id === flavor.id) {
                setLeftFlavor(null);
                setRightFlavor(null);
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
        } else {
            // Terços mode (3 sabores)
            // Check if clicking on already selected flavor to deselect
            if (leftFlavor?.id === flavor.id) {
                setLeftFlavor(null);
                setRightFlavor(null);
                setThirdFlavor(null);
                setStep(1);
                return;
            }
            if (rightFlavor?.id === flavor.id) {
                setRightFlavor(null);
                setThirdFlavor(null);
                setStep(2);
                return;
            }
            if (thirdFlavor?.id === flavor.id) {
                setThirdFlavor(null);
                return;
            }

            // Normal selection flow
            if (!leftFlavor) {
                setLeftFlavor(flavor);
                setStep(2);
            } else if (!rightFlavor) {
                setRightFlavor(flavor);
                setStep(3);
            } else if (!thirdFlavor) {
                setThirdFlavor(flavor);
            }
        }
    };

    // Reset selections
    const handleReset = () => {
        setLeftFlavor(initialFlavor || null);
        setRightFlavor(null);
        setThirdFlavor(null);
        setStep(1);
    };

    // Switch mode
    const handleModeChange = (newMode: 'inteira' | 'meia' | 'tercos') => {
        setMode(newMode);
        // Clear selections when switching modes to avoid text confusion
        if (newMode === 'inteira') {
            setRightFlavor(null);
            setThirdFlavor(null);
            // Keep initialFlavor if provided, otherwise clear
            setLeftFlavor(initialFlavor || null);
        } else {
            // When switching to meio a meio or terços, clear all selections
            setLeftFlavor(null);
            setRightFlavor(null);
            setThirdFlavor(null);
        }
        setStep(1);
    };

    // Add to cart
    const handleAddToCart = () => {
        if (!canAddToCart || !leftFlavor) return;

        let flavors: string[];
        let name: string;

        if (mode === 'inteira') {
            flavors = [leftFlavor.name];
            name = leftFlavor.name;
        } else if (mode === 'meia') {
            flavors = [leftFlavor.name, rightFlavor!.name];
            name = `½ ${leftFlavor.name} + ½ ${rightFlavor!.name}`;
        } else {
            flavors = [leftFlavor.name, rightFlavor!.name, thirdFlavor!.name];
            name = `⅓ ${leftFlavor.name} + ⅓ ${rightFlavor!.name} + ⅓ ${thirdFlavor!.name}`;
        }

        addItem({
            productId: leftFlavor.id,
            name,
            price: finalPrice,
            quantity: 1,
            type: 'pizza',
            flavors,
            observation: sanitizeInput(observation)
        });

        onClose();
    };

    // Selected flavors for sidebar
    const selectedFlavors = useMemo(() => {
        const selected: Product[] = [];
        if (leftFlavor) selected.push(leftFlavor);
        if (rightFlavor) selected.push(rightFlavor);
        if (thirdFlavor) selected.push(thirdFlavor);
        return selected;
    }, [leftFlavor, rightFlavor, thirdFlavor]);

    return (
        <div className="flex flex-col h-full">
            {/* Mode Toggle */}
            <div className="mb-6 shrink-0 relative">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-black text-[10px] font-bold px-2 py-0.5 rounded-full z-10 animate-bounce">
                    COMECE AQUI
                </div>
                <div className="grid grid-cols-3 gap-2 p-1 rounded-2xl bg-white/5 border border-primary/30 shadow-[0_0_15px_rgba(255,193,7,0.15)]">
                    <button
                        onClick={() => handleModeChange('inteira')}
                        className={cn(
                            "p-3 rounded-xl border-2 transition-all duration-300 flex flex-col items-center gap-1",
                            mode === 'inteira'
                                ? "border-primary bg-primary/10 text-primary"
                                : "border-white/10 bg-surface-light text-text-muted hover:border-white/20"
                        )}
                    >
                        <Pizza className="w-6 h-6" />
                        <span className="font-semibold text-xs">Inteira</span>
                        <span className="text-[10px] opacity-70">1 sabor</span>
                    </button>

                    <button
                        onClick={() => handleModeChange('meia')}
                        className={cn(
                            "p-3 rounded-xl border-2 transition-all duration-300 flex flex-col items-center gap-1",
                            mode === 'meia'
                                ? "border-primary bg-primary/10 text-primary"
                                : "border-white/10 bg-surface-light text-text-muted hover:border-white/20"
                        )}
                    >
                        <Pizza className="w-6 h-6" />
                        <span className="font-semibold text-xs">Meio a Meio</span>
                        <span className="text-[10px] opacity-70">2 sabores</span>
                    </button>

                    <button
                        onClick={() => handleModeChange('tercos')}
                        className={cn(
                            "p-3 rounded-xl border-2 transition-all duration-300 flex flex-col items-center gap-1",
                            mode === 'tercos'
                                ? "border-primary bg-primary/10 text-primary"
                                : "border-white/10 bg-surface-light text-text-muted hover:border-white/20"
                        )}
                    >
                        <Pizza className="w-6 h-6" />
                        <span className="font-semibold text-xs">3 Sabores</span>
                        <span className="text-[10px] opacity-70 text-accent">+R$ 5,00</span>
                    </button>
                </div>
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
                            thirdFlavor={thirdFlavor ? {
                                pattern: thirdFlavor.visualPattern!,
                                colors: thirdFlavor.patternColors!
                            } : null}
                            activeHalf={activeHalf}
                            size={260}
                        />
                    </div>

                    {/* Instruction text - hidden on mobile for meio-a-meio (shown in sidebar instead) */}
                    <p className={cn(
                        "mt-4 text-center text-sm font-medium transition-all duration-300",
                        activeHalf ? "text-primary animate-pulse" : "text-text-muted",
                        (mode === 'meia' || mode === 'tercos') && !leftFlavor && "hidden lg:block"
                    )}>
                        {instructionText}
                    </p>

                    {/* Selected flavors display for meio a meio or terços */}
                    {(mode === 'meia' || mode === 'tercos') && (leftFlavor || rightFlavor || thirdFlavor) && (
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
                            {thirdFlavor && (
                                <span className="text-text-muted">
                                    <span className="text-primary font-medium">Sabor 3:</span> {thirdFlavor.name}
                                </span>
                            )}
                        </div>
                    )}

                    {/* Reset button */}
                    {(leftFlavor || rightFlavor || thirdFlavor) && (
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

            {/* Flavor Summary */}
            <div className="mt-4 mb-2 bg-surface-light rounded-xl p-3 border border-white/5">
                <span className="text-xs text-text-muted font-medium block mb-1">
                    Resumo do Pedido
                </span>
                <p className="text-sm text-text font-medium truncate">
                    {summaryText}
                </p>
            </div>

            {/* Observations */}
            <div className="mt-0 shrink-0">
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
                    {mode === 'tercos' && (
                        <span className="text-xs text-accent">
                            * Inclui +R$ 5,00 de acréscimo
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

            <p className="text-center text-[10px] text-text-muted mt-4 mb-2 flex items-center justify-center gap-1 opacity-50 hover:opacity-100 transition-opacity">
                Desenvolvido por{' '}
                <a
                    href="https://nuscorre.com.br"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline flex items-center gap-1"
                >
                    <img src="/nuscorre-logo.png" alt="Nuscorre" className="h-3 w-auto" />
                </a>
            </p>
        </div>
    );
}
