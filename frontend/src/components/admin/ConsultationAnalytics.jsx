import React, { useState, useEffect } from 'react';
import { Bar, Line, Pie, Radar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  RadialLinearScale,
} from 'chart.js';
import AdminLayout from './AdminLayout';
import '../../styles/admin/ConsultationAnalytics.css';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  RadialLinearScale
);

const ConsultationAnalytics = () => {
  const [consultationData, setConsultationData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('monthly');

  useEffect(() => {
    fetchConsultationData();
  }, [timeRange]);

  const fetchConsultationData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');
      
      if (!token) {
        console.warn('No auth token found, using mock data');
        setConsultationData(generateMockConsultationData());
        return;
      }

      const response = await fetch(`http://localhost:5000/api/admin/consultation-analytics?range=${timeRange}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          console.log('Fetched consultation data:', data.data);
          
          // If no real data, use mock data
          if (data.data.monthlyBookings.length === 0) {
            console.log('No real booking data found, using mock data');
            setConsultationData(generateMockConsultationData());
          } else {
            // Use real data but supplement with mock data for missing parts
            const enhancedData = {
              ...data.data,
              // Use mock data for parts that might not have real data
              customerSatisfaction: data.data.customerSatisfaction.length > 0 ? 
                data.data.customerSatisfaction : generateMockConsultationData().customerSatisfaction,
              consultantPerformance: data.data.consultantPerformance.length > 0 ? 
                data.data.consultantPerformance : generateMockConsultationData().consultantPerformance,
              weeklyTrends: data.data.weeklyTrends.length > 0 ? 
                data.data.weeklyTrends : generateMockConsultationData().weeklyTrends
            };
            setConsultationData(enhancedData);
          }
        } else {
          console.warn('Invalid data structure, using mock data');
          setConsultationData(generateMockConsultationData());
        }
      } else {
        console.warn(`API response not ok: ${response.status}, using mock data`);
        setConsultationData(generateMockConsultationData());
      }
    } catch (error) {
      console.error('Error fetching consultation data:', error);
      setConsultationData(generateMockConsultationData());
    } finally {
      setLoading(false);
    }
  };

  const generateMockConsultationData = () => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const services = ['Custom Tailoring', 'Style Consultation', 'Alteration', 'Design Review', 'Fitting Session'];
    const timeSlots = ['9:00 AM', '11:00 AM', '2:00 PM', '4:00 PM', '6:00 PM'];
    
    return {
      monthlyBookings: months.map(month => ({
        month,
        bookings: Math.floor(Math.random() * 80) + 20,
        completed: Math.floor(Math.random() * 60) + 15,
        cancelled: Math.floor(Math.random() * 15) + 2
      })),
      serviceTypes: services.map(service => ({
        service,
        bookings: Math.floor(Math.random() * 50) + 10,
        revenue: Math.floor(Math.random() * 25000) + 5000
      })),
      timeSlotPopularity: timeSlots.map(slot => ({
        slot,
        bookings: Math.floor(Math.random() * 40) + 10
      })),
      customerSatisfaction: [
        { rating: '5 Stars', count: 145, percentage: 58 },
        { rating: '4 Stars', count: 67, percentage: 27 },
        { rating: '3 Stars', count: 25, percentage: 10 },
        { rating: '2 Stars', count: 8, percentage: 3 },
        { rating: '1 Star', count: 5, percentage: 2 }
      ],
      consultantPerformance: [
        { name: 'Sarah Johnson', bookings: 89, rating: 4.8, revenue: 44500 },
        { name: 'Mike Chen', bookings: 76, rating: 4.7, revenue: 38000 },
        { name: 'Emily Davis', bookings: 65, rating: 4.9, revenue: 32500 },
        { name: 'David Wilson', bookings: 58, rating: 4.6, revenue: 29000 },
        { name: 'Lisa Brown', bookings: 52, rating: 4.8, revenue: 26000 }
      ],
      weeklyTrends: [
        { day: 'Monday', bookings: 25 },
        { day: 'Tuesday', bookings: 32 },
        { day: 'Wednesday', bookings: 28 },
        { day: 'Thursday', bookings: 35 },
        { day: 'Friday', bookings: 42 },
        { day: 'Saturday', bookings: 58 },
        { day: 'Sunday', bookings: 18 }
      ]
    };
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    devicePixelRatio: window.devicePixelRatio || 2,
    interaction: {
      intersect: false,
      mode: 'index'
    },
    animation: {
      duration: 1000,
      easing: 'easeInOutQuart'
    },
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: '#4E342E',
          font: {
            size: 14,
            weight: '600'
          },
          padding: 20,
          usePointStyle: true,
          pointStyle: 'circle'
        }
      },
      title: {
        display: true,
        color: '#4E342E',
        font: {
          size: 18,
          weight: '700'
        },
        padding: {
          top: 10,
          bottom: 30
        }
      },
      tooltip: {
        backgroundColor: 'rgba(78, 52, 46, 0.95)',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: '#d97706',
        borderWidth: 2,
        cornerRadius: 8,
        displayColors: true,
        titleFont: {
          size: 14,
          weight: '600'
        },
        bodyFont: {
          size: 13
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          color: '#6B5D54',
          font: {
            size: 12,
            weight: '500'
          },
          padding: 10
        },
        grid: {
          color: 'rgba(194, 157, 94, 0.15)',
          lineWidth: 1
        },
        border: {
          color: 'rgba(194, 157, 94, 0.3)',
          width: 2
        }
      },
      x: {
        ticks: {
          color: '#6B5D54',
          font: {
            size: 12,
            weight: '500'
          },
          padding: 10
        },
        grid: {
          color: 'rgba(194, 157, 94, 0.15)',
          lineWidth: 1
        },
        border: {
          color: 'rgba(194, 157, 94, 0.3)',
          width: 2
        }
      }
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="consultation-analytics">
          <div className="loading-container">
            <div className="loading-spinner">Loading consultation analytics...</div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="consultation-analytics">
        <div className="analytics-header">
          <h1>✂️ Consultation Booking Analytics</h1>
          <p>Comprehensive consultation and appointment insights</p>
          
          <div className="time-range-selector">
            <button 
              className={timeRange === 'weekly' ? 'active' : ''}
              onClick={() => setTimeRange('weekly')}
            >
              Weekly
            </button>
            <button 
              className={timeRange === 'monthly' ? 'active' : ''}
              onClick={() => setTimeRange('monthly')}
            >
              Monthly
            </button>
            <button 
              className={timeRange === 'yearly' ? 'active' : ''}
              onClick={() => setTimeRange('yearly')}
            >
              Yearly
            </button>
          </div>
        </div>

        <div className="analytics-grid">
          {/* Monthly Bookings Trend */}
          <div className="chart-container large">
            <h3>Monthly Booking Trends</h3>
            <div className="chart-wrapper">
              <Bar
                data={{
                  labels: consultationData?.monthlyBookings?.map(item => item.month) || [],
                  datasets: [
                    {
                      label: 'Total Bookings',
                      data: consultationData?.monthlyBookings?.map(item => item.bookings) || [],
                      backgroundColor: 'rgba(217, 119, 6, 0.8)',
                      borderColor: 'rgba(217, 119, 6, 1)',
                      borderWidth: 2,
                      borderRadius: 8,
                      borderSkipped: false,
                    },
                    {
                      label: 'Completed',
                      data: consultationData?.monthlyBookings?.map(item => item.completed) || [],
                      backgroundColor: 'rgba(34, 197, 94, 0.8)',
                      borderColor: 'rgba(34, 197, 94, 1)',
                      borderWidth: 2,
                      borderRadius: 8,
                      borderSkipped: false,
                    },
                    {
                      label: 'Cancelled',
                      data: consultationData?.monthlyBookings?.map(item => item.cancelled) || [],
                      backgroundColor: 'rgba(239, 68, 68, 0.8)',
                      borderColor: 'rgba(239, 68, 68, 1)',
                      borderWidth: 2,
                      borderRadius: 8,
                      borderSkipped: false,
                    }
                  ]
                }}
                options={{
                  ...chartOptions,
                  plugins: {
                    ...chartOptions.plugins,
                    title: {
                      ...chartOptions.plugins.title,
                      text: 'Monthly Consultation Booking Status'
                    }
                  }
                }}
              />
            </div>
          </div>

          {/* Service Types Popularity */}
          <div className="chart-container large">
            <h3>Service Types Popularity</h3>
            <div className="chart-wrapper">
              <Bar
                data={{
                  labels: consultationData?.serviceTypes?.map(item => item.service) || [],
                  datasets: [
                    {
                      label: 'Bookings',
                      data: consultationData?.serviceTypes?.map(item => item.bookings) || [],
                      backgroundColor: [
                        'rgba(217, 119, 6, 0.8)',
                        'rgba(180, 83, 9, 0.8)',
                        'rgba(194, 157, 94, 0.8)',
                        'rgba(139, 105, 20, 0.8)',
                        'rgba(107, 84, 68, 0.8)'
                      ],
                      borderColor: [
                        'rgba(217, 119, 6, 1)',
                        'rgba(180, 83, 9, 1)',
                        'rgba(194, 157, 94, 1)',
                        'rgba(139, 105, 20, 1)',
                        'rgba(107, 84, 68, 1)'
                      ],
                      borderWidth: 2,
                      borderRadius: 8,
                      borderSkipped: false,
                    }
                  ]
                }}
                options={{
                  ...chartOptions,
                  indexAxis: 'y',
                  plugins: {
                    ...chartOptions.plugins,
                    title: {
                      ...chartOptions.plugins.title,
                      text: 'Most Popular Consultation Services'
                    }
                  }
                }}
              />
            </div>
          </div>

          {/* Time Slot Popularity */}
          <div className="chart-container large">
            <h3>Time Slot Preferences</h3>
            <div className="chart-wrapper">
              <Line
                data={{
                  labels: consultationData?.timeSlotPopularity?.map(item => item.slot) || [],
                  datasets: [
                    {
                      label: 'Bookings',
                      data: consultationData?.timeSlotPopularity?.map(item => item.bookings) || [],
                      borderColor: 'rgba(217, 119, 6, 1)',
                      backgroundColor: 'rgba(217, 119, 6, 0.1)',
                      tension: 0.4,
                      fill: true,
                      pointBackgroundColor: 'rgba(217, 119, 6, 1)',
                      pointBorderColor: '#fff',
                      pointBorderWidth: 2,
                      pointRadius: 6
                    }
                  ]
                }}
                options={{
                  ...chartOptions,
                  plugins: {
                    ...chartOptions.plugins,
                    title: {
                      ...chartOptions.plugins.title,
                      text: 'Popular Appointment Time Slots'
                    }
                  }
                }}
              />
            </div>
          </div>

          {/* Weekly Booking Trends */}
          <div className="chart-container large">
            <h3>Weekly Booking Pattern</h3>
            <div className="chart-wrapper">
              <Radar
                data={{
                  labels: consultationData?.weeklyTrends?.map(item => item.day) || [],
                  datasets: [
                    {
                      label: 'Bookings',
                      data: consultationData?.weeklyTrends?.map(item => item.bookings) || [],
                      backgroundColor: 'rgba(217, 119, 6, 0.2)',
                      borderColor: 'rgba(217, 119, 6, 1)',
                      borderWidth: 2,
                      pointBackgroundColor: 'rgba(217, 119, 6, 1)',
                      pointBorderColor: '#fff',
                      pointBorderWidth: 2
                    }
                  ]
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'top',
                      labels: {
                        color: '#4E342E',
                        font: {
                          size: 12,
                          weight: '600'
                        }
                      }
                    },
                    title: {
                      display: true,
                      text: 'Weekly Booking Distribution',
                      color: '#4E342E',
                      font: {
                        size: 16,
                        weight: '700'
                      }
                    }
                  },
                  scales: {
                    r: {
                      beginAtZero: true,
                      ticks: {
                        color: '#6B5D54'
                      },
                      grid: {
                        color: 'rgba(194, 157, 94, 0.3)'
                      },
                      angleLines: {
                        color: 'rgba(194, 157, 94, 0.3)'
                      }
                    }
                  }
                }}
              />
            </div>
          </div>

          {/* Customer Satisfaction */}
          <div className="chart-container medium">
            <h3>Customer Satisfaction</h3>
            <div className="chart-wrapper">
              <Pie
                data={{
                  labels: consultationData?.customerSatisfaction?.map(item => item.rating) || [],
                  datasets: [
                    {
                      data: consultationData?.customerSatisfaction?.map(item => item.count) || [],
                      backgroundColor: [
                        'rgba(34, 197, 94, 0.8)',
                        'rgba(217, 119, 6, 0.8)',
                        'rgba(194, 157, 94, 0.8)',
                        'rgba(239, 68, 68, 0.8)',
                        'rgba(107, 84, 68, 0.8)'
                      ],
                      borderColor: [
                        'rgba(34, 197, 94, 1)',
                        'rgba(217, 119, 6, 1)',
                        'rgba(194, 157, 94, 1)',
                        'rgba(239, 68, 68, 1)',
                        'rgba(107, 84, 68, 1)'
                      ],
                      borderWidth: 2
                    }
                  ]
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'bottom',
                      labels: {
                        color: '#4E342E',
                        font: {
                          size: 12,
                          weight: '600'
                        }
                      }
                    },
                    title: {
                      display: true,
                      text: 'Customer Rating Distribution',
                      color: '#4E342E',
                      font: {
                        size: 16,
                        weight: '700'
                      }
                    }
                  }
                }}
              />
            </div>
          </div>

          {/* Consultant Performance Table */}
          <div className="chart-container medium">
            <h3>Top Performing Consultants</h3>
            <div className="table-wrapper">
              <table className="analytics-table">
                <thead>
                  <tr>
                    <th>Consultant</th>
                    <th>Bookings</th>
                    <th>Rating</th>
                    <th>Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {consultationData?.consultantPerformance?.map((consultant, index) => (
                    <tr key={index}>
                      <td>{consultant.name}</td>
                      <td>{consultant.bookings}</td>
                      <td>
                        <span className="rating">
                          ⭐ {consultant.rating}
                        </span>
                      </td>
                      <td>₹{consultant.revenue.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default ConsultationAnalytics;