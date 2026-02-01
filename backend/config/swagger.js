/**
 * Swagger/OpenAPI Configuration
 * API Documentation Setup
 */

const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Fashion Hub API',
      version: '1.0.0',
      description: 'E-commerce platform API for Fashion Hub - A comprehensive fashion retail solution',
      contact: {
        name: 'Fashion Hub Support',
        email: 'support@fashionhub.com'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    servers: [
      {
        url: process.env.NODE_ENV === 'production' 
          ? 'https://your-production-url.com'
          : 'http://localhost:5000',
        description: process.env.NODE_ENV === 'production' ? 'Production server' : 'Development server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter your JWT token'
        }
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            username: { type: 'string', example: 'john_doe' },
            email: { type: 'string', format: 'email', example: 'john@example.com' },
            role: { type: 'string', enum: ['user', 'admin'], example: 'user' },
            created_at: { type: 'string', format: 'date-time' }
          }
        },
        Product: {
          type: 'object',
          properties: {
            product_id: { type: 'integer', example: 1 },
            product_name: { type: 'string', example: 'Classic White Shirt' },
            description: { type: 'string', example: 'Premium cotton formal shirt' },
            price: { type: 'number', format: 'float', example: 49.99 },
            discount_price: { type: 'number', format: 'float', example: 39.99 },
            quantity: { type: 'integer', example: 100 },
            category: { type: 'string', example: 'Mens Formal' },
            subcategory: { type: 'string', example: 'Shirts' },
            sizes: { type: 'array', items: { type: 'string' }, example: ['S', 'M', 'L', 'XL'] },
            images: { type: 'array', items: { type: 'string' }, example: ['image1.jpg', 'image2.jpg'] }
          }
        },
        Order: {
          type: 'object',
          properties: {
            order_id: { type: 'integer', example: 1 },
            user_id: { type: 'integer', example: 1 },
            total_amount: { type: 'number', format: 'float', example: 149.99 },
            status: { type: 'string', enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'], example: 'pending' },
            payment_method: { type: 'string', example: 'UPI' },
            created_at: { type: 'string', format: 'date-time' }
          }
        },
        Error: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            error: { type: 'string', example: 'Error message' }
          }
        },
        Success: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            message: { type: 'string', example: 'Operation successful' },
            data: { type: 'object' }
          }
        }
      },
      responses: {
        UnauthorizedError: {
          description: 'Access token is missing or invalid',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' }
            }
          }
        },
        NotFoundError: {
          description: 'Resource not found',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' }
            }
          }
        },
        ValidationError: {
          description: 'Validation error',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' }
            }
          }
        },
        ServerError: {
          description: 'Internal server error',
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/Error' }
            }
          }
        }
      }
    },
    tags: [
      { name: 'Authentication', description: 'User authentication endpoints' },
      { name: 'Products', description: 'Product management endpoints' },
      { name: 'Cart', description: 'Shopping cart endpoints' },
      { name: 'Orders', description: 'Order management endpoints' },
      { name: 'Wishlist', description: 'Wishlist management endpoints' },
      { name: 'Profile', description: 'User profile endpoints' },
      { name: 'Reviews', description: 'Product review endpoints' },
      { name: 'Admin', description: 'Admin panel endpoints (requires admin role)' },
      { name: 'Health', description: 'Health check and monitoring endpoints' }
    ]
  },
  apis: [
    './routes/*.js',
    './controllers/*.js'
  ]
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
