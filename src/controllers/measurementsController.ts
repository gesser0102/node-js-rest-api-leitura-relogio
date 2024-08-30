import { Request, Response } from 'express';
import { db } from '../db/db'; // Importando o pool de conexão

const getCustomerMeasurements = async (req: Request, res: Response) => {
    const customerCode = req.params.customerCode;
    const measureType = req.query.measure_type?.toString().toUpperCase();

    // Validar measure_type é igual a 'WATER' ou 'GAS' com case-sensitiv, caso não for retorna 400 = Tipo de medição não permitida
    if (measureType && measureType !== 'WATER' && measureType !== 'GAS') {
        return res.status(400).json({
            error_code: 'INVALID_TYPE',
            error_description: 'Tipo de medição não permitida'
        });
    }

    try {
        // Preparar a query SQL para buscar as medições
        let query = `SELECT measure_uuid, measure_datetime, measure_type, has_confirmed, image_url
                     FROM measurements 
                     WHERE customer_code = ?`;
        const queryParams = [customerCode];
        // Adiciona o filtro de tipo de medição se fornecido para o parametro ?measure_type=""
        if (measureType) {
            query += ` AND measure_type = ?`;
            queryParams.push(measureType);
        }

        // Executar a query diretamente no controlador
        const [rows] = await db.execute(query, queryParams);
        // Verificar se foram encontradas medições, caso contrário retornar 404 = Nenhuma leitura encontrada
        if ((rows as any[]).length === 0) {
            return res.status(404).json({
                error_code: 'MEASURES_NOT_FOUND',
                error_description: 'Nenhuma leitura encontrada'
            });
        }

        // Retornar as medições
        return res.status(200).json({
            customer_code: customerCode,
            measures: rows
        });

    } catch (error) {
        console.error('Erro ao buscar medições:', error);
        return res.status(500).json({
            error_code: 'INTERNAL_SERVER_ERROR',
            error_description: 'Erro ao buscar medições'
        });
    }
};

export default {
    getCustomerMeasurements
};
