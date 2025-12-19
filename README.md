# Fashion Hub - E-Commerce Platform

**A Full-Stack Fashion E-Commerce Web Application**

---

## 📋 Project Overview

Fashion Hub is a comprehensive e-commerce platform designed for fashion retail, featuring product management, order processing, payment verification, appointment booking, and customer reviews. The platform provides both customer-facing shopping features and a robust admin panel for business management.

### Project Type
**Full-Stack Web Application** - E-Commerce Platform

### Domain
**Fashion & Retail**

### Technology Stack
- **Frontend:** React.js, CSS3, Axios
- **Backend:** Node.js, Express.js
- **Database:** MySQL
- **Authentication:** JWT (JSON Web Tokens)
- **Email Service:** Nodemailer
- **Payment Methods:** UPI, COD (Cash on Delivery)

---

## 🎯 Key Features

### Customer Features
1. **Product Browsing & Search**
   - Browse products by category (Men's, Women's, Kids)
   - Filter by subcategory, type, price range
   - Product details with images, descriptions, and reviews

2. **Shopping Cart & Wishlist**
   - Add/remove products from cart
   - Save favorite items to wishlist
   - Size selection and quantity management

3. **Order Management**
   - Place orders with multiple payment options
   - Track order status (Pending, Processing, Shipped, Delivered)
   - View order history and details

4. **User Profile**
   - Manage personal information
   - Update contact details and addresses
   - Change password

5. **Product Reviews**
   - Rate products (1-5 stars)
   - Write detailed reviews
   - View reviews from other customers

6. **Appointment Booking**
   - Book custom tailoring consultations
   - Select services and time slots
   - Track appointment status

### Admin Features
1. **Dashboard**
   - Real-time statistics (Products, Users, Orders, Revenue)
   - Recent activity feed
   - Quick access to key metrics

2. **Product Management**
   - Add/Edit/Delete products
   - Manage inventory and stock levels
   - Set prices and discounts
   - Upload product images

3. **User Management**
   - View all registered users
   - Edit user details (name, email, phone, address)
   - Manage user roles (Admin/Customer)
   - Export user data to PDF

4. **Order Management**
   - View all orders with detailed information
   - Update order status
   - Track payment status
   - Export orders report to PDF

5. **Payment Verification**
   - View all payment transactions
   - Verify UPI payments
   - Approve/Reject pending payments
   - Export payment reports

6. **Reviews Management**
   - View all customer reviews
   - Moderate reviews
   - Delete inappropriate reviews
   - Export reviews report

7. **Appointments Management**
   - View all consultation bookings
   - Confirm/Cancel appointments
   - Track appointment status

8. **Analytics & Reports**
   - Sales analytics with charts
   - Revenue tracking
   - Customer segmentation
   - Export comprehensive reports

---

## 📊 Database Schema

### Core Tables

#### 1. Users Table
```sql
- id (Primary Key)
- username
- email (Unique)
- password (Hashed)
- phone
- city
- state
- address
- role (user/admin)
- created_at
- updated_at
```

#### 2. Products Table
```sql
- product_id (Primary Key)
- product_name
- category_id (Foreign Key)
- subcategory_id (Foreign Key)
- type (upperwear/bottomwear/accessories)
- price
- quantity
- sizes
- discount
- fabric
- colour
- images
- created_at
- updated_at
```

#### 3. Orders Table
```sql
- order_id (Primary Key)
- user_id (Foreign Key)
- order_number (Unique)
- total_amount
- subtotal
- tax
- shipping_cost
- status (pending/processing/shipped/delivered/cancelled)
- shipping_address
- payment_method (cod/upi_direct/upi)
- payment_status (pending/paid/failed/payment_pending)
- transaction_id
- created_at
- updated_at
```

#### 4. Product Reviews Table
```sql
- review_id (Primary Key)
- product_id (Foreign Key)
- user_id (Foreign Key)
- rating (1-5)
- review_text
- created_at
- updated_at
```

#### 5. Appointments Table
```sql
- appointment_id (Primary Key)
- user_id (Foreign Key)
- customer_name
- customer_email
- customer_phone
- service_types (JSON)
- appointment_date
- time_slot
- status (pending/confirmed/completed/cancelled)
- priority (low/medium/high)
- notes
- created_at
- updated_at
```

