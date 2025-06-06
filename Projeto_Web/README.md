Monitoramento de Sensores - Interface Web

Este projeto é uma página web simples feita com React e TypeScript para mostrar dados de sensores (temperatura, umidade) que vêm do Qubitro.

O que faz?

•
Busca dados dos sensores da API do Qubitro a cada 30 segundos.

•
Mostra os valores mais recentes em "cartões" na tela.

•
Exibe gráficos com o histórico de temperatura e umidade.

•
Muda a cor dos valores se estiverem muito altos ou baixos.

Como Rodar

1.
Instalar dependências:

•
Abra o terminal na pasta do projeto.

•
Rode: npm install



2.
Configurar a Conexão com Qubitro (Importante!):

•
Abra o arquivo src/App.tsx.

•
Encontre a linha com axios.get(...).

•
Substitua PROJECT_ID e DEVICE_ID pelos IDs corretos do Qubitro.

•
Substitua TOKEN pelo Token de API do Qubitro (obtido nas configurações do Qubitro).

No arquivo .env deve ter os tokens do Contentful SpaceID e CMA token. Caso o arquivo .env não esteja na raiz do projeto, deve criar novamente.

3.
Iniciar a Aplicação:

•
No terminal: npm run dev

•
Abra o navegador no endereço que aparecer (http://localhost:5173).



Arquivos Principais

•
src/App.tsx: Contém todo o código principal da página (busca de dados, exibição, gráficos).

•
src/App.css: Define a aparência da página (cores, layout, fontes).

•
package.json: Lista as bibliotecas que o projeto usa (React, axios, recharts).

Como Funciona (Resumo)

•
useState: Guarda os dados dos sensores e informações como "está carregando?" ou "deu erro?".

•
useEffect: É usado para buscar os dados do Qubitro assim que a página carrega e depois a cada 30 segundos.

•
axios: Biblioteca usada para fazer a "chamada" (requisição) para a API do Qubitro e pegar os dados.

•
recharts: Biblioteca usada para desenhar os gráficos de linha.

•
JSX (no return): É como escrevemos HTML dentro do JavaScript/React para definir como a página vai aparecer.
