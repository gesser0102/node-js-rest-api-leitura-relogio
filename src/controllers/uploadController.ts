import { Request, Response } from 'express';
import { geminiService } from '../services/geminiService';
import { db } from '../db/db';

export const uploadController = async (req: Request, res: Response) => {
  try {
    const { image, customer_code, measure_type } = req.body;
    let { measure_datetime } = req.body;
    const errors: string[] = [];

    // Validar body-request individualmente
    if (!image){
        errors.push('Imagem Requerida!');
    } 
    if (!customer_code){
        errors.push('Customer Code Requerido!');
    }
    if (!measure_datetime) {
        errors.push('Data Requerida!');
    } else {
        // Expressão regular para validar o formato YYYY-MM-DDTHH:mm:ss
        const dateRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}$/;

        // Verificar se measure_datetime corresponde ao formato esperado
        if (!dateRegex.test(measure_datetime)) {
            errors.push('Formato de Data Inválido! Use o formato YYYY-MM-DDTHH:mm:ss');
        } else {
            // Tentar converter para um objeto Date
            measure_datetime = new Date(measure_datetime);
            if (isNaN(measure_datetime.getTime())) {
                errors.push('Data Inválida!');
            }
        }
    }
    if (!measure_type) {
        errors.push('Tipo da Medição Requerida!');
    }
    if (measure_type !== 'GAS' && measure_type !== 'WATER') {
        errors.push('Tipo da Medição Inválido! Use "GAS" ou "WATER"');
    }

    // Se houver erros, retornar 400 com a descrição
    if (errors.length > 0) {
      return res.status(400).json({ 
        error_code: 'INVALID_DATA', 
        error_description: errors.join(', ') 
      });
    }

    // Extrair o mês e ano da data de medição
    const measureMonth = measure_datetime.getMonth() + 1; // getMonth() retorna 0-11, então adicionar 1
    const measureYear = measure_datetime.getFullYear();

    // Validar a leitura duplicada no mesmo mês e ano
    const [rows]: any = await db.execute(
      `SELECT * FROM measurements WHERE customer_code = ? AND measure_type = ? AND MONTH(measure_datetime) = ? AND YEAR(measure_datetime) = ?`, 
      [customer_code, measure_type, measureMonth, measureYear]
    );
    // caso exista uma leitura duplicada, retornar 409 = Leitura do mês já realizada
    if (Array.isArray(rows) && rows.length > 0) {
      return res.status(409).json({ 
        error_code: 'DOUBLE_REPORT', 
        error_description: 'Leitura do mês já realizada' 
      });
    }

    // Enviar imagem para o Gemini e obter a leitura
    const geminiResult = await geminiService.getMeasurementFromImage(image);

    // Persistir a leitura no banco de dados
    await db.execute(
      `INSERT INTO measurements (customer_code, measure_datetime, measure_type, measure_value, image_url, measure_uuid) VALUES (?, ?, ?, ?, ?, ?)`, 
      [customer_code, measure_datetime, measure_type, geminiResult.measure_value, geminiResult.image_url, geminiResult.measure_uuid]
    );

    // Retornar a leitura no corpo da resposta
    return res.status(200).json(geminiResult);

  } catch (error) {
    console.error(error);
    return res.status(500).json({ 
      error_code: 'INTERNAL_ERROR', 
      error_description: 'Internal server error' 
    });
  }
};
