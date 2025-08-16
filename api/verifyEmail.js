const axios = require('axios');

const BITRIX24_API_URL = process.env.BITRIX24_API_URL;

module.exports = async (req, res) => {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Método não permitido' });
    }

    try {
        const { token } = req.body;

        if (!token) {
            return res.status(400).json({ message: 'Token de verificação não fornecido.' });
        }

        // ETAPA 1: Encontrar o contato no Bitrix24 que possui este token de sessão
        // A busca continua sendo pelo token, que é o identificador único e seguro da verificação.
        const searchUserResponse = await axios.post(`${BITRIX24_API_URL}crm.contact.list.json`, {
            filter: { 'UF_CRM_1751824225': token }, // Procura pelo campo Session Token (UF do token)
            select: ['ID', 'UF_CRM_1751829758'] // Pega o ID e o status atual de verificação (UF do campo "Verificado")
        });

        const contact = searchUserResponse.data.result[0];

        // Se nenhum contato for encontrado com este token, o link é inválido, já foi usado, ou expirou.
        // A mensagem genérica é a mais segura.
        if (!contact) {
            return res.status(404).json({ message: 'Token de verificação inválido ou expirado.' });
        }

        // Se o contato já está verificado, não fazemos nada, apenas retornamos sucesso para o usuário poder logar.
        if (contact.UF_CRM_1751829758 === 'Yes') { // 'Yes' ou o valor que você usa para "Verificado = Sim"
            return res.status(200).json({ status: 'success', message: 'E-mail já havia sido verificado.' });
        }

        // ETAPA 2: Atualizar o campo "Verificado" para "Yes"
        await axios.post(`${BITRIX24_API_URL}crm.contact.update.json`, {
            id: contact.ID,
            fields: {
                'UF_CRM_1751829758': 'Yes' // Altera o campo "Verificado" para "Sim"
            }
        });

        // ETAPA FINAL: Retornar sucesso
        return res.status(200).json({ status: 'success', message: 'E-mail verificado com sucesso!' });

    } catch (error) {
        console.error('Erro na verificação de e-mail:', error.response ? error.response.data : error.message);
        // Em caso de falha de comunicação com a API do Bitrix, etc., retornamos um erro genérico.
        return res.status(500).json({ message: 'Ocorreu um erro interno ao verificar seu e-mail.' });
    }
};
