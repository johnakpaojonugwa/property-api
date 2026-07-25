import express from 'express';
import cors from 'cors';
import compression from 'compression';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import routes from './routes/index.js';
import errorHandler from './middlewares/errorHandler.js';
import requestLogger from './middlewares/requestLogger.js';
import notFoundHandler from './middlewares/notFoundHandler.js';
import rejectDuplicateQueryParams from './middlewares/rejectDuplicateQueryParams.js';
import cookieSecurity from './middlewares/cookieSecurity.js';
import requestTimeout from './middlewares/requestTimeout.js';
import ApiResponse from './utils/ApiResponse.js';
import { setupSwagger } from './config/swagger.js';

const app = express();

app.set('trust proxy', 1);
app.set('etag', 'strong');
app.disable('x-powered-by');

const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Too many requests, please try again later.',
});

const corsOptions = {
  origin: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : '*',
  credentials: true,
};

app.use(compression());
app.use(helmet());
app.use(cors(corsOptions));
app.use(express.json({ limit: '1mb' }));
app.use(rejectDuplicateQueryParams);
app.use(cookieSecurity);
app.use(requestTimeout(5000));
app.use(requestLogger);
app.use(limiter);

setupSwagger(app);

app.get('/health', (req, res) => {
  res.status(200).json(ApiResponse.success({ status: 'ok' }, 'Service healthy'));
});

app.use(routes);
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
