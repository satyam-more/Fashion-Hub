const express = require('express');
const router = express.Router();
const mysql = require('mysql2/promise');
const { authenticateToken } = require('../middleware/auth');

// Database connection
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'root',
  database: process.env.DB_NAME || 'fashion_hub'
};

// ============================================
// APPOINTMENT ROUTES
// ============================================

// Book a new appointment
router.post('/appointments', authenticateToken, async (req, res) => {
  let connection;
  try {
    const userId = req.user.userId;
    const {
      fullAddress,
      landmark,
      city,
      pincode,
      buildingFloor,
      serviceTypes,
      appointmentDate,
      timeSlot,
      numberOfItems,
      message,
      paymentMethod,
      transactionId
    } = req.body;

    // Validation
    if (!fullAddress || !city || !pincode || !appointmentDate || !timeSlot) {
      return res.status(400).json({
        success: false,
        error: 'Please fill in all required fields'
      });
    }

    if (!serviceTypes || serviceTypes.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Please select at least one service type'
      });
    }

    connection = await mysql.createConnection(dbConfig);

    // Check if slot exists (regardless of availability)
    const [slotCheck] = await connection.execute(
      `SELECT * FROM appointment_slots 
       WHERE slot_date = ? AND time_slot = ?`,
      [appointmentDate, timeSlot]
    );

    if (slotCheck.length === 0) {
      // Create new slot
      await connection.execute(
        `INSERT INTO appointment_slots (slot_date, time_slot, booked_count, is_available)
         VALUES (?, ?, 1, TRUE)`,
        [appointmentDate, timeSlot]
      );
    } else {
      // Slot exists - check capacity
      const slot = slotCheck[0];
      if (slot.booked_count >= slot.max_capacity) {
        return res.status(400).json({
          success: false,
          error: 'This time slot is fully booked. Please select another slot.'
        });
      }

      // Update booked count
      await connection.execute(
        `UPDATE appointment_slots 
         SET booked_count = booked_count + 1,
             is_available = CASE WHEN booked_count + 1 >= max_capacity THEN FALSE ELSE TRUE END
         WHERE slot_date = ? AND time_slot = ?`,
        [appointmentDate, timeSlot]
      );
    }

    // Determine status based on payment method
    const appointmentStatus = paymentMethod === 'cash' ? 'confirmed' : 'pending';
    const paymentStatus = paymentMethod === 'cash' ? 'pending' : 'pending';

    // Create appointment
    const [result] = await connection.execute(
      `INSERT INTO custom_appointments 
       (user_id, appointment_date, time_slot, service_types, number_of_items,
        full_address, landmark, city, pincode, building_floor, message,
        consultation_fee, status, payment_status, payment_method, transaction_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 250.00, ?, ?, ?, ?)`,
      [
        userId,
        appointmentDate,
        timeSlot,
        JSON.stringify(serviceTypes),
        numberOfItems,
        fullAddress,
        landmark || null,
        city,
        pincode,
        buildingFloor,
        message || null,
        appointmentStatus,
        paymentStatus,
        paymentMethod || null,
        transactionId || null
      ]
    );

    const appointmentId = result.insertId;

    // Send email based on payment method
    try {
      const [userResult] = await connection.execute(
        'SELECT username, email FROM users WHERE id = ?',
        [userId]
      );
      
      if (userResult.length > 0 && userResult[0].email) {
        const emailService = require('../services/emailService');
        const fs = require('fs');
        const path = require('path');
        
        const servicesHtml = serviceTypes.map(s => `<span class="service-tag">${s}</span>`).join('');
        const formattedDate = new Date(appointmentDate).toLocaleDateString('en-IN', {
          weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
        });

        if (paymentMethod === 'cash') {
          // COD - Send confirmation email
          let emailTemplate = fs.readFileSync(
            path.join(__dirname, '../templates/emails/appointment-confirmation.html'),
            'utf8'
          );

          emailTemplate = emailTemplate
            .replace('{{customerName}}', userResult[0].username)
            .replace('{{appointmentId}}', appointmentId)
            .replace('{{appointmentDate}}', formattedDate)
            .replace('{{timeSlot}}', timeSlot)
            .replace('{{consultationFee}}', '250')
            .replace('{{servicesList}}', servicesHtml)
            .replace('{{numberOfItems}}', numberOfItems)
            .replace('{{fullAddress}}', fullAddress)
            .replace('{{landmark}}', landmark || '')
            .replace('{{city}}', city)
            .replace('{{pincode}}', pincode)
            .replace('{{buildingFloor}}', buildingFloor)
            .replace('{{confirmationLink}}', `http://localhost:5173/appointment-confirmation/${appointmentId}`);

          await emailService.transporter.sendMail({
            from: `"Fashion Hub" <${process.env.EMAIL_USER}>`,
            to: userResult[0].email,
            subject: '✓ Appointment Confirmed - Fashion Hub Custom Tailoring',
            html: emailTemplate
          });
        } else {
          // Online payment - Send request/pending email
          let emailTemplate = fs.readFileSync(
            path.join(__dirname, '../templates/emails/appointment-request.html'),
            'utf8'
          );

          emailTemplate = emailTemplate
            .replace('{{customerName}}', userResult[0].username)
            .replace('{{appointmentId}}', appointmentId)
            .replace('{{appointmentDate}}', formattedDate)
            .replace('{{timeSlot}}', timeSlot)
            .replace('{{consultationFee}}', '250')
            .replace('{{servicesList}}', servicesHtml)
            .replace('{{numberOfItems}}', numberOfItems)
            .replace('{{fullAddress}}', fullAddress)
            .replace('{{landmark}}', landmark || '')
            .replace('{{city}}', city)
            .replace('{{pincode}}', pincode)
            .replace('{{buildingFloor}}', buildingFloor);

          await emailService.transporter.sendMail({
            from: `"Fashion Hub" <${process.env.EMAIL_USER}>`,
            to: userResult[0].email,
            subject: '⏳ Payment Verification Pending - Fashion Hub Custom Tailoring',
            html: emailTemplate
          });
        }
      }
    } catch (emailError) {
      console.error('Email send error:', emailError);
      // Don't fail the appointment if email fails
    }

    res.status(201).json({
      success: true,
      message: 'Appointment booked successfully',
      data: {
        appointment_id: appointmentId,
        consultation_fee: 250.00,
        payment_required: true
      }
    });

  } catch (error) {
    console.error('Book appointment error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to book appointment'
    });
  } finally {
    if (connection) await connection.end();
  }
});

