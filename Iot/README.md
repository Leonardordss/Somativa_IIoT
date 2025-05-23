# Guia da Interface Web para Monitoramento de Sensores

Este documento explica como a interface web funciona e como conectá-la ao Qubitro para visualizar os dados dos sensores da plantação e do tanque.

## Estrutura do Projeto

A interface web foi desenvolvida usando React com TypeScript e inclui:

1. **App.tsx**: Componente principal que busca e exibe os dados dos sensores
2. **App.css**: Estilos para a interface
3. **Bibliotecas**:
   - **axios**: Para fazer requisições HTTP à API do Qubitro
   - **recharts**: Para criar gráficos de linha mostrando o histórico de dados

## Como a Interface Funciona

### 1. Busca de Dados

A interface se conecta à API do Qubitro para buscar os dados dos sensores:

```typescript
const fetchData = async () => {
  try {
    // Faz uma requisição à API do Qubitro
    const response = await axios.get('https://api.qubitro.com/v1/projects/eea3da5b-fa78-41bb-bf85-0f8470cc2f42/devices/eea3da5b-fa78-41bb-bf85-0f8470cc2f42/data', {
      headers: {
        'Authorization': 'Bearer SEU_TOKEN_AQUI',
        'Content-Type': 'application/json'
      }
    });
    
    // Processa os dados recebidos
    const formattedData = response.data.map((item: any) => ({
      timestamp: new Date(item.timestamp).toLocaleString(),
      sensor1: item.sensor1,
      sensor2: item.sensor2,
      sensor3: item.sensor3,
      sensor4: item.sensor4,
      sensor5: item.sensor5,
      umidade1: item.umidade1,
      umidade2: item.umidade2,
      umidade3: item.umidade3,
      umidade4: item.umidade4
    }));
    
    // Atualiza o estado com os dados formatados
    setSensorData(formattedData);
    
    // Define os dados mais recentes
    if (formattedData.length > 0) {
      setLatestData(formattedData[0]);
    }
  } catch (err) {
    // Em caso de erro, exibe uma mensagem e usa dados fictícios para demonstração
    console.error('Erro ao buscar dados:', err);
    setError('Falha ao buscar dados dos sensores.');
    
    // Cria dados fictícios para demonstração
    // ... (código para criar dados fictícios)
  }
};
```

### 2. Atualização Automática

A interface busca dados automaticamente a cada 30 segundos:

```typescript
useEffect(() => {
  fetchData();
  
  // Configura um intervalo para buscar dados a cada 30 segundos
  const interval = setInterval(fetchData, 30000);
  
  // Limpa o intervalo quando o componente for desmontado
  return () => clearInterval(interval);
}, []);
```

### 3. Exibição dos Dados

Os dados são exibidos em cartões para cada setor da plantação e para o tanque:

```jsx
<div className="sensor-grid">
  {/* Sensor Analógico 1 (Tanque) */}
  <div className="sensor-card">
    <h3>Sensor do Tanque</h3>
    <p className="sensor-value">{latestData.sensor1 || 'N/A'}</p>
    <p className="sensor-label">Valor Analógico</p>
  </div>
  
  {/* Sensores de Temperatura e Umidade */}
  <div className="sensor-card">
    <h3>Setor Norte</h3>
    <p className={`sensor-value ${getTemperatureClass(latestData.sensor2)}`}>
      {formatTemperature(latestData.sensor2)}
    </p>
    <p className="sensor-label">Temperatura</p>
    <p className={`sensor-value ${getHumidityClass(latestData.umidade1)}`}>
      {formatHumidity(latestData.umidade1)}
    </p>
    <p className="sensor-label">Umidade</p>
  </div>
  
  {/* Outros setores... */}
</div>
```

### 4. Gráficos de Histórico

A interface também exibe gráficos de linha para mostrar o histórico de temperatura e umidade:

