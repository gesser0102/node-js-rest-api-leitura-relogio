import { Router } from 'express';
import { uploadController } from '../controllers/uploadController';
import measurementsController from '../controllers/measurementsController';
import confirmMeasurementController from '../controllers/confirmMeasurementController';

export const Routes = Router();

Routes.post('/upload', uploadController);
Routes.get('/:customerCode/list', measurementsController.getCustomerMeasurements);
Routes.patch('/confirm', confirmMeasurementController.confirmMeasurement);