// Get user's appointments
router.get('/appointments', authenticateToken, async (req, res) => {
  let connection;
  try {
    const userId = req.user.userId;
    connection = await mysql.createConnection(dbConfig);

    const [appointments] = await connection.execute(
      `SELECT * FROM custom_appointments 
       WHERE user_id = ? 
       ORDER BY appointment_date DESC, created_at DESC`,
      [userId]
    );

    // Parse JSON fields safely
    const formattedAppointments = appointments.map(apt => {
      let serviceTypes = [];
      try {
        const serviceTypesData = apt.service_types;
        if (typeof serviceTypesData === 'string') {
          serviceTypes = JSON.parse(serviceTypesData);
        } else if (Array.isArray(serviceTypesData)) {
          serviceTypes = serviceTypesData;
        } else if (serviceTypesData) {
          serviceTypes = Object.values(serviceTypesData);
        }
      } catch (parseError) {
        console.error('Error parsing service_types for appointment:', apt.appointment_id);
        const raw = apt.service_types;
        if (typeof raw === 'string' && raw.includes(',')) {
          serviceTypes = raw.split(',').map(s => s.trim());
        } else {
          serviceTypes = [];
        }
      }

      return {
        ...apt,
        service_types: serviceTypes
      };
    });

    res.json({
      success: true,
      data: formattedAppointments
    });

  } catch (error) {
    console.error('Get appointments error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch appointments'
    });
  } finally {
    if (connection) await connection.end();
  }
});

