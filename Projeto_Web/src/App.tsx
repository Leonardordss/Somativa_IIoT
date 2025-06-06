import { useState, useEffect } from 'react';
import axios from 'axios';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import MaintenanceForm from './components/MaintenanceForm';
// manutenção
import { fetchMaintenanceRecords, type MaintenanceRecordEntry } from './services/contentfulService'; 
import './App.css';

// Interface para os dados formatados dos sensores
interface SensorData {
  timestamp: string;
  plant_1_TEMP?: number;
  plant_1_HUM?: number;
  plant_2_TEMP?: number;
  plant_2_HUM?: number;
  plant_3_TEMP?: number;
  plant_3_HUM?: number;
  plant_4_TEMP?: number;
  plant_4_HUM?: number;
  tanque_TEMP?: number;
  tanque_PH?: number;
}

// Interface para os dados brutos da API de sensores
interface ApiSensorData {
  time?: string;
  timestamp?: string;
  plant_1_TEMP?: number;
  plant_1_HUM?: number;
  plant_2_TEMP?: number;
  plant_2_HUM?: number;
  plant_3_TEMP?: number;
  plant_3_HUM?: number;
  plant_4_TEMP?: number;
  plant_4_HUM?: number;
  tanque_TEMP?: number;
  tanque_PH?: number;
}

