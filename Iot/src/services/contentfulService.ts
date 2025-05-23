import { createClient, type EntryCollection, type Entry, type EntrySkeletonType } from 'contentful';

// Defina a interface para os campos de uma Leitura de Sensor
// Certifique-se de que os nomes dos campos (ex: identificadorDoSensor) correspondem
// exatamente aos Field IDs definidos no seu Content Model no Contentful.
export interface LeituraSensorFields {
  identificadorDoSensor?: string;
  timestampDaLeitura?: string; // Ou Date, dependendo de como você quer tratar
  temperaturaDoMotor?: number;
  temperaturaDaBomba?: number;
  consumoEnergetico?: number;
}

// Defina o Entry Skeleton para o seu tipo de conteúdo "Leitura de Sensor"
// O contentTypeId DEVE ser o ID do seu Content Model no Contentful.
// No guia anterior, sugerimos 'leituraDeSensor' como API Identifier.
export interface LeituraSensorSkeleton extends EntrySkeletonType {
  contentTypeId: 'leituraDeSensor'; // IMPORTANTE: Verifique se este é o ID correto do seu Content Model
  fields: LeituraSensorFields;
}

// Defina o tipo para uma entrada completa de Leitura de Sensor usando o Skeleton
export type LeituraSensorEntry = Entry<LeituraSensorSkeleton, undefined, string>;

const spaceId = import.meta.env.VITE_CONTENTFUL_SPACE_ID;
const accessToken = import.meta.env.VITE_CONTENTFUL_ACCESS_TOKEN;

if (!spaceId || !accessToken) {
  throw new Error("Contentful Space ID or Access Token is not defined. Check your .env file.");
}

const client = createClient({
  space: spaceId,
  accessToken: accessToken,
});

// Função para buscar todas as leituras de sensor
export const fetchSensorReadings = async (): Promise<EntryCollection<LeituraSensorSkeleton, undefined, string>> => {
  try {
    const entries = await client.getEntries<LeituraSensorSkeleton, undefined, string>({
      content_type: 'leituraDeSensor', // Este ID é usado para buscar, deve corresponder ao contentTypeId no Skeleton
      order: ['-fields.timestampDaLeitura'], // Ordena pelas mais recentes primeiro
    });
    return entries;
  } catch (error) {
    console.error("Error fetching sensor readings from Contentful:", error);
    throw error; // Ou retorne um array vazio/trate o erro como preferir
  }
};

