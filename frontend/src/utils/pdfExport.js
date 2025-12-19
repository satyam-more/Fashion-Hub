/**
 * Generate HTML Report in New Tab
 * @param {Object} config - Configuration object
 * @param {string} config.title - Report title
 * @param {Array} config.headers - Table headers array
 * @param {Array} config.data - Table data array
 * @param {Array} config.stats - Optional stats array [{label, value}]
 */
export const generateHTMLReport = (config) => {
  const {
    title,
    headers,
    data,
    stats = []
  } = config;

  const now = new Date();
  const currentDate = now.toLocaleDateString('en-IN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
  const currentTime = now.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit'
  });

  // Generate stats cards HTML
  const statsHTML = stats.length > 0 ? `
    <div class="stats-grid">
      ${stats.map(stat => `
        <div class="stat-card">
          <div class="stat-value">${stat.value}</div>
          <div class="stat-label">${stat.label}</div>
        </div>
      `).join('')}
    </div>
  ` : '';

  // Generate table rows HTML
  const tableRows = data.map(row => `
    <tr>
      ${row.map((cell, index) => `
        <td ${index === 0 ? 'class="first-col"' : ''}>${cell}</td>
      `).join('')}
    </tr>
  `).join('');

  // Open new tab with HTML report
  const newWindow = window.open('', '_blank');
  
  if (!newWindow) {
    alert('Please allow popups to view the report');
    return;
  }

  newWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>${title} - Fashion Hub</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          font-family: Arial, sans-serif;
          background: #e8e8e8;
          padding: 30px;
          color: #333;
        }
        
        .no-print {
          position: fixed;
          top: 20px;
          right: 20px;
          z-index: 1000;
          display: flex;
          gap: 10px;
        }
        
        .action-btn {
          background: #c0504d;
          color: white;
          border: none;
          padding: 10px 20px;
          font-size: 13px;
          font-weight: 600;
          border-radius: 4px;
          cursor: pointer;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        
        .action-btn:hover {
          background: #a0403d;
          transform: translateY(-1px);
          box-shadow: 0 3px 6px rgba(0,0,0,0.3);
        }
        
        .report-container {
          max-width: 1600px;
          margin: 0 auto;
          background: white;
          padding: 100px 190px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        
        .report-header {
          text-align: center;
          padding-bottom: 50px;
          border-bottom: 4px solid #ddd;
          margin-bottom: 70px;
          position: relative;
        }
        
        .company-name {
          font-size: 56px;
          font-weight: 700;
          color: #8b6914;
          margin-bottom: 18px;
          letter-spacing: 1px;
        }
        
        .report-title {
          font-size: 26px;
          color: #666;
          margin-bottom: 0;
        }
        
        .report-meta {
          position: absolute;
          top: 0;
          right: 0;
          text-align: right;
          font-size: 20px;
          color: #666;
          line-height: 2.2;
          font-weight: 500;
        }
        
        .report-meta div {
          margin-bottom: 8px;
        }
        
        .report-table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 70px;
          font-size: 14px;
          table-layout: auto;
        }
        
        .report-table thead {
          background: #8b6914;
          color: white;
        }
        
        .report-table th {
          padding: 12px 16px;
          text-align: left;
          font-weight: 700;
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          border-right: 1px solid rgba(255,255,255,0.2);
          white-space: nowrap;
        }
        
        .report-table th:first-child {
          text-align: center;
          width: 50px;
        }
        
        .report-table th:last-child {
          border-right: none;
        }
        
        .report-table td {
          padding: 12px 16px;
          border: 1px solid #ddd;
          font-size: 13px;
          color: #333;
          line-height: 1.5;
        }
        
        .report-table td:first-child {
          text-align: center;
          font-weight: 600;
          background: #f8f8f8;
          color: #666;
          width: 50px;
        }
        
        .report-table tbody tr {
          background: white;
        }
        
        .report-table tbody tr:nth-child(even) {
          background: #fafafa;
        }
        
        .report-table tbody tr:hover {
          background: #f0f0f0;
        }
        
        @media print {
          body {
            background: white;
            padding: 0;
          }
          
          .no-print {
            display: none !important;
          }
          
          .report-container {
            box-shadow: none;
            padding: 20px;
          }
          
          .report-table tbody tr:hover {
            background: inherit;
          }
          
          @page {
            margin: 1.5cm;
          }
        }
      </style>
    </head>
    <body>
      <div class="no-print">
        <button class="action-btn" onclick="window.print()">🖨️ Print</button>
        <button class="action-btn" style="background: #c0504d;" onclick="window.close()">✕ Close</button>
      </div>
      
      <div class="report-container">
        <div class="report-header">
          <div class="company-name">Fashion Hub</div>
          <div class="report-title">${title}</div>
          <div class="report-meta">
            <div><strong>Date:</strong> ${currentDate}</div>
            <div><strong>Time:</strong> ${currentTime}</div>
          </div>
        </div>
        
        <table class="report-table">
          <thead>
            <tr>
              ${headers.map(header => `<th>${header}</th>`).join('')}
            </tr>
          </thead>
          <tbody>
            ${tableRows}
          </tbody>
        </table>
      </div>
    </body>
    </html>
  `);
  
  newWindow.document.close();
};

/**
 * Export Products Report
 */
export const exportProductsReport = (products, stats) => {
  const headers = ['Product Id', 'Product Name', 'Category', 'Type', 'Price (₹)', 'Discount (%)', 'Stock', 'Status'];
  
  const data = products.map((product, index) => [
    index + 1,
    product.name || 'N/A',
    product.category || 'N/A',
    product.type || 'N/A',
    product.price ? `₹${product.price.toLocaleString()}` : '₹0',
    product.discount || '0',
    product.quantity || '0',
    product.status || 'active'
  ]);

  const statsArray = [
    { label: 'Total Items', value: stats.totalProducts || 0 },
    { label: 'In Stock', value: stats.activeProducts || 0 },
    { label: 'Low Stock', value: stats.lowStock || 0 },
    { label: 'Inventory Value', value: `₹${(stats.inventoryValue || 0).toLocaleString()}` }
  ];

  generateHTMLReport({
    title: 'Report on Product Inventory',
    headers,
    data,
    stats: statsArray
  });
};

/**
 * Export Orders Report
 */
export const exportOrdersReport = (orders, stats) => {
  const headers = ['ORDER ID', 'CUSTOMER NAME', 'EMAIL', 'TOTAL AMOUNT', 'STATUS', 'ORDER DATE'];
  
  const data = orders.map((order) => {
    return [
      order.order_number || order.order_id || 'N/A',
      order.customer_name || 'N/A',
      order.customer_email || 'N/A',
      `₹${parseFloat(order.total_amount || 0).toFixed(2)}`,
      (order.status || 'pending').toUpperCase(),
      new Date(order.created_at).toLocaleDateString('en-IN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      })
    ];
  });

  const statsArray = [
    { label: 'Total Orders', value: stats.total || 0 },
    { label: 'Pending', value: stats.pending || 0 },
    { label: 'Processing', value: stats.processing || 0 },
    { label: 'Total Revenue', value: `₹${(stats.revenue || 0).toLocaleString()}` }
  ];

  generateHTMLReport({
    title: 'Report on Orders',
    headers,
    data,
    stats: statsArray
  });
};

/**
 * Export Users Report
 */
export const exportUsersReport = (users, stats) => {
  const headers = ['USER ID', 'Name', 'Email', 'Phone', 'City', 'State', 'Address', 'Registered'];
  
  const data = users.map((user) => [
    user.id || 'N/A',
    user.username || 'N/A',
    user.email || 'N/A',
    user.phone || 'N/A',
    user.city || 'N/A',
    user.state || 'N/A',
    user.address || 'N/A',
    user.created_at ? new Date(user.created_at).toLocaleString('en-IN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }).replace(',', '') : 'N/A'
  ]);

  const statsArray = [
    { label: 'Total Users', value: stats.totalUsers || 0 },
    { label: 'Admins', value: stats.admins || 0 },
    { label: 'Customers', value: stats.customers || 0 },
    { label: 'Active Users', value: stats.activeUsers || 0 }
  ];

  generateHTMLReport({
    title: 'Report on User Registration',
    headers,
    data,
    stats: statsArray
  });
};

/**
 * Export Reviews Report
 */
export const exportReviewsReport = (reviews, stats) => {
  const headers = ['Review Id', 'PRODUCT', 'CUSTOMER', 'RATING', 'REVIEW', 'DATE'];
  
  const data = reviews.map((review, index) => [
    index + 1,
    review.product_name || 'N/A',
    review.customer_name || 'N/A',
    `${review.rating || 0}/5`,
    review.comment || review.review_text || 'No review text',
    new Date(review.created_at).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    })
  ]);

  const statsArray = [
    { label: 'Total Reviews', value: stats.totalReviews || 0 },
    { label: 'Avg Rating', value: `${(stats.avgRating || 0).toFixed(1)}/5.0` },
    { label: '5 Star', value: stats.fiveStar || 0 },
    { label: '4 Star', value: stats.fourStar || 0 }
  ];

  generateHTMLReport({
    title: 'Customer Wise Reviews Report',
    headers,
    data,
    stats: statsArray
  });
};

/**
 * Export Dashboard Report
 */
export const exportDashboardReport = (dashboardStats) => {
  const headers = ['Metric', 'Value'];
  
  const data = [
    ['Total Products', dashboardStats.totalProducts || 0],
    ['Total Users', dashboardStats.totalUsers || 0],
    ['Total Orders', dashboardStats.totalOrders || 0],
    ['Custom Orders', dashboardStats.customOrders || 0],
    ['Today\'s Revenue', `₹${(dashboardStats.todayRevenue || 0).toLocaleString()}`],
    ['Pending Orders', dashboardStats.pendingOrders || 0]
  ];

  const statsArray = [
    { label: 'Total Products', value: dashboardStats.totalProducts || 0 },
    { label: 'Total Users', value: dashboardStats.totalUsers || 0 },
    { label: 'Total Orders', value: dashboardStats.totalOrders || 0 },
    { label: 'Today\'s Revenue', value: `₹${(dashboardStats.todayRevenue || 0).toLocaleString()}` }
  ];

  generateHTMLReport({
    title: 'Dashboard Overview Report',
    headers,
    data,
    stats: statsArray
  });
};

/**
 * Export Analytics Report
 */
export const exportAnalyticsReport = (analyticsData, dateRange) => {
  const headers = ['Metric', 'Value'];
  
  const overview = analyticsData.overview || {};
  const data = [
    ['Total Revenue', `₹${(overview.totalRevenue || 0).toLocaleString()}`],
    ['Total Orders', overview.totalOrders || 0],
    ['Average Order Value', `₹${(overview.averageOrderValue || 0).toLocaleString()}`],
    ['Conversion Rate', `${(overview.conversionRate || 0).toFixed(2)}%`],
    ['Monthly Growth', `${(overview.monthlyGrowth || 0).toFixed(2)}%`],
    ['Total Customers', overview.totalCustomers || 0]
  ];

  const statsArray = [
    { label: 'Total Revenue', value: `₹${(overview.totalRevenue || 0).toLocaleString()}` },
    { label: 'Total Orders', value: overview.totalOrders || 0 },
    { label: 'Avg Order Value', value: `₹${(overview.averageOrderValue || 0).toLocaleString()}` },
    { label: 'Conversion Rate', value: `${(overview.conversionRate || 0).toFixed(1)}%` }
  ];

  generateHTMLReport({
    title: `Analytics & Reports - ${dateRange || 'Last 30 Days'}`,
    headers,
    data,
    stats: statsArray
  });
};

/**
 * Export Appointments Report
 */
export const exportAppointmentsReport = (appointments, stats) => {
  const headers = ['Booking Id', 'Customer', 'Service', 'Date', 'Time', 'Status', 'Priority'];
  
  const data = appointments.map((apt, index) => {
    // Parse service_types if it's an array or JSON string
    let services = 'N/A';
    if (apt.service_types) {
      try {
        const servicesArray = typeof apt.service_types === 'string' 
          ? JSON.parse(apt.service_types) 
          : apt.service_types;
        services = Array.isArray(servicesArray) ? servicesArray.join(', ') : String(apt.service_types);
      } catch (e) {
        services = String(apt.service_types);
      }
    }
    
    return [
      index + 1,
      apt.customer_name || apt.name || 'N/A',
      services,
      apt.appointment_date ? new Date(apt.appointment_date).toLocaleDateString('en-IN') : 'N/A',
      apt.time_slot || apt.appointment_time || 'N/A',
      apt.status || 'pending',
      apt.priority || 'medium'
    ];
  });

  const statsArray = [
    { label: 'Total Appointments', value: stats.total || 0 },
    { label: 'Pending', value: stats.pending || 0 },
    { label: 'Confirmed', value: stats.confirmed || 0 },
    { label: 'Completed', value: stats.completed || 0 }
  ];

  generateHTMLReport({
    title: 'Customer Wise Consultation Booking Report',
    headers,
    data,
    stats: statsArray
  });
};

/**
 * Export Payment Verification Report
 */
export const exportPaymentsReport = (payments, stats) => {
  const headers = ['ORDER ID', 'PAYMENT ID', 'CUSTOMER NAME', 'METHOD', 'UPI APP', 'UTR NUMBER', 'AMOUNT', 'STATUS', 'PAYMENT DATE'];
  
  const filteredPayments = payments
    .filter((payment) => {
      // Exclude rows where essential fields are missing
      return payment.order_id && payment.transaction_id && payment.customer_name;
    })
    .slice(0, 10);

  const data = filteredPayments.map((payment) => {
    // Format payment method
    let method = payment.payment_method || 'N/A';
    if (method === 'upi_direct' || method === 'upi') {
      method = 'UPI';
    } else if (method === 'cod') {
      method = 'COD';
    }
    
    // Determine UPI app from transaction ID or payment method
    let upiApp = '-';
    if (method === 'UPI' && payment.transaction_id) {
      if (payment.transaction_id.includes('GPAY') || payment.transaction_id.includes('GooglePay')) {
        upiApp = 'UPI - GooglePay';
      } else if (payment.transaction_id.includes('PHONEPE') || payment.transaction_id.includes('PhonePe')) {
        upiApp = 'UPI - PhonePe';
      } else if (payment.transaction_id.includes('PAYTM')) {
        upiApp = 'UPI - Paytm';
      } else if (payment.transaction_id.includes('AMZ') || payment.transaction_id.includes('Amazon')) {
        upiApp = 'UPI - AmazonPay';
      } else {
        upiApp = 'UPI';
      }
    }
    
    return [
      payment.order_id,
      payment.transaction_id,
      payment.customer_name,
      method,
      upiApp,
      payment.transaction_id || '-',
      `₹${parseFloat(payment.total_amount || 0).toFixed(2)}`,
      (payment.payment_status || 'pending').toUpperCase(),
      new Date(payment.created_at).toLocaleDateString('en-IN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      })
    ];
  });

  // Calculate total amount for the displayed payments
  const displayedTotalAmount = filteredPayments.reduce((sum, payment) => sum + parseFloat(payment.total_amount || 0), 0);

  // Add total row at the end
  data.push(['', '', '', '', '', 'Total Amount:', `₹${displayedTotalAmount.toLocaleString()}`, '', '']);

  generateHTMLReport({
    title: 'Report on Payment',
    headers,
    data,
    stats: []
  });
};
