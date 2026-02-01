# 📝 API URL Update Guide

## ✅ Step 1: Config File Created
- Created `frontend/src/config/api.js` with centralized API configuration
- Created `frontend/.env` with VITE_API_URL

## 🔄 Step 2: Update Components

### Files That Need Manual Update (30+ files):

Replace this pattern:
```javascript
const API_BASE_URL = 'http://localhost:5000/api';
// OR
fetch('http://localhost:5000/api/...')
```

With this:
```javascript
import { API_ENDPOINTS } from '../config/api';
// OR
import { API_ENDPOINTS } from '../../config/api';

// Then use:
fetch(API_ENDPOINTS.PRODUCTS.BASE)
```

### Quick Find & Replace Instructions:

1. **Open VS Code**
2. **Press Ctrl+Shift+H** (Find and Replace in Files)
3. **Find:** `'http://localhost:5000/api`
4. **Replace:** `API_ENDPOINTS.API` (you'll need to import first)

### Component-by-Component Updates:

#### Admin Components:
- `frontend/src/components/admin/Users.jsx`
- `frontend/src/components/admin/Products.jsx`
- `frontend/src/components/admin/Orders.jsx`
- `frontend/src/components/admin/PaymentVerification.jsx`
- `frontend/src/components/admin/Reviews.jsx`
- `frontend/src/components/admin/Appointments.jsx`
- `frontend/src/components/admin/Analytics.jsx`
- `frontend/src/components/admin/AnalyticsEnhanced.jsx`
- `frontend/src/components/admin/SalesAnalytics.jsx`
- `frontend/src/components/admin/ConsultationAnalytics.jsx`
- `frontend/src/components/admin/Settings.jsx`

#### User Components:
- `frontend/src/components/user/UserDashboard.jsx`
- `frontend/src/components/user/Cart.jsx`
- `frontend/src/components/user/Wishlist.jsx`
- `frontend/src/components/user/Orders.jsx`
- `frontend/src/components/user/Profile.jsx`
- `frontend/src/components/user/Checkout.jsx`
- `frontend/src/components/user/UPIPayment.jsx`
- `frontend/src/components/user/OrderConfirmation.jsx`
- `frontend/src/components/user/CustomTailoring.jsx`
- `frontend/src/components/user/AppointmentConfirmation.jsx`
- `frontend/src/components/user/Membership.jsx`

#### Other Components:
- `frontend/src/components/Login.jsx`
- `frontend/src/components/Register.jsx`
- `frontend/src/components/Navbar.jsx`
- `frontend/src/components/ProductDetail.jsx`
- `frontend/src/components/SearchResults.jsx`
- `frontend/src/components/CategoryPage.jsx`
- `frontend/src/components/Home.jsx`

## 🎯 Example Update:

### BEFORE:
```javascript
const CustomTailoring = () => {
  const API_BASE_URL = 'http://localhost:5000/api';
  
  const fetchData = async () => {
    const response = await fetch(`${API_BASE_URL}/custom/appointments`);
  };
};
```

### AFTER:
```javascript
import { API_ENDPOINTS } from '../../config/api';

const CustomTailoring = () => {
  const fetchData = async () => {
    const response = await fetch(API_ENDPOINTS.CUSTOM.APPOINTMENTS);
  };
};
```

## 🖼️ Image URL Updates:

### BEFORE:
```javascript
src={`http://localhost:5000/uploads/${item.images[0]}`}
```

### AFTER:
```javascript
import { getImageUrl } from '../../config/api';

src={getImageUrl(item.images[0])}
```

## ✅ Testing After Update:

1. **Start backend:**
   ```bash
   cd backend
   node server.js
   ```

2. **Start frontend:**
   ```bash
   cd frontend
   npm run dev
   ```

3. **Test all features:**
   - Login/Register
   - Browse products
   - Add to cart
   - Place order
   - Admin panel
   - Analytics pages

## 🚀 For Production Deployment:

Update `frontend/.env` to:
```env
VITE_API_URL=https://your-backend-url.com
VITE_ENV=production
```

Then rebuild:
```bash
npm run build
```

---

**Status:** Config files created ✅
**Next:** Update all component files (manual or script)
**Time Required:** 1-2 hours for manual updates