function App() {
  // Estados para dados dos sensores
  const [sensorData, setSensorData] = useState<SensorData[]>([]);
  const [latestData, setLatestData] = useState<SensorData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Estados adicionados para registros de manutenção
  const [maintenanceRecords, setMaintenanceRecords] = useState<MaintenanceRecordEntry[]>([]);
  const [loadingMaintenance, setLoadingMaintenance] = useState<boolean>(true);
  const [errorMaintenance, setErrorMaintenance] = useState<string | null>(null);

  // Função para buscar dados dos sensores (Qubitro)
  const fetchData = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.get('', {
        headers: {
         
          'Authorization': 'chave',
          'Content-Type': 'chave'
        },
        params: {
          page: 1,
          limit: 10,
          range: 'all'
        }
      });

      if (response.data && response.data.success && Array.isArray(response.data.data)) {
        let processedData: SensorData[] = [];
        try {
          processedData = response.data.data.map((item: ApiSensorData) => {
            const timeValue = item.time || item.timestamp;
            if (!timeValue) {
              console.warn('Item sem timestamp válido:', item);
              return null;
            }
            return {
              timestamp: new Date(timeValue).toLocaleString(),
              plant_1_TEMP: item.plant_1_TEMP,
              plant_1_HUM: item.plant_1_HUM,
              plant_2_TEMP: item.plant_2_TEMP,
              plant_2_HUM: item.plant_2_HUM,
              plant_3_TEMP: item.plant_3_TEMP,
              plant_3_HUM: item.plant_3_HUM,
              plant_4_TEMP: item.plant_4_TEMP,
              plant_4_HUM: item.plant_4_HUM,
              tanque_TEMP: item.tanque_TEMP,
              tanque_PH: item.tanque_PH
            };
          }).filter((item: SensorData | null): item is SensorData => item !== null);
        } catch (processingError) {
          console.error('Erro ao processar os dados recebidos:', processingError);
          setError('Erro ao processar os dados recebidos da API.');
          setSensorData([]);
          setLatestData(null);
          return;
        }

        const sortedForDisplay = [...processedData].sort(
          (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );

        setSensorData(processedData.reverse());

        if (sortedForDisplay.length > 0) {
          setLatestData(sortedForDisplay[0]);
        } else {
          setLatestData(null);
          setError('Nenhum dado válido encontrado na resposta da API.');
        }
      } else {
        console.error('Estrutura inesperada da resposta da API:', response.data);
        setError('Resposta inesperada da API. Verifique o console.');
        setSensorData([]);
        setLatestData(null);
      }
    } catch (apiError) {
      console.error('Erro ao buscar dados da API:', apiError);
      if (axios.isAxiosError(apiError) && apiError.response) {
        setError(`Falha ao buscar dados: ${apiError.response.status} ${apiError.response.statusText}. Verifique URL, token e parâmetros.`);
      } else {
        setError('Falha ao buscar dados dos sensores. Verifique a conexão e a URL.');
      }
      setSensorData([]);
      setLatestData(null);
    } finally {
      setLoading(false);
    }
  };

  // useEffect para buscar dados dos sensores (com intervalo)
  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);


  useEffect(() => {
    const loadMaintenanceData = async () => {
      setLoadingMaintenance(true);
      setErrorMaintenance(null);
      try {
        const maintenanceData = await fetchMaintenanceRecords();
        setMaintenanceRecords(maintenanceData.items);
      } catch (err) {
        console.error('Erro ao buscar dados de manutenção:', err);
        setErrorMaintenance('Falha ao buscar registros de manutenção.');
        setMaintenanceRecords([]);
      } finally {
        setLoadingMaintenance(false);
      }
    };
    loadMaintenanceData();
  }, []); 

  // Funções auxiliares (formatTemperature, formatHumidity, formatPH, get*Class) 
  const formatTemperature = (value?: number) => {
    return value !== undefined ? `${value.toFixed(1)}°C` : 'N/A';
  };

  const formatHumidity = (value?: number) => {
    return value !== undefined ? `${value.toFixed(1)}%` : 'N/A';
  };

  const formatPH = (value?: number) => {
    return value !== undefined ? `${value.toFixed(1)}` : 'N/A';
  };

  const getTemperatureClass = (value?: number) => {
    if (value === undefined) return 'normal';
    if (value > 30) return 'high';
    if (value < 15) return 'low';
    return 'normal';
  };

  const getHumidityClass = (value?: number) => {
    if (value === undefined) return 'normal';
    if (value > 70) return 'high';
    if (value < 30) return 'low';
    return 'normal';
  };

  const getPHClass = (value?: number) => {
    if (value === undefined) return 'normal';
    if (value > 7.5 || value < 6.5) return 'high';
    return 'normal';
  };


  return (
    <div className="App">
      <header className="App-header">
        <h1>Monitoramento de Sensores</h1>
        <p>Dados em tempo real da plantação e do tanque</p>
      </header>

      <main className="App-main">
        {/* Seção de Sensores */}
        {loading && <p className="loading">Carregando dados dos sensores...</p>}
        {error && <p className="error">{error}</p>}
        {!loading && !error && latestData && (
          <div className="dashboard">
            <div className="last-update">
              <p>Última atualização: {latestData.timestamp}</p>
              <button onClick={fetchData} disabled={loading} className="refresh-button">
                {loading ? 'Atualizando...' : 'Atualizar Dados'}
              </button>
            </div>
            <div className="sensor-grid">
              {/* Cards de sensores */}
              <div className="sensor-card">
                <h3>Sensor do Tanque</h3>
                <p className={`sensor-value ${getTemperatureClass(latestData.tanque_TEMP)}`}>
                  {formatTemperature(latestData.tanque_TEMP)}
                </p>
                <p className="sensor-label">Temperatura</p>
                <p className={`sensor-value ${getPHClass(latestData.tanque_PH)}`}>
                  {formatPH(latestData.tanque_PH)}
                </p>
                <p className="sensor-label">pH</p>
              </div>
              <div className="sensor-card">
                <h3>Setor Norte</h3>
                <p className={`sensor-value ${getTemperatureClass(latestData.plant_1_TEMP)}`}>
                  {formatTemperature(latestData.plant_1_TEMP)}
                </p>
                <p className="sensor-label">Temperatura</p>
                <p className={`sensor-value ${getHumidityClass(latestData.plant_1_HUM)}`}>
                  {formatHumidity(latestData.plant_1_HUM)}
                </p>
                <p className="sensor-label">Umidade</p>
              </div>
              <div className="sensor-card">
                <h3>Setor Sul</h3>
                <p className={`sensor-value ${getTemperatureClass(latestData.plant_2_TEMP)}`}>
                  {formatTemperature(latestData.plant_2_TEMP)}
                </p>
                <p className="sensor-label">Temperatura</p>
                <p className={`sensor-value ${getHumidityClass(latestData.plant_2_HUM)}`}>
                  {formatHumidity(latestData.plant_2_HUM)}
                </p>
                <p className="sensor-label">Umidade</p>
              </div>
              <div className="sensor-card">
                <h3>Setor Leste</h3>
                <p className={`sensor-value ${getTemperatureClass(latestData.plant_3_TEMP)}`}>
                  {formatTemperature(latestData.plant_3_TEMP)}
                </p>
                <p className="sensor-label">Temperatura</p>
                <p className={`sensor-value ${getHumidityClass(latestData.plant_3_HUM)}`}>
                  {formatHumidity(latestData.plant_3_HUM)}
                </p>
                <p className="sensor-label">Umidade</p>
              </div>
              <div className="sensor-card">
                <h3>Setor Oeste</h3>
                <p className={`sensor-value ${getTemperatureClass(latestData.plant_4_TEMP)}`}>
                  {formatTemperature(latestData.plant_4_TEMP)}
                </p>
                <p className="sensor-label">Temperatura</p>
                <p className={`sensor-value ${getHumidityClass(latestData.plant_4_HUM)}`}>
                  {formatHumidity(latestData.plant_4_HUM)}
                </p>
                <p className="sensor-label">Umidade</p>
              </div>
            </div>
            <div className="charts-container">
              <div className="chart-wrapper">
                <h3>Histórico de Temperatura</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={sensorData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="timestamp" />
                    <YAxis label={{ value: 'Temperatura (°C)', angle: -90, position: 'insideLeft' }} />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="plant_1_TEMP" name="Norte" stroke="#8884d8" dot={false} />
                    <Line type="monotone" dataKey="plant_2_TEMP" name="Sul" stroke="#82ca9d" dot={false} />
                    <Line type="monotone" dataKey="plant_3_TEMP" name="Leste" stroke="#ff7300" dot={false} />
                    <Line type="monotone" dataKey="plant_4_TEMP" name="Oeste" stroke="#0088aa" dot={false} />
                    <Line type="monotone" dataKey="tanque_TEMP" name="Tanque" stroke="#ffc658" dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="chart-wrapper">
                <h3>Histórico de Umidade</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={sensorData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="timestamp" />
                    <YAxis label={{ value: 'Umidade (%)', angle: -90, position: 'insideLeft' }} />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="plant_1_HUM" name="Norte" stroke="#8884d8" dot={false} />
                    <Line type="monotone" dataKey="plant_2_HUM" name="Sul" stroke="#82ca9d" dot={false} />
                    <Line type="monotone" dataKey="plant_3_HUM" name="Leste" stroke="#ff7300" dot={false} />
                    <Line type="monotone" dataKey="plant_4_HUM" name="Oeste" stroke="#0088aa" dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}
        {!loading && !error && !latestData && (
          <p className="loading">Nenhum dado de sensor encontrado ou falha ao carregar.</p>
        )}
      </main>

      {/* Seção para Formulário de Manutenção */}
      <section className="maintenance-section">
        <MaintenanceForm />
      </section>

      {/* Seção adicionada para exibir Registros de Manutenção */}
      <section className="maintenance-records">
        <h2>Histórico de Manutenções</h2>
        {loadingMaintenance && <p>Carregando histórico de manutenções...</p>}
        {errorMaintenance && <p className="error-message">{errorMaintenance}</p>}
        {!loadingMaintenance && !errorMaintenance && (
          maintenanceRecords.length > 0 ? (
            <ul className="maintenance-list">
              {maintenanceRecords.map((record) => (
                <li key={record.sys.id} className="maintenance-item">
                  <strong>Equipamento:</strong> {record.fields.tipoEquipamento || 'N/A'}<br />
                  <strong>Data:</strong> {record.fields.dataManutencao ? new Date(record.fields.dataManutencao).toLocaleDateString() : 'N/A'}<br />
                  <strong>Descrição:</strong> {record.fields.descricaoManutencao || 'N/A'}
                </li>
              ))}
            </ul>
          ) : (
            <p>Nenhum registro de manutenção encontrado.</p>
          )
        )}
      </section>

      <footer className="App-footer">
        <p>Sistema de Monitoramento de Plantação e Tanque - 2025</p>
      </footer>
    </div>
  );
}

export default App;
