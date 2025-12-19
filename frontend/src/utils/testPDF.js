// Test PDF Export - Run this in browser console to test
import { exportProductsReport } from './pdfExport';

// Test data
const testProducts = [
  {
    id: 1,
    name: 'Test Product 1',
    category: 'Men',
    type: 'upperwear',
    price: 1999,
    discount: 10,
    quantity: 50,
    status: 'active'
  },
  {
    id: 2,
    name: 'Test Product 2',
    category: 'Women',
    type: 'saree',
    price: 2999,
    discount: 15,
    quantity: 30,
    status: 'active'
  }
];

const testStats = {
  totalProducts: 2,
  activeProducts: 2,
  lowStock: 0,
  inventoryValue: 150000
};

// Run test
console.log('Testing PDF Export...');
try {
  exportProductsReport(testProducts, testStats);
  console.log('✅ PDF Export successful!');
} catch (error) {
  console.error('❌ PDF Export failed:', error);
}
