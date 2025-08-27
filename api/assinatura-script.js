// /assinatura-script.js
(function() {
    // Configura a chave pública do Asaas (é seguro tê-la no frontend)
    Asaas.CreditCard.setPublicKey(process.env.ASAAS_PUBLIC_KEY);

    const form = document.getElementById('subscription-form');
    const submitButton = document.getElementById('submit-button');
    const errorContainer = document.getElementById('form-error-feedback');

    form.addEventListener('submit', async function(event) {
        event.preventDefault();
        submitButton.disabled = true;
        submitButton.textContent = 'Processando...';
        errorContainer.classList.add('hidden');

        // Pega os dados do cadastro salvos no localStorage
        const registrationData = JSON.parse(localStorage.getItem('pendingRegistration'));
        if (!registrationData) {
            showError('Dados de cadastro não encontrados. Por favor, reinicie o processo.');
            return;
        }

        const card = {
            "holderName": document.getElementById('creditCardHolderName').value,
            "number": document.getElementById('creditCardNumber').value,
            "expiryMonth": document.getElementById('creditCardExpiry').value.split('/')[0].trim(),
            "expiryYear": document.getElementById('creditCardExpiry').value.split('/')[1].trim(),
            "ccv": document.getElementById('creditCardCcv').value
        };

        try {
            // Envia os dados do cartão diretamente para o Asaas e obtém o token
            const cardToken = await Asaas.CreditCard.tokenize(card);
            
            // Envia o token seguro para a nossa API
            const response = await fetch('/api/createSubscription', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    asaasCustomerId: registrationData.asaasCustomerId,
                    cardToken: cardToken
                })
            });

            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.message);
            }

            // Sucesso!
            localStorage.removeItem('pendingRegistration'); // Limpa os dados temporários
            window.location.href = 'login.html?signup=success';

        } catch (errors) {
            let errorMessage = 'Ocorreu um erro.';
            if (Array.isArray(errors)) { // Erros de validação do Asaas
                errorMessage = errors.map(e => e.description).join('\n');
            } else if (errors.message) { // Erros da nossa API
                errorMessage = errors.message;
            }
            showError(errorMessage);
        }
    });

    function showError(message) {
        errorContainer.textContent = message;
        errorContainer.classList.remove('hidden');
        submitButton.disabled = false;
        submitButton.textContent = 'Iniciar Teste Gratuito';
    }
})();
