const { v4: uuidv4 } = require('uuid');
const axios = require('axios');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');

const BITRIX24_API_URL = process.env.BITRIX24_API_URL;
const ASAAS_API_KEY = process.env.ASAAS_API_KEY;
const EMAIL_HOST = process.env.EMAIL_HOST;
const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASS = process.env.EMAIL_PASS;

module.exports = async (req, res) => {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Método não permitido' });
    }

    const { nomeEmpresa, cnpj, telefoneEmpresa, nomeResponsavel, email, senha } = req.body;

    // BLOCO DE VALIDAÇÃO (agora separado e correto)
    if (!nomeEmpresa || !cnpj || !telefoneEmpresa || !nomeResponsavel || !email || !senha) {
        return res.status(400).json({ message: 'Todos os campos são obrigatórios.' });
    }

    let companyId = null;
    let contactId = null;

    try {
        // ETAPA 1: VERIFICAR E-MAIL EXISTENTE
        const searchUserResponse = await axios.post(`${BITRIX24_API_URL}crm.contact.list.json`, {
            filter: { 'EMAIL': email }, select: ['ID']
        });
        if (searchUserResponse.data.result.length > 0) {
            return res.status(409).json({ message: "Este e-mail já está cadastrado." });
        }

        // ETAPA 2: GERAR DADOS
        const sessionToken = uuidv4();
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(senha, salt);
        const trialEndDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

        // ETAPA 3: CRIAR COMPANY
        const createCompanyResponse = await axios.post(`${BITRIX24_API_URL}crm.company.add.json`, {
            fields: { TITLE: nomeEmpresa, PHONE: [{ VALUE: telefoneEmpresa, VALUE_TYPE: 'WORK' }], 'UF_CRM_CNPJ': cnpj }
        });
        companyId = createCompanyResponse.data.result;
        if (!companyId) throw new Error('Falha ao criar empresa no CRM.');
        
        // ETAPA 4: CRIAR CONTATO
        const nameParts = nomeResponsavel.split(' ');
        const firstName = nameParts.shift();
        const lastName = nameParts.join(' ');

        const createContactResponse = await axios.post(`${BITRIX24_API_URL}crm.contact.add.json`, {
            fields: {
                NAME: firstName,
                LAST_NAME: lastName,
                EMAIL: [{ VALUE: email, VALUE_TYPE: 'WORK' }],
                COMPANY_ID: companyId,
                'UF_CRM_1751824202': hashedPassword,
                'UF_CRM_1751824225': sessionToken,
                'UF_CRM_1751829758': 'Não',
                'UF_CRM_1755112398691': 'Yes',
                'UF_CRM_1755120026423': trialEndDate,
                'UF_CRM_1755120362390': 'YES',
                'UF_CRM_174535288724': email
            }
        });
        contactId = createContactResponse.data.result;
        if (!contactId) throw new Error('Falha ao criar contato no CRM.');
        
        // ETAPA 5: CRIAR CLIENTE NO ASAAS
        const createAsaasCustomerResponse = await axios.post('https://www.asaas.com/api/v3/customers', 
            { name: nomeEmpresa, cpfCnpj: cnpj }, 
            { headers: { 'access_token': ASAAS_API_KEY } }
        );
        const asaasCustomerId = createAsaasCustomerResponse.data.id;

        // ETAPA 5.1: ATUALIZAR CONTATO NO BITRIX COM O ID DO ASAAS
        await axios.post(`${BITRIX24_API_URL}crm.contact.update.json`, {
            id: contactId,
            fields: { 'UF_CRM_1748911653': asaasCustomerId }
        });

        // ETAPA 6: GERAR LINK DE PAGAMENTO
        const nextDueDate = new Date();
        nextDueDate.setDate(nextDueDate.getDate() + 30);
        const createPaymentLinkResponse = await axios.post('https://www.asaas.com/api/v3/paymentLinks', {
             name: "Assinatura Mensal - Setor de Arte", description: "Plano mensal com 30 dias de teste gratuito.",
             billingType: "CREDIT_CARD", chargeType: "RECURRENT", subscription: true, value: 89, cycle: "MONTHLY",
             nextDueDate: nextDueDate.toISOString().split('T')[0], customer: asaasCustomerId
        }, { headers: { 'access_token': ASAAS_API_KEY } });
        const checkoutUrl = createPaymentLinkResponse.data.url;

        // ETAPA 7: ENVIAR E-MAIL
        const transporter = nodemailer.createTransport({
            host: EMAIL_HOST, port: 587, secure: false,
            auth: { user: EMAIL_USER, pass: EMAIL_PASS, },
        });

        const verificationLink = `https://app.setordearte.com.br/verificacao?token=${sessionToken}&action=ativar_conta`;

        await transporter.sendMail({
            from: `"Setor de Arte" <${EMAIL_USER}>`,
            to: email, subject: "Ative sua conta no Setor de Arte",
            html: `... SEU HTML DE E-MAIL AQUI ...`
        });
        
        // ETAPA FINAL: SUCESSO
        return res.status(200).json({ checkoutUrl: checkoutUrl });

    } catch (error) {
        console.error('Erro no processo de cadastro:', error.response ? error.response.data : error.message);
        
        if (contactId) { await axios.post(`${BITRIX24_API_URL}crm.contact.delete.json`, { id: contactId }); }
        if (companyId) { await axios.post(`${BITRIX24_API_URL}crm.company.delete.json`, { id: companyId }); }
        
        return res.status(500).json({ message: 'Ocorreu um erro ao processar seu cadastro. Por favor, tente novamente.' });
    }
};
