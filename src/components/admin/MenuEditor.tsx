import { useState } from 'react';
import {
    X,
    ChevronDown,
    ChevronUp,
    Edit2,
    Plus,
    Save,
    Trash2,
    DollarSign,
    Eye,
    EyeOff,
    Database,
    RefreshCw
} from 'lucide-react';
import { useMenuStore } from '../../store/menuStore';
import { saveMenuItem, deleteMenuItem, initializeMenuFromStatic, type MenuItemData } from '../../services/menuService';
import { menu as staticMenu, type Product, type PatternType, type ProductOption } from '../../data/menu';

interface MenuEditorProps {
    isOpen: boolean;
    onClose: () => void;
}

const PATTERN_OPTIONS: PatternType[] = [
    'pepperoni', 'chicken', 'cheese', 'ham', 'tuna', 'corn',
    'basil', 'vegetables', 'shrimp', 'meat', 'bacon', 'palmito',
    'chocolate', 'dulce', 'guava', 'coconut'
];

export function MenuEditor({ isOpen, onClose }: MenuEditorProps) {
    const { categories } = useMenuStore();
    const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
    const [editingItem, setEditingItem] = useState<string | null>(null);
    const [editForm, setEditForm] = useState<Partial<MenuItemData & { options?: ProductOption[] }>>({});
    const [isAddingNew, setIsAddingNew] = useState(false);
    const [newItemCategory, setNewItemCategory] = useState<{ id: string; title: string } | null>(null);
    const [saving, setSaving] = useState(false);
    const [initializing, setInitializing] = useState(false);
    const [deletingItemId, setDeletingItemId] = useState<string | null>(null);

    const [showConfirmInit, setShowConfirmInit] = useState(false);



    const handleStartEdit = (item: Product, categoryId: string, categoryTitle: string) => {
        setEditingItem(item.id);
        setEditForm({
            id: item.id,
            name: item.name,
            description: item.description,
            price: item.price,
            type: item.type,
            image: item.image,
            categoryId,
            categoryTitle,
            visualPattern: item.visualPattern,
            patternColors: item.patternColors,
            options: item.options // Pass options to edit form
        });
    };

    const handleSave = async () => {
        if (!editForm.id) return;

        setSaving(true);
        try {
            await saveMenuItem(editForm as MenuItemData);
            setEditingItem(null);
            setEditForm({});
        } catch (error) {
            console.error('Erro ao salvar:', error);
            alert('Erro ao salvar item');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (itemId: string) => {
        setDeletingItemId(itemId);
    };

    const confirmDelete = async () => {
        if (!deletingItemId) return;

        try {
            await deleteMenuItem(deletingItemId);
        } catch (error) {
            console.error('Erro ao excluir:', error);
            alert('Erro ao excluir item');
        } finally {
            setDeletingItemId(null);
        }
    };

    const handleToggleAvailability = async (item: Product, category: { id: string; title: string }) => {
        try {
            await saveMenuItem({
                id: item.id,
                name: item.name,
                description: item.description,
                price: item.price,
                type: item.type,
                image: item.image,
                categoryId: category.id,
                categoryTitle: category.title,
                visualPattern: item.visualPattern,
                patternColors: item.patternColors,
                available: item.available === undefined ? false : !item.available,
                options: item.options
            });
        } catch (error) {
            console.error('Erro ao atualizar disponibilidade:', error);
            alert('Erro ao atualizar disponibilidade');
        }
    };

    const handleStartAddNew = (categoryId: string, categoryTitle: string) => {
        setIsAddingNew(true);
        setNewItemCategory({ id: categoryId, title: categoryTitle });

        // Define o tipo baseado na categoria
        const isBebidas = categoryId === 'bebidas';

        setEditForm({
            id: `new-${Date.now()}`,
            name: '',
            description: '',
            price: isBebidas ? 10 : 50,
            type: isBebidas ? 'drink' : 'pizza',
            image: isBebidas
                ? 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?q=80&w=400&auto=format&fit=crop'
                : 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?q=80&w=400&auto=format&fit=crop',
            categoryId,
            categoryTitle,
            visualPattern: isBebidas ? undefined : 'cheese',
            patternColors: isBebidas ? undefined : { primary: '#fcc419', secondary: '#fff4e6' }
        });
    };

    const handleSaveNew = async () => {
        if (!editForm.name || !newItemCategory) return;

        setSaving(true);
        try {
            await saveMenuItem(editForm as MenuItemData);
            setIsAddingNew(false);
            setNewItemCategory(null);
            setEditForm({});
        } catch (error) {
            console.error('Erro ao adicionar:', error);
            alert('Erro ao adicionar item');
        } finally {
            setSaving(false);
        }
    };



    const handleInitializeFromStatic = () => {
        setShowConfirmInit(true);
    };

    const confirmInitialize = async () => {
        setShowConfirmInit(false);
        setInitializing(true);
        try {
            await initializeMenuFromStatic(staticMenu);
            alert('Cardápio inicializado com sucesso!');
        } catch (error) {
            console.error('Erro ao inicializar:', error);
            alert('Erro ao inicializar cardápio');
        } finally {
            setInitializing(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[70] flex items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative bg-surface w-full max-w-4xl max-h-[90vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col">
                {/* Header */}
                <div className="shrink-0 p-4 border-b border-white/10 bg-surface-light flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-bold text-text">Editar Cardápio</h2>
                        <p className="text-sm text-text-muted">Adicione, edite ou remova itens do cardápio</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={handleInitializeFromStatic}
                            disabled={initializing}
                            className="px-3 py-2 text-xs bg-yellow-500/20 text-yellow-500 rounded-lg hover:bg-yellow-500/30 disabled:opacity-50"
                        >
                            {initializing ? 'Inicializando...' : 'Inicializar do Estático'}
                        </button>
                        <button
                            onClick={onClose}
                            className="p-2 rounded-full text-text-muted hover:text-text hover:bg-white/10"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {categories.length === 0 ? (
                        <div className="flex-1 flex flex-col items-center justify-center text-text-muted p-8 text-center animate-in fade-in zoom-in duration-300">
                            <div className="bg-surface-light p-4 rounded-full mb-4">
                                <Database className="w-12 h-12 text-yellow-500 opacity-80" />
                            </div>
                            <h3 className="text-lg font-medium text-text mb-2">Cardápio Vazio</h3>
                            <p className="max-w-xs mx-auto mb-6">
                                Não há itens no cardápio do Firebase. Use o botão abaixo para importar os dados iniciais.
                            </p>
                            <button
                                onClick={handleInitializeFromStatic}
                                disabled={initializing}
                                className="flex items-center gap-2 px-6 py-3 bg-yellow-500 text-background rounded-xl font-bold hover:bg-yellow-400 transition-colors shadow-lg shadow-yellow-500/10"
                            >
                                <RefreshCw className={`w-5 h-5 ${initializing ? 'animate-spin' : ''}`} />
                                {initializing ? 'Importando...' : 'Importar Dados Padrão'}
                            </button>
                        </div>
                    ) : (
                        categories.map(category => (
                            <div key={category.id} className="glass-card rounded-xl overflow-hidden">
                                {/* Category Header */}
                                <button
                                    onClick={() => setExpandedCategory(
                                        expandedCategory === category.id ? null : category.id
                                    )}
                                    className="w-full p-4 flex items-center justify-between bg-surface-light hover:bg-surface transition-colors"
                                >
                                    <div className="flex items-center gap-3">
                                        <span className="font-semibold text-text">{category.title}</span>
                                        <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded-full">
                                            {category.items.length} itens
                                        </span>
                                    </div>
                                    {expandedCategory === category.id ? (
                                        <ChevronUp className="w-5 h-5 text-text-muted" />
                                    ) : (
                                        <ChevronDown className="w-5 h-5 text-text-muted" />
                                    )}
                                </button>

                                {/* Category Items */}
                                {expandedCategory === category.id && (
                                    <div className="p-4 space-y-3">
                                        {category.items.map(item => (
                                            <div
                                                key={item.id}
                                                className="bg-background rounded-lg p-3"
                                            >
                                                {editingItem === item.id ? (
                                                    /* Edit Form */
                                                    <div className="space-y-3">
                                                        <div className="grid grid-cols-2 gap-3">
                                                            <input
                                                                type="text"
                                                                value={editForm.name || ''}
                                                                onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                                                                placeholder="Nome"
                                                                className="bg-surface-light border border-white/10 rounded-lg px-3 py-2 text-text text-sm"
                                                            />
                                                            <div className="flex items-center gap-2">
                                                                <DollarSign className="w-4 h-4 text-text-muted" />
                                                                <input
                                                                    type="number"
                                                                    value={editForm.price || 0}
                                                                    onChange={e => setEditForm({ ...editForm, price: Number(e.target.value) })}
                                                                    className="bg-surface-light border border-white/10 rounded-lg px-3 py-2 text-text text-sm w-24"
                                                                />
                                                            </div>
                                                        </div>
                                                        <textarea
                                                            value={editForm.description || ''}
                                                            onChange={e => setEditForm({ ...editForm, description: e.target.value })}
                                                            placeholder="Descrição"
                                                            className="w-full bg-surface-light border border-white/10 rounded-lg px-3 py-2 text-text text-sm resize-none h-16"
                                                        />

                                                        {/* Options Management */}
                                                        {item.options && item.options.length > 0 && (
                                                            <div className="space-y-2 border-t border-white/10 pt-3">
                                                                <h4 className="text-sm font-medium text-text-muted">Opções / Sabores</h4>
                                                                <div className="space-y-1">
                                                                    {item.options.map(option => {
                                                                        // Check if this option is toggled off in the edit form (or original item)
                                                                        const isOptionAvailable =
                                                                            // Check current edit form state first, then fallback to item state
                                                                            editForm.options?.find(o => o.id === option.id)?.available ??
                                                                            option.available !== false;

                                                                        return (
                                                                            <div key={option.id} className="flex items-center justify-between p-2 bg-surface-light rounded-lg text-sm">
                                                                                <span className={isOptionAvailable ? "text-text" : "text-text-muted opacity-50"}>
                                                                                    {option.name}
                                                                                </span>
                                                                                <button
                                                                                    onClick={() => {
                                                                                        // Toggle availability logic
                                                                                        const currentOptions = editForm.options || item.options || [];
                                                                                        const updatedOptions = currentOptions.map(o => {
                                                                                            if (o.id === option.id) {
                                                                                                return { ...o, available: !isOptionAvailable };
                                                                                            }
                                                                                            return o;
                                                                                        });
                                                                                        // Ensure option exists if not present in current list (for safety)
                                                                                        if (!updatedOptions.find(o => o.id === option.id)) {
                                                                                            updatedOptions.push({ ...option, available: !isOptionAvailable });
                                                                                        }
                                                                                        setEditForm({ ...editForm, options: updatedOptions });
                                                                                    }}
                                                                                    className={`p-1.5 rounded-lg transition-colors ${!isOptionAvailable
                                                                                        ? 'text-text-muted hover:text-text hover:bg-white/10'
                                                                                        : 'text-primary hover:bg-primary/10'
                                                                                        }`}
                                                                                    title={!isOptionAvailable ? "Tornar disponível" : "Ocultar opção"}
                                                                                >
                                                                                    {!isOptionAvailable ? (
                                                                                        <EyeOff className="w-3.5 h-3.5" />
                                                                                    ) : (
                                                                                        <Eye className="w-3.5 h-3.5" />
                                                                                    )}
                                                                                </button>
                                                                            </div>
                                                                        );
                                                                    })}
                                                                </div>
                                                            </div>
                                                        )}

                                                        <div className="flex justify-end gap-2">
                                                            <button
                                                                onClick={() => { setEditingItem(null); setEditForm({}); }}
                                                                className="px-3 py-2 text-sm text-text-muted hover:text-text"
                                                            >
                                                                Cancelar
                                                            </button>
                                                            <button
                                                                onClick={handleSave}
                                                                disabled={saving}
                                                                className="flex items-center gap-2 px-4 py-2 bg-primary text-background rounded-lg text-sm font-medium disabled:opacity-50"
                                                            >
                                                                <Save className="w-4 h-4" />
                                                                {saving ? 'Salvando...' : 'Salvar'}
                                                            </button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    /* Item Display */
                                                    <div className="flex items-center justify-between">
                                                        <div className={`flex-1 ${item.available === false ? 'opacity-50' : ''}`}>
                                                            <div className="flex items-center gap-3">
                                                                <span className="font-medium text-text">{item.name}</span>
                                                                <span className="text-primary font-semibold">
                                                                    R$ {item.price.toFixed(2).replace('.', ',')}
                                                                </span>
                                                                {item.available === false && (
                                                                    <span className="text-[10px] uppercase font-bold bg-white/10 text-text-muted px-2 py-0.5 rounded-full">
                                                                        Indisponível
                                                                    </span>
                                                                )}
                                                            </div>
                                                            {item.description && (
                                                                <p className="text-xs text-text-muted mt-1 line-clamp-1">
                                                                    {item.description}
                                                                </p>
                                                            )}
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <button
                                                                onClick={() => handleToggleAvailability(item, category)}
                                                                className={`p-2 rounded-lg transition-colors ${item.available === false
                                                                    ? 'text-text-muted hover:text-text hover:bg-white/10'
                                                                    : 'text-primary hover:bg-primary/10'
                                                                    }`}
                                                                title={item.available === false ? "Tornar disponível" : "Ocultar item"}
                                                            >
                                                                {item.available === false ? (
                                                                    <EyeOff className="w-4 h-4" />
                                                                ) : (
                                                                    <Eye className="w-4 h-4" />
                                                                )}
                                                            </button>
                                                            <button
                                                                onClick={() => handleStartEdit(item, category.id, category.title)}
                                                                className="p-2 rounded-lg text-text-muted hover:text-text hover:bg-surface-light"
                                                            >
                                                                <Edit2 className="w-4 h-4" />
                                                            </button>
                                                            <button
                                                                onClick={() => handleDelete(item.id)}
                                                                className="p-2 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-500/10"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        ))}

                                        {/* Add New Item Button */}
                                        {isAddingNew && newItemCategory?.id === category.id ? (
                                            <div className="bg-primary/10 border border-primary/30 rounded-lg p-4 space-y-3">
                                                <h4 className="text-sm font-semibold text-primary">Novo Item</h4>
                                                <div className="grid grid-cols-2 gap-3">
                                                    <input
                                                        type="text"
                                                        value={editForm.name || ''}
                                                        onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                                                        placeholder="Nome do item"
                                                        className="bg-surface-light border border-white/10 rounded-lg px-3 py-2 text-text text-sm"
                                                    />
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-text-muted text-sm">R$</span>
                                                        <input
                                                            type="number"
                                                            value={editForm.price || 0}
                                                            onChange={e => setEditForm({ ...editForm, price: Number(e.target.value) })}
                                                            className="bg-surface-light border border-white/10 rounded-lg px-3 py-2 text-text text-sm w-24"
                                                        />
                                                    </div>
                                                </div>
                                                <textarea
                                                    value={editForm.description || ''}
                                                    onChange={e => setEditForm({ ...editForm, description: e.target.value })}
                                                    placeholder="Descrição / ingredientes"
                                                    className="w-full bg-surface-light border border-white/10 rounded-lg px-3 py-2 text-text text-sm resize-none h-16"
                                                />
                                                {/* Só mostra seletor de padrão para pizzas */}
                                                {category.id !== 'bebidas' && (
                                                    <select
                                                        value={editForm.visualPattern || 'cheese'}
                                                        onChange={e => setEditForm({ ...editForm, visualPattern: e.target.value as PatternType })}
                                                        className="w-full bg-surface-light border border-white/10 rounded-lg px-3 py-2 text-text text-sm"
                                                    >
                                                        {PATTERN_OPTIONS.map(pattern => (
                                                            <option key={pattern} value={pattern}>{pattern}</option>
                                                        ))}
                                                    </select>
                                                )}
                                                <div className="flex justify-end gap-2">
                                                    <button
                                                        onClick={() => { setIsAddingNew(false); setNewItemCategory(null); setEditForm({}); }}
                                                        className="px-3 py-2 text-sm text-text-muted hover:text-text"
                                                    >
                                                        Cancelar
                                                    </button>
                                                    <button
                                                        onClick={handleSaveNew}
                                                        disabled={saving || !editForm.name}
                                                        className="flex items-center gap-2 px-4 py-2 bg-primary text-background rounded-lg text-sm font-medium disabled:opacity-50"
                                                    >
                                                        <Plus className="w-4 h-4" />
                                                        {saving ? 'Adicionando...' : 'Adicionar'}
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <button
                                                onClick={() => handleStartAddNew(category.id, category.title)}
                                                className="w-full p-3 border-2 border-dashed border-white/20 rounded-lg text-text-muted hover:text-text hover:border-primary/50 transition-colors flex items-center justify-center gap-2"
                                            >
                                                <Plus className="w-4 h-4" />
                                                Adicionar item a {category.title}
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Modal de Confirmação de Inicialização */}
            {
                showConfirmInit && (
                    <div className="fixed inset-0 z-[80] flex items-center justify-center">
                        <div
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                            onClick={() => setShowConfirmInit(false)}
                        />
                        <div className="relative bg-surface rounded-xl p-6 max-w-sm mx-4 shadow-2xl">
                            <h3 className="text-lg font-bold text-text mb-2 animate-pulse">Atenção!</h3>
                            <p className="text-text-muted mb-6">
                                Você está prestes a substituir TODO o cardápio do banco de dados pelos itens padrão do sistema.
                                <br /><br />
                                <strong className="text-yellow-500">Isso não pode ser desfeito.</strong>
                            </p>
                            <div className="flex justify-end gap-3">
                                <button
                                    onClick={() => setShowConfirmInit(false)}
                                    className="px-4 py-2 text-text-muted hover:text-text transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={confirmInitialize}
                                    className="px-4 py-2 bg-yellow-500 text-background font-bold rounded-lg hover:bg-yellow-400 transition-colors"
                                >
                                    Sim, Substituir Tudo
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }

            {/* Modal de Confirmação de Exclusão */}
            {
                deletingItemId && (
                    <div className="fixed inset-0 z-[80] flex items-center justify-center">
                        <div
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                            onClick={() => setDeletingItemId(null)}
                        />
                        <div className="relative bg-surface rounded-xl p-6 max-w-sm mx-4 shadow-2xl">
                            <h3 className="text-lg font-bold text-text mb-2">Confirmar Exclusão</h3>
                            <p className="text-text-muted mb-6">Tem certeza que deseja excluir este item do cardápio?</p>
                            <div className="flex justify-end gap-3">
                                <button
                                    onClick={() => setDeletingItemId(null)}
                                    className="px-4 py-2 text-text-muted hover:text-text transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={confirmDelete}
                                    className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                                >
                                    Excluir
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }
        </div >
    );
}