---

## 🚀 Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- MySQL (v8.0 or higher)
- npm or yarn package manager

### Backend Setup

1. **Navigate to backend directory:**
```bash
cd backend
```

2. **Install dependencies:**
```bash
npm install
```

3. **Configure environment variables:**
Create a `.env` file in the backend directory:
```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=fashion_hub
PORT=5000
JWT_SECRET=your_jwt_secret_key
FRONTEND_URL=http://localhost:5173

# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
EMAIL_FROM=your_email@gmail.com
EMAIL_FROM_NAME=Fashion Hub
```

4. **Create database:**
```bash
mysql -u root -p
CREATE DATABASE fashion_hub;
USE fashion_hub;
SOURCE database.sql;
```

5. **Run migrations (if needed):**
```bash
node migrations/add-user-contact-fields.sql
```

6. **Insert sample data:**
```bash
# Insert sample users
node insert-sample-users.js

# Insert sample products
node insert-sample-products.js

# Insert sample orders
node insert-sample-orders.js

# Insert sample reviews
node insert-product-reviews.js

# Insert sample consultations
node insert-sample-consultations.js
```

7. **Start backend server:**
```bash
node server.js
```
Server will run on `http://localhost:5000`

### Frontend Setup

1. **Navigate to frontend directory:**
```bash
cd frontend
```

2. **Install dependencies:**
```bash
npm install
```

3. **Start development server:**
```bash
npm run dev
```
Frontend will run on `http://localhost:5173`

---

## 👤 Default Admin Credentials

**Email:** satyammore2020@gmail.com  
**Password:** Pass@123

---

## 📁 Project Structure

```
Fashion-Hub/
├── backend/
│   ├── config/
│   │   └── db.js
│   ├── controllers/
│   │   ├── productController.js
│   │   ├── reviewController.js
│   │   └── uploadController.js
│   ├── middleware/
│   │   └── auth.js
│   ├── migrations/
│   │   └── add-user-contact-fields.sql
│   ├── routes/
│   │   ├── admin.js
│   │   ├── auth.js
│   │   ├── cart.js
│   │   ├── custom.js
│   │   ├── orders.js
│   │   ├── products.js
│   │   ├── profile.js
│   │   └── reviews.js
│   ├── services/
│   │   └── emailService.js
│   ├── uploads/
│   ├── .env
│   ├── database.sql
│   ├── package.json
│   └── server.js
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── admin/
│   │   │   │   ├── AdminLayout.jsx
│   │   │   │   ├── Dashboard.jsx
│   │   │   │   ├── Products.jsx
│   │   │   │   ├── Users.jsx
│   │   │   │   ├── Orders.jsx
│   │   │   │   ├── PaymentVerification.jsx
│   │   │   │   ├── Reviews.jsx
│   │   │   │   └── Appointments.jsx
│   │   │   ├── user/
│   │   │   │   ├── UserDashboard.jsx
│   │   │   │   ├── Cart.jsx
│   │   │   │   ├── Wishlist.jsx
│   │   │   │   └── Orders.jsx
│   │   │   ├── AboutUs.jsx
│   │   │   ├── CategoryPage.jsx
│   │   │   ├── Home.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Navbar.jsx
│   │   │   └── ProductDetails.jsx
│   │   ├── styles/
│   │   │   ├── admin/
│   │   │   ├── user/
│   │   │   └── components/
│   │   ├── utils/
│   │   │   └── pdfExport.js
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
│
├── CATEGORIES_ANALYSIS.md
├── PRODUCTS_ANALYSIS.md
├── TABLES_ANALYSIS.md
└── README.md
```

---

## 📊 Sample Data Statistics

### Users
- **Total Users:** 12
- **Admin Users:** 1
- **Customer Users:** 11
- **All users from Maharashtra** with complete contact details

### Products
- **Total Products:** 35
- **Categories:** Men's (17), Women's (12), Kids (6)
- **Total Inventory Value:** ₹25,09,505
- **Average Price:** ₹1,886
- **Total Stock:** 1,933 units