// Get appointment by ID
router.get('/appointments/:id', authenticateToken, async (req, res) => {
  let connection;
  try {
    const userId = req.user.userId;
    const { id } = req.params;
    connection = await mysql.createConnection(dbConfig);

    const [appointments] = await connection.execute(
      `SELECT * FROM custom_appointments 
       WHERE appointment_id = ? AND user_id = ?`,
      [id, userId]
    );

    if (appointments.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Appointment not found'
      });
    }

    // Parse service_types safely
    let serviceTypes = [];
    try {
      const serviceTypesData = appointments[0].service_types;
      if (typeof serviceTypesData === 'string') {
        serviceTypes = JSON.parse(serviceTypesData);
      } else if (Array.isArray(serviceTypesData)) {
        serviceTypes = serviceTypesData;
      } else if (serviceTypesData) {
        // If it's an object, try to extract array
        serviceTypes = Object.values(serviceTypesData);
      }
    } catch (parseError) {
      console.error('Error parsing service_types:', parseError);
      console.error('Raw service_types:', appointments[0].service_types);
      // Fallback: try to split by comma if it's a comma-separated string
      const raw = appointments[0].service_types;
      if (typeof raw === 'string' && raw.includes(',')) {
        serviceTypes = raw.split(',').map(s => s.trim());
      } else {
        serviceTypes = [];
      }
    }

    const appointment = {
      ...appointments[0],
      service_types: serviceTypes
    };

    res.json({
      success: true,
      data: appointment
    });

  } catch (error) {
    console.error('Get appointment error:', error);
    console.error('Error details:', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch appointment',
      details: error.message
    });
  } finally {
    if (connection) await connection.end();
  }
});

// Update payment method
router.patch('/appointments/:id/payment-method', authenticateToken, async (req, res) => {
  let connection;
  try {
    const userId = req.user.userId;
    const { id } = req.params;
    const { paymentMethod } = req.body;

    if (!paymentMethod) {
      return res.status(400).json({
        success: false,
        error: 'Payment method is required'
      });
    }

    connection = await mysql.createConnection(dbConfig);

    // Check if appointment exists and belongs to user
    const [appointments] = await connection.execute(
      `SELECT * FROM custom_appointments 
       WHERE appointment_id = ? AND user_id = ?`,
      [id, userId]
    );

    if (appointments.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Appointment not found'
      });
    }

    // Update payment method
    await connection.execute(
      `UPDATE custom_appointments 
       SET payment_method = ? 
       WHERE appointment_id = ?`,
      [paymentMethod, id]
    );

    res.json({
      success: true,
      message: 'Payment method updated successfully'
    });

  } catch (error) {
    console.error('Update payment method error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update payment method'
    });
  } finally {
    if (connection) await connection.end();
  }
});

