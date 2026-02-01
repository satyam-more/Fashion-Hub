# 📚 Fashion Hub API Documentation

## Base URL
- **Development**: `http://localhost:5000`
- **Production**: `https://your-production-url.com`

## Interactive Documentation
- **Swagger UI**: `/api-docs`
- **OpenAPI JSON**: `/api-docs.json`

---

## Authentication

All authenticated endpoints require a Bearer token in the Authorization header:
```
Authorization: Bearer <your_jwt_token>
```

### Register
- **POST** `/api/auth/register`
- **Body**:
  ```json
  {
    "username": "john_doe",
    "email": "john@example.com",
    "password": "SecurePass123!"
  }
  ```
- **Response**: JWT token and user data

### Login
- **POST** `/api/auth/login`
- **Body**:
  ```json
  {
    "email": "john@example.com",
    "password": "SecurePass123!"
  }
  ```
- **Response**: JWT token and user data

### Password Policy
- **GET** `/api/auth/password-policy`
- **Response**: Password requirements

### Check Password Strength
- **POST** `/api/auth/check-password-strength`
- **Body**:
  ```json
  {
    "password": "TestPassword123!"
  }
  ```
- **Response**: Password strength score and feedback

---

## Products

### Get All Products
- **GET** `/api/products`
- **Query Parameters**:
  - `category` (optional): Filter by category
  - `subcategory` (optional): Filter by subcategory
  - `minPrice` (optional): Minimum price
  - `maxPrice` (optional): Maximum price
  - `search` (optional): Search term
  - `limit` (optional): Results per page (default: 20)
  - `offset` (optional): Pagination offset

### Get Product by ID
- **GET** `/api/products/:id`
- **Response**: Product details with images

### Search Products
- **GET** `/api/products/search?q=shirt`
- **Response**: Matching products

### Get Categories
- **GET** `/api/products/categories`
- **Response**: List of all categories

### Get Subcategories
- **GET** `/api/products/subcategories/:categoryId`
- **Response**: Subcategories for a category

---

## Cart

### Get Cart
- **GET** `/api/cart`
- **Auth**: Required
- **Response**: Cart items with product details

### Add to Cart
- **POST** `/api/cart/add`
- **Auth**: Required
- **Body**:
  ```json
  {
    "product_id": 1,
    "quantity": 2,
    "size": "M"
  }
  ```

### Update Cart Item
- **PUT** `/api/cart/update/:cartId`
- **Auth**: Required
- **Body**:
  ```json
  {
    "quantity": 3
  }
  ```

### Remove from Cart
- **DELETE** `/api/cart/remove/:cartId`
- **Auth**: Required

---

## Orders

### Get User Orders
- **GET** `/api/orders`
- **Auth**: Required
- **Response**: List of user's orders

### Get Order Details
- **GET** `/api/orders/:orderId`
- **Auth**: Required
- **Response**: Order details with items

### Create Order
- **POST** `/api/orders/create`
- **Auth**: Required
- **Body**:
  ```json
  {
    "items": [
      {
        "product_id": 1,
        "quantity": 2,
        "size": "M",
        "price": 49.99
      }
    ],
    "shipping_address": "123 Main St, City, State 12345",
    "payment_method": "UPI",
    "total_amount": 99.98
  }
  ```

### Cancel Order
- **PUT** `/api/orders/cancel/:orderId`
- **Auth**: Required

---

## Wishlist

### Get Wishlist
- **GET** `/api/wishlist`
- **Auth**: Required
- **Response**: Wishlist items with product details

### Add to Wishlist
- **POST** `/api/wishlist/add`
- **Auth**: Required
- **Body**:
  ```json
  {
    "product_id": 1
  }
  ```

### Remove from Wishlist
- **DELETE** `/api/wishlist/:wishlistId`
- **Auth**: Required

---

## Profile

### Get Profile
- **GET** `/api/profile`
- **Auth**: Required
- **Response**: User profile data

### Update Profile
- **PUT** `/api/profile`
- **Auth**: Required
- **Body**:
  ```json
  {
    "first_name": "John",
    "last_name": "Doe",
    "phone": "1234567890",
    "address": "123 Main St",
    "city": "New York",
    "state": "NY",
    "pincode": "10001"
  }
  ```

### Get Profile Stats
- **GET** `/api/profile/stats`
- **Auth**: Required
- **Response**: Order count, wishlist count, total spent

### Change Password
- **PUT** `/api/profile/password`
- **Auth**: Required
- **Body**:
  ```json
  {
    "currentPassword": "OldPass123!",
    "newPassword": "NewPass123!"
  }
  ```

---

## Reviews

### Get Product Reviews
- **GET** `/api/reviews/product/:productId`
- **Response**: Reviews for a product

### Add Review
- **POST** `/api/reviews/product/:productId`
- **Auth**: Required
- **Body**:
  ```json
  {
    "rating": 5,
    "review_text": "Great product!"
  }
  ```

---

## Memberships

