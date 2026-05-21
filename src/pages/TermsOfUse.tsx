import { Footer } from '../components/Footer';
import { Pizza, ChevronLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export function TermsOfUse() {
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
                    <h1 className="text-3xl font-bold mb-2">Termos de Uso</h1>
                    <p className="text-text-muted mb-8">Última atualização: 10 de Dezembro de 2025</p>

                    <p className="mb-6">
                        Bem-vindo à Fome de Pizza. Ao acessar e utilizar nosso site para fazer pedidos, você concorda com os termos e condições descritos abaixo.
                    </p>

                    <h2 className="text-xl font-semibold text-primary mt-8 mb-4">1. O Serviço</h2>
                    <p className="mb-6">
                        O nosso site funciona como um catálogo digital e ferramenta para facilitar o pedido de pizzas, pastéis e bebidas para entrega (delivery) ou retirada.
                    </p>

                    <h2 className="text-xl font-semibold text-primary mt-8 mb-4">2. Realização de Pedidos</h2>
                    <ul className="list-disc pl-5 space-y-2 mb-6 text-text-muted">
                        <li>Ao finalizar um pedido no site, você declara que as informações fornecidas (especialmente endereço e telefone) são verdadeiras e precisas.</li>
                        <li>A confirmação do pedido está sujeita à disponibilidade dos ingredientes e à área de cobertura de entrega em Ituberá e região.</li>
                        <li>Nos reservamos o direito de recusar pedidos de clientes com histórico de inadimplência ou trotes.</li>
                    </ul>

                    <h2 className="text-xl font-semibold text-primary mt-8 mb-4">3. Preços e Pagamento</h2>
                    <ul className="list-disc pl-5 space-y-2 mb-6 text-text-muted">
                        <li>Os preços apresentados no site podem ser alterados sem aviso prévio. O preço válido é o que consta no momento da finalização da compra.</li>
                        <li>As formas de pagamento aceitas (ex: Dinheiro, Pix, Cartão na Entrega) são informadas no checkout.</li>
                        <li>Taxas de entrega podem variar conforme o bairro.</li>
                    </ul>

                    <h2 className="text-xl font-semibold text-primary mt-8 mb-4">4. Cancelamento e Trocas</h2>
                    <ul className="list-disc pl-5 space-y-2 mb-6 text-text-muted">
                        <li><strong className="text-text">Cancelamento pelo Cliente:</strong> Pode ser feito apenas se o pedido ainda não tiver entrado em preparação (geralmente nos primeiros 5-10 minutos). Entre em contato imediatamente pelo nosso WhatsApp de atendimento.</li>
                        <li><strong className="text-text">Erro no Pedido:</strong> Caso receba um produto diferente do solicitado ou com defeito de qualidade, entre em contato no ato do recebimento para efetuarmos a troca ou reembolso.</li>
                    </ul>

                    <h2 className="text-xl font-semibold text-primary mt-8 mb-4">5. Limitação de Responsabilidade</h2>
                    <p className="mb-4">
                        A Fome de Pizza se esforça para cumprir os prazos de entrega informados, porém, estes são estimativas. Não nos responsabilizamos por atrasos decorrentes de:
                    </p>
                    <ul className="list-disc pl-5 space-y-2 mb-6 text-text-muted">
                        <li>Fatores climáticos (chuvas fortes).</li>
                        <li>Trânsito excessivo ou acidentes.</li>
                        <li>Falta de energia ou força maior.</li>
                    </ul>
                    <p className="mb-6 mt-4 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg text-yellow-500 text-sm">
                        <strong className="block mb-1">Alergênicos:</strong>
                        Nossos produtos contêm glúten, lactose e podem conter traços de outros alérgenos. É responsabilidade do cliente informar restrições alimentares graves antes de pedir.
                    </p>

                    <h2 className="text-xl font-semibold text-primary mt-8 mb-4">6. Propriedade Intelectual</h2>
                    <p className="mb-6">
                        Todo o design do site, logotipos, fotos de produtos e textos são propriedade da Fome de Pizza ou utilizados sob licença. É proibida a cópia ou reprodução sem autorização.
                    </p>

                    <h2 className="text-xl font-semibold text-primary mt-8 mb-4">7. Foro</h2>
                    <p className="mb-6">
                        Para dirimir quaisquer dúvidas oriundas destes termos, fica eleito o foro da comarca de Ituberá - BA, com renúncia a qualquer outro, por mais privilegiado que seja.
                    </p>
                </article>
            </main>

            <Footer />
        </div>
    );
}