// Approve/Confirm appointment (Admin only)
router.patch('/appointments/:id/approve', authenticateToken, async (req, res) => {
  let connection;
  try {
    const { id } = req.params;
    connection = await mysql.createConnection(dbConfig);

    // Get appointment details
    const [appointments] = await connection.execute(
      `SELECT ca.*, u.username, u.email 
       FROM custom_appointments ca
       JOIN users u ON ca.user_id = u.id
       WHERE ca.appointment_id = ?`,
      [id]
    );

    if (appointments.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Appointment not found'
      });
    }

    const appointment = appointments[0];

    // Update appointment status to confirmed
    await connection.execute(
      `UPDATE custom_appointments 
       SET status = 'confirmed' 
       WHERE appointment_id = ?`,
      [id]
    );

    // Send confirmation email
    try {
      if (appointment.email) {
        const emailService = require('../services/emailService');
        const fs = require('fs');
        const path = require('path');
        
        let emailTemplate = fs.readFileSync(
          path.join(__dirname, '../templates/emails/appointment-confirmation.html'),
          'utf8'
        );

        // Parse service types
        let serviceTypes = [];
        try {
          const serviceTypesData = appointment.service_types;
          if (typeof serviceTypesData === 'string') {
            serviceTypes = JSON.parse(serviceTypesData);
          } else if (Array.isArray(serviceTypesData)) {
            serviceTypes = serviceTypesData;
          } else if (serviceTypesData) {
            serviceTypes = Object.values(serviceTypesData);
          }
        } catch (parseError) {
          serviceTypes = [];
        }

        const servicesHtml = serviceTypes.map(s => `<span class="service-tag">${s}</span>`).join('');
        
        emailTemplate = emailTemplate
          .replace('{{customerName}}', appointment.username)
          .replace('{{appointmentId}}', appointment.appointment_id)
          .replace('{{appointmentDate}}', new Date(appointment.appointment_date).toLocaleDateString('en-IN', {
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
          }))
          .replace('{{timeSlot}}', appointment.time_slot)
          .replace('{{consultationFee}}', '250')
          .replace('{{servicesList}}', servicesHtml)
          .replace('{{numberOfItems}}', appointment.number_of_items)
          .replace('{{fullAddress}}', appointment.full_address)
          .replace('{{landmark}}', appointment.landmark || '')
          .replace('{{city}}', appointment.city)
          .replace('{{pincode}}', appointment.pincode)
          .replace('{{buildingFloor}}', appointment.building_floor)
          .replace('{{confirmationLink}}', `http://localhost:5173/appointment-confirmation/${appointment.appointment_id}`);

        await emailService.transporter.sendMail({
          from: `"Fashion Hub" <${process.env.EMAIL_USER}>`,
          to: appointment.email,
          subject: '✓ Appointment Confirmed - Fashion Hub Custom Tailoring',
          html: emailTemplate
        });
      }
    } catch (emailError) {
      console.error('Confirmation email send error:', emailError);
    }

    res.json({
      success: true,
      message: 'Appointment approved and confirmation email sent'
    });

  } catch (error) {
    console.error('Approve appointment error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to approve appointment'
    });
  } finally {
    if (connection) await connection.end();
  }
});

