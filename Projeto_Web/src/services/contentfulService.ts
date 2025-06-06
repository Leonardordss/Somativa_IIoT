
import { createClient, type EntrySkeletonType, type Entry, type EntryCollection } from 'contentful';
import { createClient as createManagementClient } from 'contentful-management';

//Configuração dos Clientes Contentful

// Variáveis de Ambiente 
const spaceId = import.meta.env.VITE_CONTENTFUL_SPACE_ID;
const accessTokenCDA = import.meta.env.VITE_CONTENTFUL_ACCESS_TOKEN; 
const accessTokenCMA = import.meta.env.VITE_CONTENTFUL_CMA_TOKEN; 


if (!spaceId) {
  console.error("Contentful Space ID não está definido. Verifique VITE_CONTENTFUL_SPACE_ID no .env.");

}
if (!accessTokenCDA) {
  console.error("Contentful CDA Token não está definido. Verifique VITE_CONTENTFUL_ACCESS_TOKEN no .env.");

}
if (!accessTokenCMA) {
  console.error("Contentful CMA Token não está definido. Verifique VITE_CONTENTFUL_CMA_TOKEN no .env.");

}


const client = spaceId && accessTokenCDA ? createClient({
  space: spaceId,
  environment: 'master', 
  accessToken: accessTokenCDA,
}) : null;


const managementClient = spaceId && accessTokenCMA ? createManagementClient({
  accessToken: accessTokenCMA,
}) : null;

// --- Funções para Manutenção ---


export interface MaintenanceFormData {
  tipoEquipamento: string;
  dataManutencao: string; // Formato YYYY-MM-DD
  descricaoManutencao: string;
}


export interface MaintenanceRecordFields {
  tipoEquipamento?: string;
  dataManutencao?: string; 
  descricaoManutencao?: string;
}


export interface MaintenanceRecordSkeleton extends EntrySkeletonType {
  contentTypeId: 'device'; 
  fields: MaintenanceRecordFields;
}


export type MaintenanceRecordEntry = Entry<MaintenanceRecordSkeleton, undefined, string>;

/**

 * @param formData Dados do formulário de manutenção.
 * @returns 
 */
export const createMaintenanceEntry = async (formData: MaintenanceFormData): Promise<any> => {
  if (!managementClient || !spaceId) {
    throw new Error("Cliente de gerenciamento (CMA) do Contentful não inicializado. Verifique Space ID e CMA Token.");
  }

  try {
    const space = await managementClient.getSpace(spaceId);
    const environment = await space.getEnvironment("master"); 

  
    const entry = await environment.createEntry("device", {
      fields: {
   
        tipoEquipamento: {
          "en-US": formData.tipoEquipamento,
        },
        dataManutencao: {
          "en-US": formData.dataManutencao,
        },
        descricaoManutencao: {
          "en-US": formData.descricaoManutencao,
        },
      },
    });

   
    await entry.publish();

    console.log("Registro de manutenção criado e publicado com sucesso:", entry.sys.id);
    return entry;

  } catch (error) {
    console.error("Erro ao criar registro de manutenção no Contentful:", error);
   
    throw error;
  }
};

/**
 
 * @returns
 */
export const fetchMaintenanceRecords = async (): Promise<EntryCollection<MaintenanceRecordSkeleton, undefined, string>> => {
  if (!client) {
    throw new Error("Cliente de entrega (CDA) do Contentful não inicializado. Verifique Space ID e CDA Token.");
  }
  try {
        const entries = await client.getEntries<MaintenanceRecordSkeleton>({
      content_type: 'device', 
      order: ['-sys.createdAt'], // Ordena pelas mais recentes primeiro
    });
    return entries;
  } catch (error) {
    console.error("Erro ao buscar registros de manutenção do Contentful:", error);
    throw error;
  }
};

