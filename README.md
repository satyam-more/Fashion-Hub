
 👗 Fashion Hub - E-Commerce Platform

A full-stack e-commerce web application for fashion products built with React, Node.js, Express, and MySQL.

## ✨ Features

### User Features

- 🔐 User authentication (Register/Login with JWT)
- 👤 User profile management
- 🛍️ Browse products by categories (Men's, Women's, Kids)
- 🔍 Advanced search and filtering
- 🛒 Shopping cart functionality
- ❤️ Wishlist management
- 📦 Order placement and tracking
- ⭐ Product reviews and ratings
- 📧 Email notifications for orders

### Admin Features

- 📊 Admin dashboard with analytics
- 📦 Product management (CRUD operations)
- 👥 User management
- 📋 Order management
- ⭐ Review moderation
- 📈 Sales analytics

## 🛠️ Tech Stack

### Frontend

- **React** 18.3.1 - UI library
- **React Router** 6.26.1 - Routing
- **Tailwind CSS** 3.4.10 - Styling
- **Vite** 5.4.2 - Build tool
- **Axios** - HTTP client

### Backend

- **Node.js** - Runtime environment
- **Express.js** 4.19.2 - Web framework
- **MySQL** - Database
- **JWT** - Authentication
- **Bcrypt** - Password hashing
- **Multer** - File uploads
- **Nodemailer** - Email service

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v14 or higher)
- **npm** or **yarn**
- **MySQL** (v5.7 or higher)
- **Git**

## 🚀 Installation & Setup

### 1. Clone the Repository

```bash
git clone https://github.com/satyam-more/Fashion-Hub.git
cd Fashion-Hub
```

### 2. Database Setup

```bash
# Login to MySQL
mysql -u root -p

# Import the database
mysql -u root -p < database.sql

# Or use MySQL Workbench/phpMyAdmin to import database.sql
```

### 3. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Edit .env file with your configuration
# Update database credentials, JWT secret, and email settings
```

**Backend .env Configuration:**

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=fashion_hub
PORT=5000
JWT_SECRET=your_super_secret_jwt_key
FRONTEND_URL=http://localhost:5173

# Email Configuration (Gmail)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_specific_password
EMAIL_FROM=your_email@gmail.com
EMAIL_FROM_NAME=Fashion Hub
EMAIL_ENABLED=true
```

**Note:** For Gmail, you need to generate an [App Password](https://support.google.com/accounts/answer/185833).

```bash
# Start backend server
npm start
# Server will run on http://localhost:5000
```

### 4. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
# Frontend will run on http://localhost:5173
```

## 📁 Project Structure

```
Fashion-Hub/
├── backend/
│   ├── config/           # Database configuration
│   ├── controllers/      # Route controllers
│   ├── middleware/       # Custom middleware (auth, upload)
│   ├── routes/           # API routes
│   ├── services/         # Business logic (email service)
│   ├── templates/        # Email templates
│   ├── uploads/          # Uploaded files
│   ├── .env.example      # Environment variables template
│   ├── server.js         # Entry point
│   └── package.json
│
├── frontend/
│   ├── public/           # Static files
│   ├── src/
│   │   ├── components/   # React components
│   │   ├── styles/       # CSS files
│   │   ├── App.jsx       # Main app component
│   │   └── main.jsx      # Entry point
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
├── database.sql          # Database schema
├── .gitignore
└── README.md
```

## 🔑 API Endpoints

### Authentication

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

### Products

- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get product by ID
- `GET /api/products/category/:category` - Get products by category
- `POST /api/products` - Create product (Admin)
- `PUT /api/products/:id` - Update product (Admin)
- `DELETE /api/products/:id` - Delete product (Admin)

### Cart

- `GET /api/cart` - Get user cart
- `POST /api/cart` - Add item to cart
- `PUT /api/cart/:id` - Update cart item
- `DELETE /api/cart/:id` - Remove from cart

### Orders

- `GET /api/orders` - Get user orders
- `GET /api/orders/:id` - Get order details
- `POST /api/orders` - Create new order
- `PUT /api/orders/:id` - Update order status (Admin)

### Reviews

- `GET /api/reviews/product/:productId` - Get product reviews
- `POST /api/reviews` - Add review
- `PUT /api/reviews/:id` - Update review
- `DELETE /api/reviews/:id` - Delete review

### Admin

- `GET /api/admin/dashboard` - Get dashboard stats
- `GET /api/admin/users` - Get all users
- `GET /api/admin/orders` - Get all orders

## 👤 Default Admin Account

After setting up the database, create an admin account:

```sql
-- Run this SQL query to create admin user
INSERT INTO users (username, email, password, role)
VALUES ('admin', 'admin@fashionhub.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyVBhJ5FYKGa', 'admin');
-- Password: admin123
```

Or register a new user and manually update the role to 'admin' in the database.

## 📧 Email Configuration

The application uses Nodemailer for sending emails. To enable email functionality:

1. Use Gmail SMTP (recommended for development)
2. Enable 2-Factor Authentication on your Gmail account
3. Generate an App Password: [Google App Passwords](https://myaccount.google.com/apppasswords)
4. Add the App Password to your `.env` file

## 🎨 Features in Detail

### Product Management

- Multiple product images
- Size variants (S, M, L, XL, XXL, XXXL)
- Discount pricing
- Stock management
- Category and subcategory organization

### Shopping Cart

- Add/remove items
- Update quantities
- Size selection
- Real-time price calculation

### Checkout Process

- Shipping address form
- Multiple payment methods (COD, Card, UPI)
- Order summary
- Email confirmation

### User Dashboard

- Order history
- Profile management
- Wishlist
- Address management

### Admin Dashboard

- Sales analytics
- Order management
- Product inventory
- User management
- Review moderation

## 🔒 Security Features

- Password hashing with bcrypt
- JWT token authentication
- Protected API routes
- Input validation
- SQL injection prevention
- XSS protection
- CORS configuration

## 🧪 Testing

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
```

## 📦 Deployment

### Backend Deployment (Heroku/Railway/Render)

1. Set environment variables
2. Update FRONTEND_URL to production URL
3. Deploy using platform CLI or Git integration

### Frontend Deployment (Vercel/Netlify)

1. Build the project: `npm run build`
2. Deploy the `dist` folder
3. Update API base URL to production backend

### Database Deployment

- Use managed MySQL service (AWS RDS, PlanetScale, etc.)
- Update DB credentials in backend .env

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Your Name**

- GitHub: [@satyam-more](https://github.com/satyam-more)
- Email: satyammore2020@gmail.com

## 🙏 Acknowledgments

- React team for the amazing library
- Express.js community
- All contributors and supporters

## 📞 Support

For support, email satyammore06@gmail.com or open an issue in the repository.

---

Made with ❤️ by [Satyam More](https://github.com/satyam-more)
