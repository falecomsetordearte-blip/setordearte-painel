const axios = require('axios');
const bcrypt = require('bcryptjs');
const { randomBytes } = require('crypto');

const BITRIX24_API_URL = process.env.BITRIX24_API_URL;

module.exports = async (req, res) => {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Método não permitido' });
    }

    try {
        const { email, senha } = req.body;

        if (!email || !senha) {
            return res.status(400).json({ message: 'E-mail e senha são obrigatórios.' });
        }

        // ETAPA 1: Buscar o usuário pelo e-mail de login no campo personalizado
        const searchUserResponse = await axios.post(`${BITRIX24_API_URL}crm.contact.list.json`, {
            filter: { 'UF_CRM_174535288724': email }, // Busca pelo seu campo de "E-mail de Acesso"
            select: ['ID', 'NAME', 'UF_CRM_1751824202', 'UF_CRM_1751824225'] // Pega ID, Nome, Hash da Senha e o campo dos Tokens
        });

        const user = searchUserResponse.data.result[0];

        if (!user) {
            return res.status(401).json({ message: 'E-mail ou senha inválidos.' });
        }

        const storedHash = user.UF_CRM_1751824202; // Campo do Hash da Senha
        if (!storedHash) {
            return res.status(401).json({ message: 'Conta não configurada para login. Por favor, contate o suporte.' });
        }

        // ETAPA 2: Comparar a senha enviada com o hash salvo
        const isMatch = await bcrypt.compare(senha, storedHash);

        if (!isMatch) {
            return res.status(401).json({ message: 'E-mail ou senha inválidos.' });
        }

        // ETAPA 3: SENHA CORRETA! Gerar novo token e adicionar à lista existente
        const newSessionToken = randomBytes(32).toString('hex');
        
        // Pega os tokens existentes, ou começa uma string vazia se o campo for nulo
        const existingTokens = user.UF_CRM_1751824225 || '';

        // Adiciona o novo token à string, separado por uma vírgula.
        // O `trim()` remove espaços em branco extras para garantir que não haja vírgulas duplas.
        const updatedTokens = existingTokens ? `${existingTokens.trim()},${newSessionToken}` : newSessionToken;

        // Atualiza o contato no Bitrix24 com a nova lista de tokens
        await axios.post(`${BITRIX24_API_URL}crm.contact.update.json`, {
            id: user.ID,
            fields: {
                'UF_CRM_1751824225': updatedTokens // Salva a string atualizada de tokens
            }
        });

        // ETAPA FINAL: Enviar o novo token e o nome do usuário para o front-end
        return res.status(200).json({ 
            token: newSessionToken, 
            userName: user.NAME 
        });

    } catch (error) {
        console.error('Erro no processo de login:', error.response ? error.response.data : error.message);
        return res.status(500).json({ message: 'Ocorreu um erro interno. Tente novamente mais tarde.' });
    }
};
