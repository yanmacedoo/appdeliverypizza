import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin } from 'lucide-react';

export function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="bg-surface py-12 border-t border-white/5 mt-auto">
            <div className="max-w-6xl mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                    {/* Brand & Address */}
                    <div className="space-y-4">
                        <h3 className="text-xl font-bold text-yellow-500">Fome de Pizza</h3>
                        <div className="flex items-start gap-3 text-text-muted">
                            <MapPin className="w-5 h-5 shrink-0 mt-1 text-yellow-500" />
                            <p className="text-sm leading-relaxed">
                                Av. Hildebrando de Araújo Góes, s/n<br />
                                Praça da Bandeira<br />
                                Ituberá - BA, 45435-000
                            </p>
                        </div>
                    </div>

                    {/* Contact */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-bold text-text">Contato</h3>
                        <div className="space-y-3">
                            <a
                                href="mailto:contato@fomedepizzaitubera.com"
                                className="flex items-center gap-3 text-text-muted hover:text-primary transition-colors group"
                            >
                                <Mail className="w-5 h-5 group-hover:text-primary transition-colors" />
                                <span className="text-sm">contato@fomedepizzaitubera.com</span>
                            </a>
                            <a
                                href={`https://wa.me/${import.meta.env.VITE_WHATSAPP_NUMBER}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-3 text-text-muted hover:text-green-500 transition-colors group"
                            >
                                <Phone className="w-5 h-5 group-hover:text-green-500 transition-colors" />
                                <span className="text-sm">WhatsApp Delivery</span>
                            </a>
                        </div>
                    </div>

                    {/* Legal */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-bold text-text">Legal</h3>
                        <div className="space-y-3 flex flex-col items-start">
                            <Link to="/politica-de-privacidade" className="text-text-muted hover:text-primary text-sm transition-colors">
                                Política de Privacidade
                            </Link>
                            <Link to="/termos-de-uso" className="text-text-muted hover:text-primary text-sm transition-colors">
                                Termos de Uso
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
                    <div className="space-y-1">
                        <p className="text-text-muted text-xs">
                            CNPJ: 53.155.944/0001-02 • Rafael De Jesus Fonseca
                        </p>
                        <p className="text-text-muted text-xs">
                            &copy; {currentYear} Fome de Pizza. Todos os direitos reservados.
                        </p>
                    </div>

                    <a
                        href="https://nuscorre.com.br"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 hover:opacity-80 transition-opacity"
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
    );
}