### Get My Membership
- **GET** `/api/memberships/my-membership`
- **Auth**: Required
- **Response**: User's membership details

### Check Membership Status
- **GET** `/api/memberships/check-status`
- **Auth**: Required
- **Response**: Membership status

### Purchase Membership
- **POST** `/api/memberships/purchase`
- **Auth**: Required
- **Body**:
  ```json
  {
    "plan": "premium",
    "payment_method": "UPI"
  }
  ```

---

## Custom Tailoring

### Get Appointments
- **GET** `/api/custom/appointments`
- **Auth**: Required
- **Response**: User's tailoring appointments

### Create Appointment
- **POST** `/api/custom/appointments`
- **Auth**: Required
- **Body**:
  ```json
  {
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "1234567890",
    "appointment_date": "2025-02-15",
    "appointment_time": "14:00",
    "services": ["Custom Suit", "Alterations"],
    "measurements": {
      "chest": "40",
      "waist": "32",
      "height": "6ft"
    }
  }
  ```

---

## Admin Endpoints

All admin endpoints require admin role.

### Users Management
- **GET** `/api/admin/users` - Get all users
- **PUT** `/api/admin/users/:id` - Update user
- **DELETE** `/api/admin/users/:id` - Delete user

### Products Management
- **GET** `/api/admin/products` - Get all products
- **POST** `/api/admin/products` - Create product
- **PUT** `/api/admin/products/:id` - Update product
- **DELETE** `/api/admin/products/:id` - Delete product

### Orders Management
- **GET** `/api/admin/orders` - Get all orders
- **PUT** `/api/admin/orders/:id` - Update order status

### Reviews Management
- **GET** `/api/admin/reviews` - Get all reviews
- **DELETE** `/api/admin/reviews/:id` - Delete review

### Analytics
- **GET** `/api/admin/analytics` - Get dashboard analytics
- **GET** `/api/admin/sales-analytics` - Get sales analytics
- **GET** `/api/admin/consultation-analytics` - Get consultation analytics

### Appointments Management
- **GET** `/api/admin/appointments` - Get all appointments
- **PUT** `/api/admin/appointments/:id` - Update appointment status

### Payment Verification
- **GET** `/api/admin/payments` - Get pending payments
- **PUT** `/api/admin/payments/:id/verify` - Verify payment

---

## Health Check

### Basic Health
- **GET** `/health`
- **Response**:
  ```json
  {
    "status": "healthy",
    "timestamp": "2025-02-01T12:00:00.000Z",
    "uptime": 3600,
    "environment": "production",
    "version": "1.0.0"
  }
  ```

### Detailed Health
- **GET** `/health/detailed`
- **Response**: Includes database, memory, and service status

### Readiness Probe
- **GET** `/health/ready`
- **Use**: Kubernetes readiness probe

### Liveness Probe
- **GET** `/health/live`
- **Use**: Kubernetes liveness probe

---

## Rate Limiting

- **Auth endpoints**: 5 requests per 15 minutes
- **OTP endpoints**: 3 requests per 5 minutes
- **Payment endpoints**: 10 requests per hour
- **Upload endpoints**: 20 uploads per hour
- **General API**: 100 requests per 15 minutes

---

## Error Responses

All errors follow this format:
```json
{
  "success": false,
  "error": "Error message description"
}
```

### Common Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation error)
- `401` - Unauthorized (missing/invalid token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `429` - Too Many Requests (rate limit exceeded)
- `500` - Internal Server Error

---

## File Uploads

### Upload Product Images
- **POST** `/api/upload/products`
- **Auth**: Required (Admin only)
- **Content-Type**: `multipart/form-data`
- **Field**: `images` (max 10 files)
- **Allowed Types**: JPEG, PNG, GIF, WebP, SVG
- **Max Size**: 5MB per file

### Image URLs
- **Format**: `{BASE_URL}/uploads/{filename}`
- **Example**: `http://localhost:5000/uploads/product-image.jpg`

---

## Security Features

- ✅ JWT Authentication
- ✅ Rate Limiting
- ✅ Input Validation
- ✅ SQL Injection Prevention
- ✅ XSS Protection
- ✅ CORS Configuration
- ✅ Helmet Security Headers
- ✅ HTTPS Enforcement (Production)
- ✅ File Upload Validation
- ✅ Password Strength Requirements

---

## Testing the API

### Using cURL
```bash
# Register
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"test","email":"test@example.com","password":"Test123!"}'

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123!"}'

# Get Products (with token)
curl http://localhost:5000/api/products \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Using Postman
1. Import the OpenAPI spec from `/api-docs.json`
2. Set up environment variables for base URL and token
3. Test endpoints with pre-configured requests

---

## Support

For API issues or questions:
- **Documentation**: `/api-docs`
- **Health Status**: `/health/detailed`
- **GitHub**: https://github.com/satyam-more/Fashion-Hub

---

**Last Updated:** February 1, 2025  
**API Version:** 1.0.0
