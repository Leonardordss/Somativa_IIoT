import React, { useState } from 'react';
import { createMaintenanceEntry } from '../services/contentfulService';
import type { MaintenanceFormData } from '../services/contentfulService';
import './MaintenanceForm.css';

const MaintenanceForm: React.FC = () => {
  const [formData, setFormData] = useState<MaintenanceFormData>({
    tipoEquipamento: '',
    dataManutencao: '',
    descricaoManutencao: '',
  });
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitStatus, setSubmitStatus] = useState<string | null>(null); 
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus(null);
    setErrorMessage(null);

    // Validação simples
    if (!formData.tipoEquipamento || !formData.dataManutencao || !formData.descricaoManutencao) {
      setErrorMessage('Todos os campos são obrigatórios.');
      setIsSubmitting(false);
      return;
    }

    try {
      
      const dataToSend: MaintenanceFormData = {
        ...formData,
        
      };

      await createMaintenanceEntry(dataToSend);
      setSubmitStatus('success');
      // Limpa o formulário após o sucesso
      setFormData({
        tipoEquipamento: '',
        dataManutencao: '',
        descricaoManutencao: '',
      });
    } catch (error) {
      console.error("Falha ao enviar manutenção:", error);
      setSubmitStatus('error');
      setErrorMessage('Falha ao registrar manutenção. Verifique o console para detalhes.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="maintenance-form-container">
      <h2>Registrar Manutenção</h2>
      <form onSubmit={handleSubmit} className="maintenance-form">
        <div className="form-group">
          <label htmlFor="tipoEquipamento">Tipo de Equipamento:</label>
          {}
          <select
            id="tipoEquipamento"
            name="tipoEquipamento"
            value={formData.tipoEquipamento}
            onChange={handleChange}
            required
            >
            <option value="">Selecione um equipamento</option>
            <option value="Sensor Norte">Sensor Norte</option>
            <option value="Sensor Sul">Sensor Sul</option>
            <option value="Sensor Leste">Sensor Leste</option>
            <option value="Sensor Oeste">Sensor Oeste</option>
            <option value="Sensor Tanque">Sensor Tanque</option>
          </select>

        </div>
        <div className="form-group">
          <label htmlFor="dataManutencao">Data da Manutenção:</label>
          <input
            type="date" // Input de data
            id="dataManutencao"
            name="dataManutencao"
            value={formData.dataManutencao}
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="descricaoManutencao">Descrição:</label>
          <textarea
            id="descricaoManutencao"
            name="descricaoManutencao"
            value={formData.descricaoManutencao}
            onChange={handleChange}
            rows={4}
            required
          />
        </div>

        {/* Resposta para o usuário */}
        {submitStatus === 'success' && <p className="success-message">Manutenção registrada com sucesso!</p>}
        {submitStatus === 'error' && <p className="error-message">{errorMessage || 'Ocorreu um erro.'}</p>}
        {errorMessage && !submitStatus && <p className="error-message">{errorMessage}</p>}

        <button type="submit" disabled={isSubmitting} className="submit-button">
          {isSubmitting ? 'Registrando...' : 'Registrar Manutenção'}
        </button>
      </form>
    </div>
  );
};

export default MaintenanceForm;