import { createClient as createManagementClient } from 'contentful-management';
import type { MaintenanceEntry } from '../types/MaintenanceTypes';


// Interface para os dados do formulário de manutenção
export interface MaintenanceFormData {
  tipoEquipamento: string;
  dataManutencao: string; // Formato YYYY-MM-DD 
  descricaoManutencao: string;
}

// Variáveis de ambiente para a CMA
const cmaToken = import.meta.env.VITE_CONTENTFUL_CMA_TOKEN;
const spaceIdCMA = import.meta.env.VITE_CONTENTFUL_SPACE_ID; 

// Verifica se o token CMA está definido
if (!cmaToken) {
  console.error("Contentful CMA Token não está definido. Verifique seu arquivo .env.");

}


const managementClient = cmaToken && spaceIdCMA ? createManagementClient({
  accessToken: cmaToken,
}) : null;

// Função para criar uma nova entrada de manutenção
export const createMaintenanceEntry = async (
    formData: MaintenanceFormData
  ): Promise<MaintenanceEntry> => {
    if (!managementClient || !spaceIdCMA) {
      throw new Error("Cliente de gerenciamento do Contentful não inicializado. Verifique o CMA Token.");
    }
  
    try {
      const space = await managementClient.getSpace(spaceIdCMA);
      const environment = await space.getEnvironment("master");
  
      const entry = await environment.createEntry("device", {
        fields: {
          tipoEquipamento: { "en-US": formData.tipoEquipamento },
          dataManutencao: { "en-US": formData.dataManutencao },
          descricaoManutencao: { "en-US": formData.descricaoManutencao },
        },
      });
  
      await entry.publish();
  
      const maintenanceEntry: MaintenanceEntry = {
        id: entry.sys.id,
        date: formData.dataManutencao,
        description: formData.descricaoManutencao,
        status: "ativo", // ou outro valor, se vier de outro campo ou lógica
      };
  
      console.log("Registro de manutenção criado e publicado com sucesso:", maintenanceEntry);
      return maintenanceEntry;
  
    } catch (error) {
      console.error("Erro ao criar registro de manutenção no Contentful:", error);
      throw error;
    }
  };
  