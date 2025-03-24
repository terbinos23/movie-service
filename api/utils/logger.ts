import { Request, Response, NextFunction } from 'express';

const logger = (req: Request, res: Response, next: NextFunction) => {
  const startTime = Date.now();

  res.on('finish', () => {
    const status = res.statusCode;
    const duration = Date.now() - startTime;

    console.log(`[${new Date().toISOString()}] | method=${req.method} | path=${req.originalUrl} | status=${status} | duration=${duration}ms`);
  });

  next();
};

export default logger;
