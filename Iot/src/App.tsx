import { useState, useEffect } from 'react';
import axios from 'axios';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import './App.css';

// Interface para os dados dos sensores
interface SensorData {
  timestamp: string;
  sensor1?: number; // Sensor analógico 1
  sensor2?: number; // Temperatura do sensor 1
  sensor3?: number; // Temperatura do sensor 2
  sensor4?: number; // Temperatura do sensor 3
  sensor5?: number; // Temperatura do sensor 4
  umidade1?: number; // Umidade do sensor 1
  umidade2?: number; // Umidade do sensor 2
  umidade3?: number; // Umidade do sensor 3
  umidade4?: number; // Umidade do sensor 4
}

function App() {
  const [sensorData, setSensorData] = useState<SensorData[]>([]);
  const [latestData, setLatestData] = useState<SensorData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Função para buscar dados do Qubitro
  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Substitua esta URL pela URL da API do Qubitro
      // Você precisará criar uma API no Qubitro para acessar os dados
      const response = await axios.get('https://api.qubitro.com/v1/projects/eea3da5b-fa78-41bb-bf85-0f8470cc2f42/devices/eea3da5b-fa78-41bb-bf85-0f8470cc2f42/data', {
        headers: {
          'Authorization': 'Bearer SEU_TOKEN_AQUI',
          'Content-Type': 'application/json'
        }
      });
      
      // Processar os dados recebidos
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
      
      setSensorData(formattedData);
      
      // Definir os dados mais recentes
      if (formattedData.length > 0) {
        setLatestData(formattedData[0]);
      }
      
      setError(null);
    } catch (err) {
      console.error('Erro ao buscar dados:', err);
      setError('Falha ao buscar dados dos sensores. Por favor, verifique sua conexão e tente novamente.');
      
      // Para fins de demonstração, vamos criar alguns dados fictícios
      const mockData: SensorData[] = [];
      const now = new Date();
      
      for (let i = 0; i < 10; i++) {
        const timestamp = new Date(now.getTime() - i * 60000).toLocaleString();
        mockData.push({
          timestamp,
          sensor1: Math.floor(Math.random() * 1000),
          sensor2: 20 + Math.random() * 10,
          sensor3: 22 + Math.random() * 8,
          sensor4: 21 + Math.random() * 9,
          sensor5: 23 + Math.random() * 7,
          umidade1: 40 + Math.random() * 20,
          umidade2: 45 + Math.random() * 15,
          umidade3: 50 + Math.random() * 10,
          umidade4: 55 + Math.random() * 5
        });
      }
      
      setSensorData(mockData);
      if (mockData.length > 0) {
        setLatestData(mockData[0]);
      }
    } finally {
      setLoading(false);
    }
  };

  // Buscar dados quando o componente for montado
  useEffect(() => {
    fetchData();
    
    // Configurar um intervalo para buscar dados a cada 30 segundos
    const interval = setInterval(fetchData, 30000);
    
    // Limpar o intervalo quando o componente for desmontado
    return () => clearInterval(interval);
  }, []);

  // Função para formatar valores de temperatura
  const formatTemperature = (value?: number) => {
    return value !== undefined ? `${value.toFixed(1)}°C` : 'N/A';
  };

  // Função para formatar valores de umidade
  const formatHumidity = (value?: number) => {
    return value !== undefined ? `${value.toFixed(1)}%` : 'N/A';
  };

  // Função para determinar a classe CSS com base no valor de temperatura
  const getTemperatureClass = (value?: number) => {
    if (value === undefined) return 'normal';
    if (value > 30) return 'high';
    if (value < 15) return 'low';
    return 'normal';
  };

  // Função para determinar a classe CSS com base no valor de umidade
  const getHumidityClass = (value?: number) => {
    if (value === undefined) return 'normal';
    if (value > 70) return 'high';
    if (value < 30) return 'low';
    return 'normal';
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Monitoramento de Sensores</h1>
        <p>Dados em tempo real da plantação e do tanque</p>
      </header>

      <main className="App-main">
        {loading && !latestData && <p className="loading">Carregando dados dos sensores...</p>}
        
        {error && <p className="error">{error}</p>}
        
        {latestData && (
          <div className="dashboard">
            <div className="last-update">
              <p>Última atualização: {latestData.timestamp}</p>
              <button onClick={fetchData} className="refresh-button">Atualizar Dados</button>
            </div>
            
            <div className="sensor-grid">
              {/* Sensor Analógico 1 (Tanque) */}
              <div className="sensor-card">
                <h3>Sensor do Tanque</h3>
                <p className="sensor-value">{latestData.sensor1 || 'N/A'}</p>
                <p className="sensor-label">Valor Analógico</p>
              </div>
              
              {/* Sensores de Temperatura */}
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
              
              <div className="sensor-card">
                <h3>Setor Sul</h3>
                <p className={`sensor-value ${getTemperatureClass(latestData.sensor3)}`}>
                  {formatTemperature(latestData.sensor3)}
                </p>
                <p className="sensor-label">Temperatura</p>
                <p className={`sensor-value ${getHumidityClass(latestData.umidade2)}`}>
                  {formatHumidity(latestData.umidade2)}
                </p>
                <p className="sensor-label">Umidade</p>
              </div>
              
              <div className="sensor-card">
                <h3>Setor Leste</h3>
                <p className={`sensor-value ${getTemperatureClass(latestData.sensor4)}`}>
                  {formatTemperature(latestData.sensor4)}
                </p>
                <p className="sensor-label">Temperatura</p>
                <p className={`sensor-value ${getHumidityClass(latestData.umidade3)}`}>
                  {formatHumidity(latestData.umidade3)}
                </p>
                <p className="sensor-label">Umidade</p>
              </div>
              
              <div className="sensor-card">
                <h3>Setor Oeste</h3>
                <p className={`sensor-value ${getTemperatureClass(latestData.sensor5)}`}>
                  {formatTemperature(latestData.sensor5)}
                </p>
                <p className="sensor-label">Temperatura</p>
                <p className={`sensor-value ${getHumidityClass(latestData.umidade4)}`}>
                  {formatHumidity(latestData.umidade4)}
                </p>
                <p className="sensor-label">Umidade</p>
              </div>
            </div>
            
            <div className="charts-container">
              <div className="chart-wrapper">
                <h3>Histórico de Temperatura</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart
                    data={sensorData}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="timestamp" />
                    <YAxis label={{ value: 'Temperatura (°C)', angle: -90, position: 'insideLeft' }} />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="sensor2" name="Norte" stroke="#8884d8" />
                    <Line type="monotone" dataKey="sensor3" name="Sul" stroke="#82ca9d" />
                    <Line type="monotone" dataKey="sensor4" name="Leste" stroke="#ff7300" />
                    <Line type="monotone" dataKey="sensor5" name="Oeste" stroke="#0088aa" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              
              <div className="chart-wrapper">
                <h3>Histórico de Umidade</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart
                    data={sensorData}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="timestamp" />
                    <YAxis label={{ value: 'Umidade (%)', angle: -90, position: 'insideLeft' }} />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="umidade1" name="Norte" stroke="#8884d8" />
                    <Line type="monotone" dataKey="umidade2" name="Sul" stroke="#82ca9d" />
                    <Line type="monotone" dataKey="umidade3" name="Leste" stroke="#ff7300" />
                    <Line type="monotone" dataKey="umidade4" name="Oeste" stroke="#0088aa" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}
      </main>

      <footer className="App-footer">
        <p>Sistema de Monitoramento de Plantação e Tanque - 2025</p>
      </footer>
    </div>
  );
}

export default App;