### Orders
- **Total Orders:** 17
- **Total Revenue:** ₹77,389.52
- **Payment Methods:** UPI (9), COD (8)
- **Order Statuses:** Delivered (5), Processing (6), Shipped (5), Pending (3)

### Reviews
- **Total Reviews:** 26
- **Average Rating:** 4.08/5.0
- **Products Reviewed:** 20/35
- **Rating Distribution:** 5★ (50%), 4★ (23%), 3★ (15%), 2★ (8%), 1★ (4%)

### Appointments
- **Total Consultations:** 10
- **Status:** Confirmed (6), Pending (3), Completed (1)
- **Services:** Custom Tailoring, Design Consultation, Fitting Sessions

---

## 📄 PDF Export Features

The platform includes comprehensive PDF export functionality for all major data:

### Available Reports
1. **Users Management Report**
   - User ID, Name, Email, Phone, City, State, Address, Registration Date

2. **Products Inventory Report**
   - Product details, Category, Type, Price, Discount, Stock, Status

3. **Orders Report**
   - Order ID, Customer Name, Email, Total Amount, Status, Order Date

4. **Payment Transactions Report**
   - Order ID, Payment ID, Customer, Method, UPI App, UTR Number, Amount, Status, Date

5. **Customer Reviews Report**
   - Product, Customer, Rating, Full Review Text, Date

6. **Appointments Report**
   - Customer, Services, Date, Time, Status, Priority

### Report Features
- Professional formatting with company branding
- Date and time stamps
- Summary statistics
- Print-friendly layout
- Exportable to PDF via browser print function

---

## 🔐 Security Features

1. **Authentication & Authorization**
   - JWT-based authentication
   - Password hashing with bcrypt
   - Role-based access control (Admin/User)
   - Protected API routes

2. **Data Validation**
   - Input sanitization
   - Email validation
   - Password strength requirements
   - SQL injection prevention

3. **Secure Payment Processing**
   - Transaction ID verification
   - Payment status tracking
   - Admin approval for UPI payments

---

## 🛠️ Utility Scripts

### Data Management
```bash
# Analyze database tables
node backend/analyze-tables.js

# Analyze products
node backend/analyze-products.js

# Clean old test data
node backend/clean-old-data.js

# Perform data cleaning
node backend/data-cleaning.js

# Verify users
node backend/verify-users.js

# Check pending payments
node backend/check-pending-payments.js

# Check appointments
node backend/check-appointments.js
```

### User Management
```bash
# Reassign user IDs
node backend/reassign-user-ids.js

# Update registration dates
node backend/update-registration-dates.js
```

### Payment Management
```bash
# Fix payment methods
node backend/fix-payment-methods.js
```

---

## 📈 Future Enhancements

1. **Payment Gateway Integration**
   - Razorpay/Stripe integration
   - Automated payment verification
   - Refund processing

2. **Advanced Analytics**
   - Sales forecasting
   - Customer behavior analysis
   - Inventory optimization

3. **Mobile Application**
   - React Native mobile app
   - Push notifications
   - Mobile-optimized checkout

4. **AI Features**
   - Product recommendations
   - Size prediction
   - Virtual try-on

5. **Social Features**
   - Social media login
   - Share products
   - Referral program

---

## 🐛 Known Issues & Limitations

1. Email service requires valid SMTP credentials
2. Image upload limited to local storage (consider cloud storage)
3. Payment verification is manual for UPI transactions
4. No real-time order tracking

---

## 👥 Team & Contributors

**Project Type:** Academic/Portfolio Project  
**Developed By:** [Your Name/Team Name]  
**Institution:** [Your Institution Name]  
**Year:** 2025

---

## 📞 Support & Contact

For queries or support:
- **Email:** satyammore2020@gmail.com
- **Project Repository:** [GitHub Link]

---

## 📝 License

This project is developed for educational purposes.

---

## 🙏 Acknowledgments

- React.js community for excellent documentation
- Node.js and Express.js for robust backend framework
- MySQL for reliable database management
- All open-source contributors

---

**Last Updated:** December 2, 2025  
**Version:** 1.0.0  
**Status:** ✅ Production Ready
