const fs = require('fs');
const path = require('path');

// Files to update
const files = [
  'frontend/src/components/Navbar.jsx',
  'frontend/src/components/ProductDetail.jsx',
  'frontend/src/components/SearchResults.jsx',
  'frontend/src/components/CategoryPage.jsx',
  'frontend/src/components/ForgotPassword.jsx',
  'frontend/src/components/user/Cart.jsx',
  'frontend/src/components/user/Wishlist.jsx',
  'frontend/src/components/user/Orders.jsx',
  'frontend/src/components/user/Profile.jsx',
  'frontend/src/components/user/Checkout.jsx',
  'frontend/src/components/user/UPIPayment.jsx',
  'frontend/src/components/user/OrderConfirmation.jsx',
  'frontend/src/components/user/CustomTailoring.jsx',
  'frontend/src/components/user/AppointmentConfirmation.jsx',
  'frontend/src/components/user/Membership.jsx',
  'frontend/src/components/user/UserDashboard.jsx',
  'frontend/src/components/admin/AdminDashboard.jsx',
  'frontend/src/components/admin/Users.jsx',
  'frontend/src/components/admin/Products.jsx',
  'frontend/src/components/admin/Orders.jsx',
  'frontend/src/components/admin/PaymentVerification.jsx',
  'frontend/src/components/admin/Reviews.jsx',
  'frontend/src/components/admin/Appointments.jsx',
  'frontend/src/components/admin/Analytics.jsx',
  'frontend/src/components/admin/AnalyticsEnhanced.jsx',
  'frontend/src/components/admin/SalesAnalytics.jsx',
  'frontend/src/components/admin/ConsultationAnalytics.jsx',
  'frontend/src/components/admin/Settings.jsx'
];

let updated = 0;
let errors = 0;

