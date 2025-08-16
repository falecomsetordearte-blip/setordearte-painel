const axios = require('axios');

const BITRIX24_API_URL = process.env.BITRIX24_API_URL;
// A chave do Asaas não é usada aqui, pois o saldo vem do Bitrix, mas podemos deixar para futuras ações.
const ASAAS_API_KEY = process.env.ASAAS_API_KEY;

module.exports = async (req, res) => {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Método não permitido' });
    }

    try {
        const { token: sessionToken } = req.body;
        if (!sessionToken) {
            return res.status(400).json({ message: 'Token de sessão é obrigatório.' });
        }

        // ETAPA 1: Buscar o contato que CONTÉM o token de sessão
        const searchUserResponse = await axios.post(`${BITRIX24_API_URL}crm.contact.list.json`, {
            filter: { '%UF_CRM_1751824225': sessionToken }, // A MUDANÇA ESTÁ AQUI
            select: ['*', 'UF_*']
        });

        const user = searchUserResponse.data.result[0];

        if (!user) {
            return res.status(401).json({ message: 'Sessão inválida ou expirada.' });
        }

        // ETAPA 2: Pegar todos os dados diretamente do usuário encontrado no Bitrix24
        const saldo = user.UF_CRM_SALDO || 0; // Use o nome técnico REAL do seu campo de saldo
        const statusConta = user.UF_CRM_CONTA_ATIVA; // Use o nome técnico REAL do seu campo de conta ativa
        
        // ETAPA 3: Buscar a lista de pedidos (Deals) do cliente
        const dealsResponse = await axios.post(`${BITRIX24_API_URL}crm.deal.list.json`, {
            filter: { 'CONTACT_ID': user.ID },
            order: { 'ID': 'DESC' }
        });
        const pedidos = dealsResponse.data.result;

        // ETAPA 4: Verificar se o usuário ainda está em período de teste
        let trialEndDate = null;
        if (user.UF_CRM_TRIAL === '1') { // Verificando como booleano (1 para Sim)
            trialEndDate = user.UF_CRM_TRIAL_END_DATE; // Use o nome técnico REAL do seu campo de data
        }
        
        // ETAPA FINAL: Montar e enviar a resposta
        return res.status(200).json({
            saldo: saldo,
            pedidos: pedidos,
            statusConta: statusConta,
            trialEndDate: trialEndDate,
            userName: user.NAME
        });

    } catch (error) {
        console.error('Erro ao carregar dados do painel:', error.response ? error.response.data : error.message);
        return res.status(500).json({ message: 'Ocorreu um erro ao carregar os dados do painel.' });
    }
};
