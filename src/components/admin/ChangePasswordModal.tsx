import { useState } from 'react';
import { X, Lock, Check, Loader2, AlertCircle } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

interface ChangePasswordModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function ChangePasswordModal({ isOpen, onClose }: ChangePasswordModalProps) {
    const { updateUserPassword } = useAuth();
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (newPassword.length < 6) {
            setError('A senha deve ter pelo menos 6 caracteres');
            return;
        }

        if (newPassword !== confirmPassword) {
            setError('As senhas não coincidem');
            return;
        }

        setLoading(true);

        try {
            await updateUserPassword(currentPassword, newPassword);
            setSuccess(true);
            setTimeout(() => {
                onClose();
                // Reset state after close
                setCurrentPassword('');
                setNewPassword('');
                setConfirmPassword('');
                setSuccess(false);
            }, 2000);
        } catch (err: any) {
            console.error(err);
            if (err.code === 'auth/wrong-password') {
                setError('Senha atual incorreta.');
            } else if (err.code === 'auth/too-many-requests') {
                setError('Muitas tentativas. Tente novamente mais tarde.');
            } else {
                setError('Erro ao atualizar a senha. Verifique sua senha atual.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-surface border border-white/10 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl scale-100 animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="p-4 border-b border-white/10 flex items-center justify-between bg-white/5">
                    <div className="flex items-center gap-2 text-primary">
                        <Lock className="w-5 h-5" />
                        <h2 className="font-semibold">Alterar Senha</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-1 rounded-lg hover:bg-white/10 text-text-muted hover:text-text transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6">
                    {success ? (
                        <div className="flex flex-col items-center justify-center py-8 text-green-500 animate-in fade-in zoom-in duration-300">
                            <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mb-4">
                                <Check className="w-8 h-8" />
                            </div>
                            <p className="font-semibold text-lg">Senha atualizada!</p>
                            <p className="text-text-muted text-sm mt-1">Fechando janela...</p>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {error && (
                                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 flex items-start gap-2 text-red-500 text-sm">
                                    <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                                    <span>{error}</span>
                                </div>
                            )}

                            <div className="space-y-1">
                                <label className="text-sm text-text-muted font-medium ml-1">
                                    Senha Atual
                                </label>
                                <input
                                    type="password"
                                    value={currentPassword}
                                    onChange={(e) => setCurrentPassword(e.target.value)}
                                    className="w-full bg-background/50 border border-white/10 rounded-xl px-4 py-3 text-text focus:border-primary/50 focus:ring-1 focus:ring-primary/50 outline-none transition-all placeholder:text-text-muted/30"
                                    placeholder="Digite sua senha atual"
                                    disabled={loading}
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-sm text-text-muted font-medium ml-1">
                                    Nova Senha
                                </label>
                                <input
                                    type="password"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    className="w-full bg-background/50 border border-white/10 rounded-xl px-4 py-3 text-text focus:border-primary/50 focus:ring-1 focus:ring-primary/50 outline-none transition-all placeholder:text-text-muted/30"
                                    placeholder="Mínimo 6 caracteres"
                                    disabled={loading}
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-sm text-text-muted font-medium ml-1">
                                    Confirmar Nova Senha
                                </label>
                                <input
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="w-full bg-background/50 border border-white/10 rounded-xl px-4 py-3 text-text focus:border-primary/50 focus:ring-1 focus:ring-primary/50 outline-none transition-all placeholder:text-text-muted/30"
                                    placeholder="Repita a nova senha"
                                    disabled={loading}
                                />
                            </div>

                            <div className="pt-2">
                                <button
                                    type="submit"
                                    disabled={loading || !currentPassword || !newPassword || !confirmPassword}
                                    className="w-full btn-fire py-3 rounded-xl flex items-center justify-center gap-2 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                            Salvando...
                                        </>
                                    ) : (
                                        <>
                                            <Check className="w-4 h-4" />
                                            Atualizar Senha
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}
