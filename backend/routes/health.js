/**
 * Health Check Endpoint
 * Provides system status for monitoring and debugging
 */

const express = require('express');
const router = express.Router();

module.exports = (con) => {
  // Basic health check
  router.get('/', async (req, res) => {
    try {
      const health = {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || 'development',
        version: '1.0.0'
      };

      res.status(200).json(health);
    } catch (error) {
      res.status(503).json({
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: error.message
      });
    }
  });

  // Detailed health check with database
  router.get('/detailed', async (req, res) => {
    const checks = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      version: '1.0.0',
      services: {}
    };

    try {
      // Check database connection
      const dbStart = Date.now();
      await con.ping();
      const dbLatency = Date.now() - dbStart;
      
      checks.services.database = {
        status: 'healthy',
        latency: `${dbLatency}ms`,
        connected: true
      };
    } catch (error) {
      checks.status = 'degraded';
      checks.services.database = {
        status: 'unhealthy',
        error: error.message,
        connected: false
      };
    }

    // Check memory usage
    const memUsage = process.memoryUsage();
    checks.services.memory = {
      status: 'healthy',
      rss: `${Math.round(memUsage.rss / 1024 / 1024)}MB`,
      heapUsed: `${Math.round(memUsage.heapUsed / 1024 / 1024)}MB`,
      heapTotal: `${Math.round(memUsage.heapTotal / 1024 / 1024)}MB`
    };

    // Check email service (if enabled)
    if (process.env.EMAIL_ENABLED === 'true') {
      checks.services.email = {
        status: 'configured',
        host: process.env.EMAIL_HOST,
        enabled: true
      };
    } else {
      checks.services.email = {
        status: 'disabled',
        enabled: false
      };
    }

    // Overall status
    const statusCode = checks.status === 'healthy' ? 200 : 503;
    res.status(statusCode).json(checks);
  });

  // Readiness check (for Kubernetes/Docker)
  router.get('/ready', async (req, res) => {
    try {
      // Check if database is ready
      await con.ping();
      
      res.status(200).json({
        status: 'ready',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      res.status(503).json({
        status: 'not ready',
        timestamp: new Date().toISOString(),
        error: error.message
      });
    }
  });

  // Liveness check (for Kubernetes/Docker)
  router.get('/live', (req, res) => {
    res.status(200).json({
      status: 'alive',
      timestamp: new Date().toISOString(),
      uptime: process.uptime()
    });
  });

  return router;
};
