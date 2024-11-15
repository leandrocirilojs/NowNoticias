
        // Lista de múltiplas API keys
        const apiKeys = [
                '393bec881298b81d998019ceae394641',
            '35c3cdade3bdc0832a425a58a8318194',
            '1a3754dc43e03659f93f4f8a0d6270e1'
            
        ];
        let currentKeyIndex = 0;
        let page = 1;
        let currentQuery = 'programação';

        // Função para obter a API key atual
        function getCurrentApiKey() {
            return apiKeys[currentKeyIndex];
        }

        // Função para trocar para a próxima API key
        function rotateApiKey() {
            currentKeyIndex = (currentKeyIndex + 1) % apiKeys.length;
        }

        // Função para buscar notícias
        async function fetchNews(query) {
            const apiKey = getCurrentApiKey();
            const apiUrl = `https://gnews.io/api/v4/search?q=${encodeURIComponent(query)}&lang=pt&country=br&token=${apiKey}&max=10&page=${page}`;
            
            try {
                const response = await fetch(apiUrl);
                if (response.status === 429) { // Limite de requisições atingido
                    console.warn(`Limite atingido para a chave ${apiKey}. Trocando chave...`);
                    rotateApiKey();
                    return fetchNews(query); // Tenta novamente com a nova chave
                }
                if (!response.ok) throw new Error(`Erro: ${response.status}`);
                const data = await response.json();

                const newsContainer = document.getElementById('news-container');
                if (page === 1) newsContainer.innerHTML = '';

                data.articles.forEach(article => {
                    const newsItem = document.createElement('div');
                    newsItem.classList.add('news-item');
                    newsItem.innerHTML = `
                        <h3>${article.title}</h3>
                        <p>${article.source.name}</p>
                        <button onclick="openModal('${article.url}')">Leia mais</button>
                    `;
                    newsContainer.appendChild(newsItem);
                });
            } catch (error) {
                console.error('Erro ao buscar notícias:', error);
                alert('Todas as chaves foram utilizadas ou ocorreu um erro.');
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
            currentQuery = document.getElementById('search-input').value;
            page = 1;
            fetchNews(currentQuery);
        };

        // Carregar mais notícias ao rolar a página
        window.onscroll = function () {
            if (window.innerHeight + window.scrollY >= document.body.offsetHeight) {
                page++;
                fetchNews(currentQuery);
            }
        };

        // Carregar notícias iniciais
        fetchNews(currentQuery);
    
