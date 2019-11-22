import { Router } from 'express';
import multer from 'multer';
import multerConfig from './config/multer';

import UserController from './app/controllers/UserController';
import StudentController from './app/controllers/StudentController';
import SessionController from './app/controllers/SessionController';
import FileController from './app/controllers/FileController';
import PlanController from './app/controllers/PlanController';
import EnrollmentController from './app/controllers/EnrollmentController';

import authMiddlewares from './app/middlewares/auth';

const routes = new Router();
const upload = multer(multerConfig);

routes.post('/users', UserController.store);
routes.post('/students', StudentController.store);
routes.post('/sessions', SessionController.store);
routes.post('/plans', PlanController.store);
routes.post('/enrollment', EnrollmentController.store);

routes.get('/enrollment', EnrollmentController.index);

routes.use(authMiddlewares);

routes.put('/users', UserController.update);
routes.put('/students', StudentController.update);
routes.put('/plans', PlanController.update);

routes.post('/files', upload.single('file'), FileController.store);

export default routes;
