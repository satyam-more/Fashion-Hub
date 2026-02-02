# Aiven Connection Troubleshooting

## ❌ Error: `connect ETIMEDOUT`

This error means your local machine cannot reach the Aiven MySQL server. Here's how to fix it:

---

## 🔧 **Solution 1: Whitelist Your IP Address in Aiven**

Aiven requires you to whitelist IP addresses that can connect to your database.

### **Steps:**

1. **Get Your Public IP Address:**
   - Go to: https://whatismyipaddress.com/
   - Copy your IPv4 address (e.g., `203.0.113.45`)

2. **Login to Aiven Console:**
   - Go to: https://console.aiven.io
   - Click on your **fashion-hub-db** service

3. **Add IP to Allowed List:**
   - Click on the **"Overview"** tab
   - Scroll down to **"Allowed IP Addresses"** section
   - Click **"Change"** or **"Add IP address"**
   - Add your IP address: `YOUR_IP/32` (e.g., `203.0.113.45/32`)
   - Or add `0.0.0.0/0` to allow all IPs (⚠️ less secure, only for testing)
   - Click **"Save changes"**

4. **Wait 1-2 minutes** for changes to apply

5. **Restart your backend:**
   ```bash
   npm run dev
   ```

---

## 🔧 **Solution 2: Check Aiven Service Status**

1. Go to Aiven Console: https://console.aiven.io
2. Check if your **fashion-hub-db** service is **RUNNING**
3. If it's **POWERED OFF**, click **"Power on"**
4. Wait for it to start (2-3 minutes)

---

## 🔧 **Solution 3: Verify Connection Details**

Make sure your `.env` file has the correct details:

```env
DB_HOST=fashion-hub-db-fashion-hub.k.aivencloud.com
DB_PORT=27498
DB_USER=avnadmin
DB_PASSWORD=YOUR_AIVEN_PASSWORD_HERE
DB_NAME=defaultdb
```

Get the latest connection details from:
1. Aiven Console → Your Service → **Overview** tab
2. Look for **"Service URI"** or **"Connection information"**

---

## 🔧 **Solution 4: Test Connection Manually**

Try connecting via command line to verify credentials:

```bash
mysql -h fashion-hub-db-fashion-hub.k.aivencloud.com -P 27498 -u avnadmin -p defaultdb
```

Enter your password when prompted.

If this works, the issue is with your Node.js configuration.
If this fails, the issue is with Aiven settings or credentials.

---

## 🔧 **Solution 5: Firewall/Antivirus**

Your firewall or antivirus might be blocking the connection:

1. **Temporarily disable** Windows Firewall
2. **Temporarily disable** antivirus
3. Try connecting again
4. If it works, add an exception for Node.js

---

## 🔧 **Solution 6: Use Local Database for Development**

If you want to develop locally and deploy to Aiven later:

### **Create a `.env.local` file:**

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=root
DB_NAME=fashion_hub
```

### **Switch between environments:**

```bash
# Local development
cp .env.local .env
npm run dev

# Aiven (production)
cp .env.production .env
npm run dev
```

---

## ✅ **Recommended: Whitelist Your IP**

The most common solution is **Solution 1** - whitelisting your IP address in Aiven.

### **Quick Steps:**
1. Get your IP: https://whatismyipaddress.com/
2. Aiven Console → fashion-hub-db → Overview → Allowed IP Addresses
3. Add your IP: `YOUR_IP/32`
4. Save and wait 1-2 minutes
5. Restart backend: `npm run dev`

---

## 📞 **Still Not Working?**

If none of these work:

1. Check Aiven service logs in the console
2. Verify your subscription is active
3. Contact Aiven support
4. Use local MySQL for development

---

## 🎯 **For Deployment (Render)**

When deploying to Render, you'll need to:

1. Get Render's outbound IP addresses
2. Whitelist them in Aiven
3. Or use `0.0.0.0/0` (allows all IPs)

Render's IPs change, so `0.0.0.0/0` is common for cloud deployments.