// Cancel appointment
router.patch('/appointments/:id/cancel', authenticateToken, async (req, res) => {
  let connection;
  try {
    const { id } = req.params;
    connection = await mysql.createConnection(dbConfig);

    // Get appointment with user details
    const [appointments] = await connection.execute(
      `SELECT ca.*, u.username, u.email 
       FROM custom_appointments ca
       JOIN users u ON ca.user_id = u.id
       WHERE ca.appointment_id = ?`,
      [id]
    );

    if (appointments.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Appointment not found'
      });
    }

    const appointment = appointments[0];

    if (appointment.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        error: 'Appointment is already cancelled'
      });
    }

    // Update appointment status
    await connection.execute(
      `UPDATE custom_appointments 
       SET status = 'cancelled' 
       WHERE appointment_id = ?`,
      [id]
    );

    // Free up the slot
    await connection.execute(
      `UPDATE appointment_slots 
       SET booked_count = booked_count - 1,
           is_available = TRUE
       WHERE slot_date = ? AND time_slot = ?`,
      [appointment.appointment_date, appointment.time_slot]
    );

    // Send rejection email
    try {
      if (appointment.email) {
        const emailService = require('../services/emailService');
        
        const emailContent = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #ef4444, #dc2626); color: white; padding: 30px; text-align: center;">
              <h1>Appointment Cancelled</h1>
            </div>
            <div style="padding: 30px; background: #fff;">
              <p>Dear ${appointment.username},</p>
              <p>We regret to inform you that your custom tailoring appointment has been cancelled.</p>
              
              <div style="background: #fee2e2; border-left: 4px solid #ef4444; padding: 15px; margin: 20px 0;">
                <p style="margin: 0;"><strong>Appointment ID:</strong> #${appointment.appointment_id}</p>
                <p style="margin: 5px 0;"><strong>Date:</strong> ${new Date(appointment.appointment_date).toLocaleDateString('en-IN', {
                  weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
                })}</p>
                <p style="margin: 5px 0;"><strong>Time:</strong> ${appointment.time_slot}</p>
              </div>

              <p>If you have any questions or would like to reschedule, please contact us:</p>
              <p>📞 Phone: +91 1234567890<br>
              📧 Email: support@fashionhub.com</p>

              <p>We apologize for any inconvenience caused.</p>
              
              <p>Best regards,<br>Fashion Hub Team</p>
            </div>
          </div>
        `;

        await emailService.transporter.sendMail({
          from: `"Fashion Hub" <${process.env.EMAIL_USER}>`,
          to: appointment.email,
          subject: '❌ Appointment Cancelled - Fashion Hub',
          html: emailContent
        });
      }
    } catch (emailError) {
      console.error('Rejection email send error:', emailError);
      // Don't fail the cancellation if email fails
    }

    res.json({
      success: true,
      message: 'Appointment cancelled and notification email sent'
    });

  } catch (error) {
    console.error('Cancel appointment error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to cancel appointment'
    });
  } finally {
    if (connection) await connection.end();
  }
});

// Get available slots for a date
router.get('/available-slots/:date', async (req, res) => {
  let connection;
  try {
    const { date } = req.params;
    connection = await mysql.createConnection(dbConfig);

    const timeSlots = [
      '11:00 AM To 1:00 PM',
      '1:00 PM To 3:00 PM',
      '3:00 PM To 5:00 PM',
      '5:00 PM To 7:00 PM',
      'Full-Day available'
    ];

    const [existingSlots] = await connection.execute(
      `SELECT time_slot, booked_count, max_capacity, is_available 
       FROM appointment_slots 
       WHERE slot_date = ?`,
      [date]
    );

    const availableSlots = timeSlots.map(slot => {
      const existing = existingSlots.find(s => s.time_slot === slot);
      if (existing) {
        return {
          time_slot: slot,
          available: existing.is_available,
          booked: existing.booked_count,
          capacity: existing.max_capacity
        };
      }
      return {
        time_slot: slot,
        available: true,
        booked: 0,
        capacity: 4
      };
    });

    res.json({
      success: true,
      data: availableSlots
    });

  } catch (error) {
    console.error('Get available slots error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch available slots'
    });
  } finally {
    if (connection) await connection.end();
  }
});

// ============================================
// ADMIN ROUTES
// ============================================

// Get all appointments (Admin only)
router.get('/admin/appointments', authenticateToken, async (req, res) => {
  let connection;
  try {
    // TODO: Add admin role check here
    connection = await mysql.createConnection(dbConfig);

    const [appointments] = await connection.execute(
      `SELECT ca.*, u.username as customer_name, u.email as customer_email
       FROM custom_appointments ca
       JOIN users u ON ca.user_id = u.id
       ORDER BY ca.created_at DESC`
    );

    // Parse JSON fields safely
    const formattedAppointments = appointments.map(apt => {
      let serviceTypes = [];
      try {
        const serviceTypesData = apt.service_types;
        if (typeof serviceTypesData === 'string') {
          serviceTypes = JSON.parse(serviceTypesData);
        } else if (Array.isArray(serviceTypesData)) {
          serviceTypes = serviceTypesData;
        } else if (serviceTypesData) {
          serviceTypes = Object.values(serviceTypesData);
        }
      } catch (parseError) {
        console.error('Error parsing service_types for appointment:', apt.appointment_id);
        serviceTypes = [];
      }

      return {
        ...apt,
        service_types: serviceTypes
      };
    });

    res.json({
      success: true,
      data: formattedAppointments
    });

  } catch (error) {
    console.error('Get all appointments error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch appointments'
    });
  } finally {
    if (connection) await connection.end();
  }
});

module.exports = router;
