import { Request, Response } from 'express';
import { db } from '../db/db';

export const confirmMeasurement = async (req: Request, res: Response) => {
  try {
    const { measure_uuid, confirmed_value } = req.body;
    const errors: string[] = [];

    // Validação para caso a leitura não for uma string
    if (!measure_uuid || typeof measure_uuid !== 'string') {
      errors.push('measure_uuid é obrigatório e deve ser uma string.');
    }
    // Validação para caso confirmed_value não for um inteiro
    if (confirmed_value === undefined || typeof confirmed_value !== 'number' || !Number.isInteger(confirmed_value)) {
      errors.push('confirmed_value é obrigatório e deve ser um número inteiro.');
    }

    // Se houver erros de validação, retorna 400 junto com uma array dos erros encontrados
    if (errors.length > 0) {
      return res.status(400).json({
        error_code: 'INVALID_DATA',
        error_description: errors.join(', ')
      });
    }

    // Verificar se a leitura existe
    const [rows]: any = await db.execute(
      `SELECT * FROM measurements WHERE measure_uuid = ?`, 
      [measure_uuid]
    );
    // se a leitura não existir retorna 404 = Leitura não encontrada.
    if (Array.isArray(rows) && rows.length === 0) {
      return res.status(404).json({
        error_code: 'MEASURE_NOT_FOUND',
        error_description: 'Leitura não encontrada.'
      });
    }

    const measure = rows[0];

    // Verificar se a leitura já foi confirmada
    if (measure.has_confirmed) {
      return res.status(409).json({
        error_code: 'CONFIRMATION_DUPLICATE',
        error_description: 'Leitura já confirmada.'
      });
    }

    // Atualizar o valor confirmado no banco de dados
    await db.execute(
      `UPDATE measurements SET measure_value = ?, has_confirmed = true WHERE measure_uuid = ?`,
      [confirmed_value, measure_uuid]
    );

    // Retornar sucesso = boolean
    return res.status(200).json({
      success: true
    });

    
  } catch (error) {
    console.error('Erro ao confirmar a leitura:', error);
    return res.status(500).json({
      error_code: 'INTERNAL_ERROR',
      error_description: 'Erro interno do servidor'
    });
  }
};

export default {
  confirmMeasurement
};
