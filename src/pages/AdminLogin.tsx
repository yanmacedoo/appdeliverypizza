import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Lock, Mail, AlertCircle, Loader2 } from 'lucide-react';

export function AdminLogin() {
    const navigate = useNavigate();
    const { login } = useAuth();

    const [email, setEmail] = useState('admin');
    const [password, setPassword] = useState('admin');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await login(email, password);
            navigate('/admin/dashboard');
        } catch (err: any) {
            console.error('Login error:', err);
            if (err.code === 'auth/invalid-credential') {
                setError('Email ou senha incorretos');
            } else if (err.code === 'auth/too-many-requests') {
                setError('Muitas tentativas. Tente novamente mais tarde.');
            } else {
                setError('Erro ao fazer login. Tente novamente.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                {/* Logo */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center gap-2 mb-4">
                        <img src="/images/logo-hero.png" alt="Logo" className="w-10 h-10 object-contain" />
                        <span className="text-2xl font-bold text-text">Fome de Pizza</span>
                    </div>
                    <h1 className="text-xl text-text-muted">Área Administrativa</h1>
                </div>

                {/* Login Form */}
                <form
                    onSubmit={handleSubmit}
                    className="glass-card p-6 sm:p-8 rounded-2xl space-y-6"
                >
                    {/* Error Alert */}
                    {error && (
                        <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
                            <AlertCircle className="w-5 h-5 shrink-0" />
                            <span>{error}</span>
                        </div>
                    )}

                    {/* Email Field */}
                    <div>
                        <label className="block text-sm font-medium text-text-muted mb-2">
                            Usuário / Email
                        </label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
                            <input
                                type="text"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                placeholder="admin"
                                className="w-full bg-background border border-white/10 rounded-xl pl-11 pr-4 py-3 text-text placeholder:text-text-muted/50 input-glow transition-all"
                            />
                        </div>
                    </div>

                    {/* Password Field */}
                    <div>
                        <label className="block text-sm font-medium text-text-muted mb-2">
                            Senha
                        </label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                placeholder="••••••••"
                                className="w-full bg-background border border-white/10 rounded-xl pl-11 pr-4 py-3 text-text placeholder:text-text-muted/50 input-glow transition-all"
                            />
                        </div>
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full btn-fire py-4 flex items-center justify-center gap-2 text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                Entrando...
                            </>
                        ) : (
                            <>
                                <Lock className="w-5 h-5" />
                                Entrar
                            </>
                        )}
                    </button>
                </form>

                {/* Back to site */}
                <div className="text-center mt-6">
                    <a
                        href="/"
                        className="text-text-muted hover:text-primary transition-colors text-sm"
                    >
                        ← Voltar para o site
                    </a>
                </div>
            </div>
        </div>
    );
}
