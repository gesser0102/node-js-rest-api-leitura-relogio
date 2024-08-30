import dotenv from 'dotenv';
import { GoogleAIFileManager } from "@google/generative-ai/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { v4 as uuidv4 } from 'uuid';
import * as fs from 'fs';
import * as path from 'path';

dotenv.config();

// Inicializar o gerenciador de arquivos do Google
const fileManager = new GoogleAIFileManager(process.env.GEMINI_API_KEY as string);

function saveBase64ToFile(base64Data: string, filePath: string): Promise<void> {
    return new Promise((resolve, reject) => {
      // Converte a string base64 em um buffer binário.
      const buffer = Buffer.from(base64Data, 'base64');
  
      // Escreve o buffer no caminho especificado do arquivo.
      fs.writeFile(filePath, buffer, (err) => {
        // Se ocorrer um erro durante a escrita, a Promessa é rejeitada com o erro.
        if (err) {
          return reject(err);
        }
        // Se a escrita for bem-sucedida, a Promessa é resolvida.
        resolve();
      });
    });
  }

export const geminiService = {
  getMeasurementFromImage: async (imageBase64: string): Promise<{ measure_value: number; image_url: string; measure_uuid: string }> => {
    try {
      // Ajuste do diretório para garantir que está alinhado com o servidor
      const uploadsDir = path.join(__dirname, '../../uploads');

      // Verificar se o diretório existe, caso contrário, criá-lo
      try {
          if (!fs.existsSync(uploadsDir)) {
              fs.mkdirSync(uploadsDir, { recursive: true });
              console.log('Diretório de uploads criado com sucesso');
          } else {
              console.log('Diretório de uploads já existe');
          }
      } catch (err) {
          console.error('Erro ao criar diretório de uploads:', err);
          throw new Error('Erro ao criar diretório de uploads');
      }

      // Criar um caminho temporário para salvar a imagem
      const tempFilename = `temp-image-${uuidv4()}.jpg`;
      const tempFilePath = path.join(uploadsDir, tempFilename);

      // Salvar a imagem base64 em um arquivo temporário
      await saveBase64ToFile(imageBase64, tempFilePath)
        .then(() => {
        })
        .catch((err) => {
          console.error('Erro ao salvar o arquivo:', err);
        });

      // Upload do arquivo para o Google AI FileManager
      const uploadResult = await fileManager.uploadFile(
        tempFilePath,
        {
          mimeType: "image/jpeg",
          displayName: "Uploaded Image",
        },
      );

      // Inicializar o modelo Gemini
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);
      const model = await genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      // Prpmpt para solicitar o gemini a Leitura do relogio
      const result = await model.generateContent([
        "Leia o valor escrito no relógio de água ou gás. Retorne apenas o valor.",
        {
          fileData: {
            fileUri: uploadResult.file.uri,
            mimeType: uploadResult.file.mimeType,
          },
        },
      ]);

      // Extrair e exibir o texto gerado
      const text = result.response.text();

      // Converter o texto para número inteiro
      const measure_value = parseInt(text.trim());

      // Criar um link temporário para a imagem
      const tempLink = `http://localhost:${process.env.PORT || 3000}/temp/${tempFilename}`;

      // Remover o arquivo temporário após um certo período de tempo (opcional)
      setTimeout(() => {
        fs.unlink(tempFilePath, (err) => {
          if (err) {
            console.error('Erro ao remover o arquivo temporário:', err);
          } else {
            console.log(`Arquivo temporário removido: ${tempFilePath}`);
          }
        });
      }, 300000); // Remover após 5 minutos

      return {
        image_url: tempLink,
        measure_value,
        measure_uuid: uuidv4(),
      };
    } catch (error) {
      console.error('Erro ao processar a imagem com Gemini:', error);
      throw new Error('Erro ao processar a imagem com Gemini');
    }
  },
};