files.forEach(file => {
  try {
    if (!fs.existsSync(file)) {
      console.log(`⚠️  File not found: ${file}`);
      return;
    }

    let content = fs.readFileSync(file, 'utf8');
    const original = content;

    // Determine import path based on file location
    let importPath = '../config/api';
    if (file.includes('/admin/')) {
      importPath = '../../config/api';
    } else if (file.includes('/user/')) {
      importPath = '../../config/api';
    }

    // Check if import already exists
    const hasImport = content.includes("from '../config/api'") || 
                      content.includes("from '../../config/api'") ||
                      content.includes('from "../config/api"') ||
                      content.includes('from "../../config/api"');

    // Add import if not present and file has localhost URLs
    if (!hasImport && content.includes('http://localhost:5000')) {
      // Find the last import statement
      const importRegex = /import .+ from .+;?\n/g;
      const imports = content.match(importRegex);
      if (imports && imports.length > 0) {
        const lastImport = imports[imports.length - 1];
        const lastImportIndex = content.lastIndexOf(lastImport);
        const insertPosition = lastImportIndex + lastImport.length;
        
        content = content.slice(0, insertPosition) +
                  `import { API_ENDPOINTS, getImageUrl } from '${importPath}';\n` +
                  content.slice(insertPosition);
      }
    }

    // Remove API_BASE_URL declarations
    content = content.replace(/const API_BASE_URL = ['"]http:\/\/localhost:5000\/api['"];?\n?/g, '');
    content = content.replace(/const API_BASE_URL = ['"]http:\/\/localhost:5000['"];?\n?/g, '');

    // Replace API URLs
    content = content.replace(/'http:\/\/localhost:5000\/api\/auth\/login'/g, 'API_ENDPOINTS.AUTH.LOGIN');
    content = content.replace(/"http:\/\/localhost:5000\/api\/auth\/login"/g, 'API_ENDPOINTS.AUTH.LOGIN');
    
    content = content.replace(/'http:\/\/localhost:5000\/api\/auth\/register'/g, 'API_ENDPOINTS.AUTH.REGISTER');
    content = content.replace(/"http:\/\/localhost:5000\/api\/auth\/register"/g, 'API_ENDPOINTS.AUTH.REGISTER');
    
    content = content.replace(/'http:\/\/localhost:5000\/api\/products'/g, 'API_ENDPOINTS.PRODUCTS.BASE');
    content = content.replace(/"http:\/\/localhost:5000\/api\/products"/g, 'API_ENDPOINTS.PRODUCTS.BASE');
    
    content = content.replace(/'http:\/\/localhost:5000\/api\/cart'/g, 'API_ENDPOINTS.CART.BASE');
    content = content.replace(/"http:\/\/localhost:5000\/api\/cart"/g, 'API_ENDPOINTS.CART.BASE');
    
    content = content.replace(/'http:\/\/localhost:5000\/api\/wishlist'/g, 'API_ENDPOINTS.WISHLIST.BASE');
    content = content.replace(/"http:\/\/localhost:5000\/api\/wishlist"/g, 'API_ENDPOINTS.WISHLIST.BASE');
    
    content = content.replace(/'http:\/\/localhost:5000\/api\/orders'/g, 'API_ENDPOINTS.ORDERS.BASE');
    content = content.replace(/"http:\/\/localhost:5000\/api\/orders"/g, 'API_ENDPOINTS.ORDERS.BASE');
    
    content = content.replace(/'http:\/\/localhost:5000\/api\/profile'/g, 'API_ENDPOINTS.USER.PROFILE');
    content = content.replace(/"http:\/\/localhost:5000\/api\/profile"/g, 'API_ENDPOINTS.USER.PROFILE');
    
    content = content.replace(/'http:\/\/localhost:5000\/api\/admin'/g, 'API_ENDPOINTS.ADMIN');
    content = content.replace(/"http:\/\/localhost:5000\/api\/admin"/g, 'API_ENDPOINTS.ADMIN');
    
    content = content.replace(/'http:\/\/localhost:5000\/api\/memberships'/g, 'API_ENDPOINTS.MEMBERSHIPS');
    content = content.replace(/"http:\/\/localhost:5000\/api\/memberships"/g, 'API_ENDPOINTS.MEMBERSHIPS');
    
    content = content.replace(/'http:\/\/localhost:5000\/api\/custom'/g, 'API_ENDPOINTS.CUSTOM');
    content = content.replace(/"http:\/\/localhost:5000\/api\/custom"/g, 'API_ENDPOINTS.CUSTOM');
    
    // Replace generic API URLs
    content = content.replace(/['"]http:\/\/localhost:5000\/api/g, '`${API_ENDPOINTS.API}');
    content = content.replace(/`http:\/\/localhost:5000\/api/g, '`${API_ENDPOINTS.API}');
    
    // Replace upload URLs
    content = content.replace(/['"]http:\/\/localhost:5000\/uploads/g, '`${API_ENDPOINTS.UPLOADS.BASE}');
    content = content.replace(/`http:\/\/localhost:5000\/uploads/g, '`${API_ENDPOINTS.UPLOADS.BASE}');
    
    // Replace image URL patterns
    content = content.replace(/\? item\.images\[0\] : `http:\/\/localhost:5000\/uploads\/\$\{item\.images\[0\]\}`/g, '? item.images[0] : getImageUrl(item.images[0])');
    content = content.replace(/\.startsWith\('http'\) \? .+? : `http:\/\/localhost:5000\/uploads\/\$\{.+?\}`/g, match => {
      const varMatch = match.match(/\$\{(.+?)\}/);
      if (varMatch) {
        return `.startsWith('http') ? ${varMatch[1]} : getImageUrl(${varMatch[1]})`;
      }
      return match;
    });

    // Only write if content changed
    if (content !== original) {
      fs.writeFileSync(file, content, 'utf8');
      console.log(`✅ Updated: ${file}`);
      updated++;
    } else {
      console.log(`⏭️  No changes: ${file}`);
    }

  } catch (error) {
    console.log(`❌ Error updating ${file}:`, error.message);
    errors++;
  }
});

console.log(`\n📊 Summary:`);
console.log(`   Updated: ${updated} files`);
console.log(`   Errors: ${errors} files`);
console.log(`\n✨ Done!`);
