const { v4: uuidv4 } = require('uuid');
const axios = require('axios');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');

// Pega as chaves secretas das Variáveis de Ambiente
const BITRIX24_API_URL = process.env.BITRIX24_API_URL;
const ASAAS_API_KEY = process.env.ASAAS_API_KEY;
const EMAIL_HOST = process.env.EMAIL_HOST;
const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASS = process.env.EMAIL_PASS;

// A sintaxe aqui muda de 'export default' para 'module.exports'
module.exports = async (req, res) => {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Método não permitido' });
    }

    try {
        const {
            nomeEmpresa,
            cnpj,
            telefoneEmpresa,
            nomeResponsavel,
            email,
            senha
        } = req.body;
        
        // ETAPA 1: VERIFICAR SE O E-MAIL JÁ EXISTE NO BITRIX24
        const searchUserResponse = await axios.post(`${BITRIX24_API_URL}crm.contact.list.json`, {
            filter: { 'EMAIL': email },
            select: ['ID']
        });

        if (searchUserResponse.data.result.length > 0) {
            return res.status(409).json({ status: "error", message: "Este e-mail já está cadastrado em nosso sistema." });
        }

        // ETAPA 2: GERAR TOKEN E HASH DA SENHA
        const sessionToken = uuidv4();
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(senha, salt);
        const trialEndDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

        // ETAPA 3: CRIAR COMPANY NO BITRIX24
        const createCompanyResponse = await axios.post(`${BITRIX24_API_URL}crm.company.add.json`, {
            fields: {
                TITLE: nomeEmpresa,
                PHONE: [{ VALUE: telefoneEmpresa, VALUE_TYPE: 'WORK' }],
                'UF_CRM_CNPJ': cnpj // IMPORTANTE: SUBSTITUA PELO SEU CÓDIGO TÉCNICO
            }
        });
        const companyId = createCompanyResponse.data.result;

        // ETAPA 4: CRIAR CONTATO NO BITRIX24
        await axios.post(`${BITRIX24_API_URL}crm.contact.add.json`, {
            fields: {
                NAME: nomeResponsavel,
                EMAIL: [{ VALUE: email, VALUE_TYPE: 'WORK' }],
                COMPANY_ID: companyId,
                'UF_CRM_PASSWORD_HASH': hashedPassword,
                'UF_CRM_SESSION_TOKEN': sessionToken,
                'UF_CRM_VERIFICADO': 'Não',
                'UF_CRM_ASSINATURA_ATIVA': 'Yes',
                'UF_CRM_TRIAL_END_DATE': trialEndDate,
                'UF_CRM_TRIAL': 'YES'
            }
        });
        
        // ETAPA 5: CRIAR CLIENTE NO ASAAS
        const createAsaasCustomerResponse = await axios.post('https://www.asaas.com/api/v3/customers', {
            name: nomeEmpresa,
            cpfCnpj: cnpj
        }, { headers: { 'access_token': ASAAS_API_KEY } });
        const asaasCustomerId = createAsaasCustomerResponse.data.id;

        // ETAPA 6: GERAR LINK DE PAGAMENTO DA ASSINATURA
        const nextDueDate = new Date();
        nextDueDate.setDate(nextDueDate.getDate() + 30);
        
        const createPaymentLinkResponse = await axios.post('https://www.asaas.com/api/v3/paymentLinks', {
            name: "Assinatura Mensal - Setor de Arte",
            description: "Plano mensal com 30 dias de teste gratuito.",
            billingType: "CREDIT_CARD", chargeType: "RECURRENT", subscription: true,
            value: 89, cycle: "MONTHLY",
            nextDueDate: nextDueDate.toISOString().split('T')[0],
            customer: asaasCustomerId
        }, { headers: { 'access_token': ASAAS_API_KEY } });
        const checkoutUrl = createPaymentLinkResponse.data.url;

        // ETAPA 7: ENVIAR E-MAIL DE VERIFICAÇÃO
        const transporter = nodemailer.createTransport({
            host: EMAIL_HOST, port: 587, secure: false,
            auth: { user: EMAIL_USER, pass: EMAIL_PASS },
        });
        const verificationLink = `https://app.setordearte.com.br/verificacao?token=${sessionToken}&action=ativar_conta`;
        await transporter.sendMail({ /* ... seu código de e-mail aqui ... */ });

        // ETAPA FINAL: RETORNAR O LINK
        return res.status(200).json({ checkoutUrl: checkoutUrl });

    } catch (error) {
        console.error('Erro detalhado no cadastro:', error.response ? error.response.data : error.message);
        if (error.responseCode === 550 || (error.command && error.command.includes('RCPT TO'))) {
             return res.status(400).json({ status: "error", message: "E-mail inválido." });
        }
        return res.status(500).json({ message: 'Ocorreu um erro interno durante o cadastro.' });
    }
};
