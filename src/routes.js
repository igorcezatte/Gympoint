import { Router } from 'express';

import StudentController from './app/controllers/StudentController';
import SessionController from './app/controllers/SessionController';
import UserController from './app/controllers/UserController';
import PlanController from './app/controllers/PlanController';
import EnrrolmentController from './app/controllers/EnrrolmentController';

import authMiddleware from './app/middlewares/auth';

const routes = new Router();

routes.post('/sessions', SessionController.store);
routes.post('/users', UserController.store);

routes.use(authMiddleware);

routes.post('/students', StudentController.store);
routes.put('/students', StudentController.update);

routes.get('/plans', PlanController.index);
routes.post('/plans', PlanController.store);
routes.put('/plans', PlanController.update);

routes.get('/enrrolments', EnrrolmentController.index);
routes.post('/enrrolments', EnrrolmentController.store);
routes.put('/enrrolments', EnrrolmentController.update);
routes.delete('/enrrolments', EnrrolmentController.delete);

export default routes;
