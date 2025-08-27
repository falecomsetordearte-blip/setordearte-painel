// /api/createSubscription.js
const axios = require('axios');

const ASAAS_API_KEY = process.env.ASAAS_API_KEY;
const ASAAS_API_URL = process.env.ASAAS_API_URL || 'https://www.asaas.com/api/v3';

module.exports = async (req, res) => {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Método não permitido.' });
    }

    try {
        const { asaasCustomerId, cardToken } = req.body;
        if (!asaasCustomerId || !cardToken) {
            return res.status(400).json({ message: 'Dados de cliente e cartão são obrigatórios.' });
        }
        
        // Define a data do primeiro vencimento para 30 dias no futuro
        const nextDueDate = new Date();
        nextDueDate.setDate(nextDueDate.getDate() + 30);

        const subscriptionData = {
            customer: asaasCustomerId,
            creditCardToken: cardToken,
            billingType: "CREDIT_CARD",
            nextDueDate: nextDueDate.toISOString().split('T')[0],
            value: 89,
            cycle: "MONTHLY",
            description: "Assinatura Mensal - Painel Setor de Arte"
        };
        
        const response = await axios.post(`${ASAAS_API_URL}/subscriptions`, subscriptionData, {
            headers: { 'access_token': ASAAS_API_KEY }
        });

        return res.status(200).json({ success: true, subscription: response.data });

    } catch (error) {
        console.error("Erro ao criar assinatura:", error.response ? error.response.data : error.message);
        const errorMessage = error.response?.data?.errors?.[0]?.description || 'Falha ao processar assinatura.';
        return res.status(500).json({ message: errorMessage });
    }
};
