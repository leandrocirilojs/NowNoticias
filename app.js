// Lista de múltiplas API keys


const apiKeys = [
    'd0f0562569f2218c07ae169682baa311',
    '35c3cdade3bdc0832a425a58a8318194',
    '1a3754dc43e03659f93f4f8a0d6270e1',
    '393bec881298b81d998019ceae394641'
];
let currentKeyIndex = 0;
let page = 1;
let currentQuery = 'tecnologia';

// Função para obter a API key atual
function getCurrentApiKey() {
    return apiKeys[currentKeyIndex];
}

// Função para trocar para a próxima API key
function rotateApiKey() {
    currentKeyIndex++;
    if (currentKeyIndex >= apiKeys.length) {
        currentKeyIndex = 0; // Volta ao início
        return false; // Todas as chaves foram testadas
    }
    return true; // Ainda existem chaves para testar
}

// Função para buscar notícias
async function fetchNews(query) {
    let attempts = 0;
    while (attempts < apiKeys.length) {
        const apiKey = getCurrentApiKey();
        const apiUrl = `https://gnews.io/api/v4/search?q=${encodeURIComponent(query)}&lang=pt&country=br&token=${apiKey}&max=30&page=${page}`;
        
        try {
            const response = await fetch(apiUrl);
            
            if (response.status === 429) { // Limite de requisições atingido
                alert(`Limite atingido para a chave ${apiKey}. Tentando a próxima...`);
                if (!rotateApiKey()) {
                    alert('Todas as chaves foram utilizadas. Tente novamente mais tarde.');
                    return;
                }
                attempts++;
                continue; // Tenta novamente com a nova chave
            }

            if (!response.ok) throw new Error(`Erro: ${response.status}`);
            
            const data = await response.json();
            const newsContainer = document.getElementById('news-container');
            if (page === 1) newsContainer.innerHTML = ''; // Limpar resultados anteriores em nova busca

            // Exibir resultados
            if (data.articles && data.articles.length > 0) {
                data.articles.forEach(article => {
                    const newsItem = document.createElement('div');
                    newsItem.classList.add('news-item');

                    // Verificar se a imagem existe na postagem
                    let imageUrl = article.image || article.urlToImage;
                    let imageElement = '';
                    if (imageUrl) {
                        imageElement = `<img src="${imageUrl}" alt="Imagem da notícia" class="news-image" />`;
                    }

                    newsItem.innerHTML = `
                        ${imageElement}  <!-- Adiciona a imagem aqui -->
                        <div style="padding: 12px;">
                        <h3><a href="${article.url}" target="_blank">${article.title}</a></h3>
                        <p>${article.source.name}</p>
                        <p>${new Date(article.publishedAt).toISOString().split('T')[0]}</p>
                        <button onclick="openModal('${article.url}')">Read More...</button>
                        </div>
                    `;
                    
                    newsContainer.appendChild(newsItem);
                });
            } else {
                newsContainer.innerHTML = '<p>Nenhuma notícia encontrada para sua pesquisa.</p>';
            }
            return; // Sai do loop se a chamada for bem-sucedida

        } catch (error) {
            console.error('Erro ao buscar notícias:', error);
            if (!rotateApiKey()) {
                alert('Ocorreu um erro inesperado ou todas as chaves foram utilizadas.');
                return;
            }
            attempts++;
        }
    }
}

// Função para abrir o modal com a notícia
function openModal(url) {
    const iframe = document.getElementById('news-iframe');
    iframe.src = url;
    document.getElementById('modal').style.display = 'flex';
}

// Fechar modal
document.getElementById('close-modal').onclick = function () {
    document.getElementById('modal').style.display = 'none';
    document.getElementById('news-iframe').src = '';
};

// Buscar notícias ao enviar o formulário
document.getElementById('search-form').onsubmit = function (event) {
    event.preventDefault();
    currentQuery = document.getElementById('search-input').value; // Pode ter múltiplas palavras
    page = 1;
    fetchNews(currentQuery); // Passa a query com múltiplas palavras
};

// Carregar mais notícias ao rolar a página
window.onscroll = function () {
    if (window.innerHeight + window.scrollY >= document.body.offsetHeight) {
        page++;
        fetchNews(currentQuery);
    }
};
//categoria
function searchByCategory(category) {
    const searchInput = document.getElementById('search-input');
    searchInput.value = category; // Preenche o campo de busca com a categoria
    currentQuery = category; // Atualiza a query atual
    page = 1; // Reseta para a primeira página
    fetchNews(currentQuery); // Busca as notícias
}

function showDollarRate() {
    // A API para obter a cotação do dólar
    const apiKey = '8a5c7364f58fdd9dffe7e030';  // Substitua pela sua chave da API
    const url = `https://v6.exchangerate-api.com/v6/${apiKey}/latest/USD`;

    fetch(url)
        .then(response => response.json())
        .then(data => {
            alert(data)
            const dolarParaReal = data.conversion_rates.BRL;
            
            const rateText = document.getElementById('rate-text');

            
            rateText.textContent = `1 USD = ${dolarParaReal} BRL`;
            
        })
        .catch(error => {
            console.error('Erro ao buscar a cotação do dólar:', error);
        });
}

// Carregar notícias iniciais
fetchNews(currentQuery);
