const { onRequest } = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");
const admin = require('firebase-admin');
// Importando o SDK novo do Mercado Pago
const { MercadoPagoConfig, Preference, Payment } = require('mercadopago');

// Inicializa o Firebase Admin
admin.initializeApp();

// Configuração do Cliente com Access Token
const client = new MercadoPagoConfig({
    accessToken: 'APP_USR-6842105810050215-120919-32862a8d57bb824f55ca22b4a13dcc26-3052968345'
});

exports.criarPagamento = onRequest(async (req, res) => {
    // Configurar CORS para aceitar requisições do seu app
    res.set('Access-Control-Allow-Origin', '*');

    if (req.method === 'OPTIONS') {
        // Permite pre-flight requests
        res.set('Access-Control-Allow-Methods', 'POST');
        res.set('Access-Control-Allow-Headers', 'Content-Type');
        res.status(204).send('');
        return;
    }

    try {
        // 1. Recebe os dados do pedido vindos do App
        const pedido = req.body;

        // Exemplo: pedido = { id: "123", email: "cliente@email.com", valor: 50.00, titulo: "Pizza G" }

        // 2. Cria o objeto de preferência
        const preference = new Preference(client);

        const body = {
            items: [
                {
                    id: pedido.id,
                    title: pedido.titulo,
                    quantity: 1,
                    unit_price: Number(pedido.valor) // O valor deve ser numérico
                }
            ],
            payer: {
                email: pedido.email
            },
            // Referência externa para identificar o pedido no webhook
            external_reference: pedido.id,
            // Para onde o usuário volta após pagar (opcional)
            back_urls: {
                success: "https://suapizzaria.com/sucesso",
                failure: "https://suapizzaria.com/erro",
                pending: "https://suapizzaria.com/pendente"
            },
            auto_return: "approved",
        };

        // 3. Envia para o Mercado Pago
        const result = await preference.create({ body });

        // 4. Retorna o ID e o Link para o App
        res.json({
            id: result.id,
            url_pagamento: result.init_point, // Link para webview ou navegador
        });

    } catch (error) {
        logger.error("Erro ao criar preferência MP", error);
        res.status(500).send(error);
    }
});

// --- INÍCIO DO CÓDIGO DO WEBHOOK ---

// Função que o Mercado Pago chama quando o pagamento é aprovado
exports.receberNotificacaoMP = onRequest(async (req, res) => {
    const { type, data } = req.body;

    // Filtra apenas notificações de pagamento
    if (type === 'payment' || req.body.topic === 'payment') {
        const idPagamento = data?.id || req.body.resource;

        try {
            // Consulta o Mercado Pago para confirmar se está pago mesmo
            const paymentClient = new Payment(client);

            const pagamentoInfo = await paymentClient.get({ id: idPagamento });

            if (pagamentoInfo.status === 'approved') {
                const idPedidoInterno = pagamentoInfo.external_reference;

                // Atualiza o pedido no banco de dados
                await admin.firestore()
                    .collection('pedidos')
                    .doc(idPedidoInterno)
                    .update({
                        status: 'em_preparo',
                        pagamento_id: idPagamento,
                        data_pagamento: admin.firestore.FieldValue.serverTimestamp()
                    });

                logger.info(`Pagamento aprovado para o pedido ${idPedidoInterno}`);
            }
        } catch (error) {
            logger.error("Erro no webhook", error);
        }
    }
    res.status(200).send("OK");
});
