import { Footer } from '../components/Footer';
import { Pizza, ChevronLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export function PrivacyPolicy() {
    return (
        <div className="min-h-screen bg-background text-text flex flex-col">
            {/* Header Simplified */}
            <header className="sticky top-0 z-50 glass-card border-b border-white/10">
                <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
                    <Link to="/" className="flex items-center gap-2 group">
                        <ChevronLeft className="w-5 h-5 text-primary group-hover:-translate-x-1 transition-transform" />
                        <span className="font-medium">Voltar para o início</span>
                    </Link>
                    <div className="flex items-center gap-2">
                        <Pizza className="w-6 h-6 text-primary" />
                        <span className="font-bold hidden sm:inline">Fome de Pizza</span>
                    </div>
                </div>
            </header>

            <main className="flex-1 w-full max-w-4xl mx-auto px-4 py-8">
                <article className="prose prose-invert max-w-none">
                    <h1 className="text-3xl font-bold mb-2">Política de Privacidade</h1>
                    <p className="text-text-muted mb-8">Última atualização: 10 de Dezembro de 2025</p>

                    <p className="mb-6">
                        A sua privacidade é importante para nós. Esta política de privacidade explica como a Fome de Pizza
                        (doravante "nós" ou "Site") coleta, usa e protege as informações dos usuários que acessam nosso
                        sistema de delivery online acessível em https://fomedepizza.pages.dev.
                    </p>

                    <h2 className="text-xl font-semibold text-primary mt-8 mb-4">1. Dados que Coletamos</h2>
                    <p className="mb-4">Para processar o seu pedido e garantir a entrega, podemos solicitar as seguintes informações pessoais:</p>
                    <ul className="list-disc pl-5 space-y-2 mb-6 text-text-muted">
                        <li><strong className="text-text">Dados de Identificação:</strong> Nome completo.</li>
                        <li><strong className="text-text">Dados de Contato:</strong> Número de telefone (WhatsApp).</li>
                        <li><strong className="text-text">Dados de Localização:</strong> Endereço completo para entrega (Rua, Número, Bairro, CEP, Complemento e Ponto de Referência).</li>
                        <li><strong className="text-text">Dados do Pedido:</strong> Histórico de itens selecionados e observações de preferência.</li>
                    </ul>

                    <h2 className="text-xl font-semibold text-primary mt-8 mb-4">2. Como Usamos seus Dados</h2>
                    <p className="mb-4">Utilizamos os seus dados para as seguintes finalidades:</p>
                    <ul className="list-disc pl-5 space-y-2 mb-6 text-text-muted">
                        <li><strong className="text-text">Processamento de Pedidos:</strong> Para preparar e entregar a sua pizza no local correto.</li>
                        <li><strong className="text-text">Comunicação:</strong> Para enviar atualizações sobre o status do pedido via WhatsApp ou telefone.</li>
                        <li><strong className="text-text">Melhoria do Serviço:</strong> Para entender quais produtos são mais populares (análise estatística anônima).</li>
                        <li><strong className="text-text">Cumprimento Legal:</strong> Para emissão de notas fiscais, quando aplicável.</li>
                    </ul>

                    <h2 className="text-xl font-semibold text-primary mt-8 mb-4">3. Compartilhamento de Dados</h2>
                    <p className="mb-4">Nós não vendemos seus dados pessoais. Seus dados podem ser compartilhados apenas nas seguintes situações:</p>
                    <ul className="list-disc pl-5 space-y-2 mb-6 text-text-muted">
                        <li><strong className="text-text">Entregadores:</strong> O nome e endereço são compartilhados com a equipe de motoboys para viabilizar a entrega.</li>
                        <li><strong className="text-text">Plataformas de Mensagem:</strong> Ao finalizar o pedido, você pode ser redirecionado para o WhatsApp. Ao fazer isso, você está sujeito também à política de privacidade do WhatsApp.</li>
                        <li><strong className="text-text">Obrigação Legal:</strong> Mediante requisição de autoridades judiciais.</li>
                    </ul>

                    <h2 className="text-xl font-semibold text-primary mt-8 mb-4">4. Cookies e Tecnologias</h2>
                    <p className="mb-6">
                        Este site pode utilizar cookies técnicos essenciais para o funcionamento do carrinho de compras e para
                        lembrar suas preferências temporariamente enquanto você navega. Você pode desativar os cookies nas
                        configurações do seu navegador, mas isso pode comprometer a funcionalidade do pedido.
                    </p>

                    <h2 className="text-xl font-semibold text-primary mt-8 mb-4">5. Segurança</h2>
                    <p className="mb-6">
                        Adotamos medidas de segurança adequadas, incluindo o uso de protocolo HTTPS (criptografia), para proteger
                        seus dados contra acesso não autorizado. No entanto, nenhum método de transmissão pela Internet é 100% seguro.
                    </p>

                    <h2 className="text-xl font-semibold text-primary mt-8 mb-4">6. Seus Direitos (LGPD) e Contato</h2>
                    <p className="mb-4">
                        Você tem o direito de solicitar a confirmação, acesso, correção ou exclusão dos seus dados de nossa base.
                        Para exercer esses direitos ou tirar dúvidas, entre em contato através dos nossos canais oficiais:
                    </p>
                    <ul className="list-none space-y-2 mb-6 text-text-muted bg-surface-light p-4 rounded-xl border border-white/5">
                        <li><strong className="text-text">E-mail:</strong> contato@fomedepizzaitubera.com</li>
                        <li><strong className="text-text">WhatsApp/Telefone:</strong> O mesmo número utilizado para atendimento do Delivery.</li>
                        <li><strong className="text-text">Endereço Postal:</strong> Av. Hildebrando de Araújo Góes, 38, Praça da Bandeira, Ituberá - BA, 45435-000.</li>
                    </ul>
                </article>
            </main>

            <Footer />
        </div>
    );
}