```jsx
<div className="charts-container">
  <div className="chart-wrapper">
    <h3>Histórico de Temperatura</h3>
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={sensorData}>
        {/* Configuração do gráfico */}
        <Line type="monotone" dataKey="sensor2" name="Norte" stroke="#8884d8" />
        <Line type="monotone" dataKey="sensor3" name="Sul" stroke="#82ca9d" />
        <Line type="monotone" dataKey="sensor4" name="Leste" stroke="#ff7300" />
        <Line type="monotone" dataKey="sensor5" name="Oeste" stroke="#0088aa" />
      </LineChart>
    </ResponsiveContainer>
  </div>
  
  {/* Gráfico de umidade... */}
</div>
```

## Como Conectar ao Qubitro

Para conectar a interface à sua conta do Qubitro, siga estes passos:

### 1. Obtenha um Token de API do Qubitro

1. Faça login no portal do Qubitro
2. Vá para "Settings" ou "Configurações"
3. Procure por "API Keys" ou "Tokens de API"
4. Crie um novo token com permissões de leitura
5. Copie o token gerado

### 2. Configure a URL da API e o Token

No arquivo `App.tsx`, localize o seguinte trecho de código:

```typescript
const response = await axios.get('https://api.qubitro.com/v1/projects/eea3da5b-fa78-41bb-bf85-0f8470cc2f42/devices/eea3da5b-fa78-41bb-bf85-0f8470cc2f42/data', {
  headers: {
    'Authorization': 'Bearer SEU_TOKEN_AQUI',
    'Content-Type': 'application/json'
  }
});
```

Substitua:
- `eea3da5b-fa78-41bb-bf85-0f8470cc2f42` pelo ID do seu projeto no Qubitro
- `eea3da5b-fa78-41bb-bf85-0f8470cc2f42` pelo ID do seu dispositivo no Qubitro
- `SEU_TOKEN_AQUI` pelo token de API que você obteve

### 3. Verifique o Formato dos Dados

Certifique-se de que os nomes dos campos no código correspondem aos nomes dos campos enviados pelo ESP32:

```typescript
const formattedData = response.data.map((item: any) => ({
  timestamp: new Date(item.timestamp).toLocaleString(),
  sensor1: item.sensor1,
  sensor2: item.sensor2,
  sensor3: item.sensor3,
  sensor4: item.sensor4,
  sensor5: item.sensor5,
  umidade1: item.umidade1,
  umidade2: item.umidade2,
  umidade3: item.umidade3,
  umidade4: item.umidade4
}));
```

Se você mudou os nomes dos campos no código do ESP32, atualize-os aqui também.

## Executando a Interface

Para executar a interface web:

1. Navegue até a pasta do projeto: `cd sensor_dashboard_app`
2. Instale as dependências: `pnpm install`
3. Inicie o servidor de desenvolvimento: `pnpm run dev`
4. Abra o navegador e acesse: `http://localhost:5173`

## Personalizando a Interface

### Alterando os Nomes dos Setores

Se quiser mudar os nomes dos setores (Norte, Sul, Leste, Oeste), edite os títulos nos cartões:

```jsx
<div className="sensor-card">
  <h3>Setor Norte</h3>
  {/* ... */}
</div>
```

### Ajustando os Limites de Alerta

Para alterar quando os valores são considerados altos ou baixos, edite as funções:

```typescript
const getTemperatureClass = (value?: number) => {
  if (value === undefined) return 'normal';
  if (value > 30) return 'high'; // Alerta de temperatura alta
  if (value < 15) return 'low';  // Alerta de temperatura baixa
  return 'normal';
};

const getHumidityClass = (value?: number) => {
  if (value === undefined) return 'normal';
  if (value > 70) return 'high'; // Alerta de umidade alta
  if (value < 30) return 'low';  // Alerta de umidade baixa
  return 'normal';
};
```

## Próximos Passos

Após configurar a interface web para visualizar os dados dos sensores, você pode:

1. Adicionar autenticação de usuário
2. Implementar notificações para valores críticos
3. Adicionar mais gráficos e análises
4. Integrar com o Contentful para registrar manutenções dos equipamentos
