import { useState, useEffect } from 'react';
import axios from 'axios';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legende, ResponsiveContainer } from 'recharts';
import './App.css';

// Dados dos sensores

interface SensorData {
  timestamp: string;
  plant1?: number; //sensor da plantação 1
  plant2?: number; //sensor da plantação 2
  plant3?: number; //sensor da plantação 3
  plant4?: number; //sensor da plantação 4
  tanque5?: number; //sensor do tanque

  umidade1?: number; //umidade dos sensores 1,2,3 e 4
  umidade2?: number;
  umidade3?: number;
  umidade4?: number;
}

function App() {
  const [sensorData, setSensorData] = useState<SensorData[]>([]);
  const [latestData, setLatestData] = useState<SensorData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
}

//Função para buscar dados no Qubitro
 const fetchData = async () => {
    try {
      setLoading(true);
      
      // Endereço da API no Qubitro para pegar os dados
      const response = await axios.get('https://api.qubitro.com/v2/projects/PROJETO_ID/devices/DEVICE_ID/data', {
        headers: {
          'Authorization': 'Bearer MEU_TOKEN_AQUI',
          'Content-Type': 'application/json'
        }
      } );

// Processar os dados recebidos
      const formattedData = response.data.map((item: any) => ({
        timestamp: new Date(item.timestamp).toLocaleString(),
        plant1: item.plant1,
        plant2: item.plant2,
        plant3: item.plant3,
        plant4: item.plant4,
        tanque5: item.tanque5,
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

       
  useEffect(() => {
    fetchData();
    
    // Intervalo para buscar dados a cada 30 segundos
    const interval = setInterval(fetchData, 30000);
    
    
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
              {/* Sensor (Tanque) */}
              <div className="sensor-card">
                <h3>Sensor do Tanque</h3>
                <p className="sensor-value">{latestData.tanque1 || 'N/A'}</p>
                <p className="sensor-label">Valor Analógico</p>
              </div>
              
              {/* Sensores de Temperatura */}
              <div className="sensor-card">
                <h3>Setor Norte</h3>
                <p className={`sensor-value ${getTemperatureClass(latestData.sensor1)}`}>
                  {formatTemperature(latestData.sensor1)}
                </p>
                <p className="sensor-label">Temperatura</p>
                <p className={`sensor-value ${getHumidityClass(latestData.umidade1)}`}>
                  {formatHumidity(latestData.umidade1)}
                </p>
                <p className="sensor-label">Umidade</p>
              </div>
              
              <div className="sensor-card">
                <h3>Setor Sul</h3>
                <p className={`sensor-value ${getTemperatureClass(latestData.sensor2)}`}>
                  {formatTemperature(latestData.sensor2)}
                </p>
                <p className="sensor-label">Temperatura</p>
                <p className={`sensor-value ${getHumidityClass(latestData.umidade2)}`}>
                  {formatHumidity(latestData.umidade2)}
                </p>
                <p className="sensor-label">Umidade</p>
              </div>
              
              <div className="sensor-card">
                <h3>Setor Leste</h3>
                <p className={`sensor-value ${getTemperatureClass(latestData.sensor3)}`}>
                  {formatTemperature(latestData.sensor3)}
                </p>
                <p className="sensor-label">Temperatura</p>
                <p className={`sensor-value ${getHumidityClass(latestData.umidade3)}`}>
                  {formatHumidity(latestData.umidade3)}
                </p>
                <p className="sensor-label">Umidade</p>
              </div>
              
              <div className="sensor-card">
                <h3>Setor Oeste</h3>
                <p className={`sensor-value ${getTemperatureClass(latestData.sensor4)}`}>
                  {formatTemperature(latestData.sensor4)}
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
                    <Line type="monotone" dataKey="Plant1" name="Norte" stroke="#8884d8" />
                    <Line type="monotone" dataKey="Plant2" name="Sul" stroke="#82ca9d" />
                    <Line type="monotone" dataKey="Plant3" name="Leste" stroke="#ff7300" />
                    <Line type="monotone" dataKey="Plant4" name="Oeste" stroke="#0088aa" />
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