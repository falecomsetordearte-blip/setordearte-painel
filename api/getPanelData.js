// Importa a ferramenta 'axios' para fazer chamadas de API
const axios = require('axios');

// Pega as chaves secretas das Variáveis de Ambiente que configuraremos na Vercel
const BITRIX24_API_URL = process.env.BITRIX24_API_URL;
const ASAAS_API_KEY = process.env.ASAAS_API_KEY;

// Função principal que a Vercel executará quando esta API for chamada
export default async function handler(req, res) {
    // Medida de segurança: apenas aceita requisições do tipo POST
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Método não permitido' });
    }

    try {
        // Pega o token da sessão que o front-end enviou
        const { token: sessionToken } = req.body;
        if (!sessionToken) {
            return res.status(400).json({ message: 'Token de sessão é obrigatório.' });
        }

        // ETAPA 1: Buscar o usuário no Bitrix24 pelo token de sessão
        const searchUserResponse = await axios.post(`${BITRIX24_API_URL}crm.contact.list.json`, {
            filter: { 'UF_CRM_SESSION_TOKEN': sessionToken }, // IMPORTANTE: Use o nome técnico REAL do seu campo
            select: ['*', 'UF_*']
        });

        const user = searchUserResponse.data.result[0];

        if (!user) {
            return res.status(401).json({ message: 'Sessão inválida ou expirada.' });
        }

        const asaasCustomerId = user.UF_CRM_ASAAS_CUSTOMER_ID;
        const statusConta = user.UF_CRM_CONTA_ATIVA;

        // ETAPA 2: Buscar o saldo de créditos do cliente no Asaas
        const asaasBalanceResponse = await axios.get(`https://www.asaas.com/api/v3/customers/${asaasCustomerId}/balance`, {
            headers: { 'access_token': ASAAS_API_KEY }
        });
        const saldo = asaasBalanceResponse.data.balance;

        // ETAPA 3: Buscar a lista de pedidos (Deals) do cliente no Bitrix24
        const dealsResponse = await axios.post(`${BITRIX24_API_URL}crm.deal.list.json`, {
            filter: { 'CONTACT_ID': user.ID },
            order: { 'ID': 'DESC' }
        });
        const pedidos = dealsResponse.data.result;

        // ETAPA 4: Verificar se o usuário ainda está em período de teste
        let trialEndDate = null;
        if (user.UF_CRM_TRIAL === 'Sim') {
            trialEndDate = user.UF_CRM_TRIALENDDATE;
        }
        
        // ETAPA FINAL: Montar e enviar a resposta de volta para o seu front-end
        res.status(200).json({
            saldo: saldo,
            pedidos: pedidos,
            statusConta: statusConta,
            trialEndDate: trialEndDate,
            userName: user.NAME
        });

    } catch (error) {
        console.error('Erro na API /api/getPanelData:', error.response ? error.response.data : error.message);
        res.status(500).json({ message: 'Ocorreu um erro ao carregar os dados do painel.' });
    }
}
