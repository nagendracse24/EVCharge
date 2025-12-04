# 🔑 Google Places API Setup - Step by Step

## 📋 What You'll Get:
- ✅ 1000+ real charging stations
- ✅ Complete address data
- ✅ Phone numbers, ratings, reviews
- ✅ Photos and business hours
- ✅ FREE tier: 40,000 requests/month

---

## 🚀 Step 1: Create Google Cloud Account (5 minutes)

### 1.1 Go to Google Cloud Console:
👉 **https://console.cloud.google.com**

### 1.2 Sign in:
- Use your existing Google account
- OR create a new one

### 1.3 Accept Terms:
- Click "Agree and Continue"
- Complete any verification steps

---

## 🚀 Step 2: Create a New Project (2 minutes)

### 2.1 Click the Project Dropdown:
- Top left corner, next to "Google Cloud"
- Click "Select a project"

### 2.2 Create New Project:
- Click "NEW PROJECT" button (top right)
- **Project name:** `EVCharge India`
- **Organization:** Leave as "No organization"
- Click "CREATE"

### 2.3 Wait for Creation:
- Takes ~30 seconds
- You'll see a notification when ready

### 2.4 Select Your Project:
- Click the project dropdown again
- Select "EVCharge India"

---

## 🚀 Step 3: Enable Places API (3 minutes)

### 3.1 Open API Library:
- Left sidebar → Click "APIs & Services"
- Click "Library"

### 3.2 Search for Places API:
- In the search box, type: **"Places API"**
- Click on "**Places API**" (the main one, not "New")

### 3.3 Enable the API:
- Click the blue "ENABLE" button
- Wait 10-20 seconds for it to activate

### 3.4 Verify:
- You should see "API enabled" message
- Click "Credentials" in the left sidebar

---

## 🚀 Step 4: Create API Key (3 minutes)

### 4.1 Create Credentials:
- Click "+ CREATE CREDENTIALS" button (top)
- Select "API key"

### 4.2 Copy Your API Key:
```
AIzaSyDh... (a long string)
```
- **IMPORTANT:** Copy this entire key!
- Click "CLOSE" (or "RESTRICT KEY" - we'll do that next)

---

## 🚀 Step 5: Restrict API Key (IMPORTANT for Security)

### 5.1 Click "Edit API key" (pencil icon):
- Or click on your newly created key name

### 5.2 Set API Restrictions:
- Scroll to "API restrictions"
- Select "Restrict key"
- Click "Select APIs" dropdown
- Check ✅ **"Places API"**
- Click "OK"

### 5.3 Set Application Restrictions (Optional):
- For now, leave as "None"
- Later, you can restrict by IP address

### 5.4 Save:
- Click "SAVE" button at bottom
- Wait for confirmation

---

## 🚀 Step 6: Add API Key to Your Project (2 minutes)

### 6.1 Open Your Project Folder:
```powershell
cd C:\Users\nagesing\OneDrive - Cisco\Desktop\EVTRANSIT
```

### 6.2 Open Backend .env File:
```powershell
code apps\backend\.env
```
OR open manually in any text editor

### 6.3 Add This Line:
```
GOOGLE_PLACES_API_KEY=AIzaSyDh_PASTE_YOUR_KEY_HERE
```
**Replace `AIzaSyDh_PASTE_YOUR_KEY_HERE` with YOUR actual key!**

### 6.4 Save the File:
- Press `Ctrl + S`
- Close the editor

---

## 🚀 Step 7: Restart Backend Server (1 minute)

### 7.1 Stop Backend:
- Go to terminal running backend
- Press `Ctrl + C`

### 7.2 Start Backend Again:
```powershell
cd apps/backend
npm run dev
```

### 7.3 Wait for Success Message:
```
🚀 Backend server running on http://localhost:3001
```

---

## 🚀 Step 8: Import Station Data! (5 minutes)

### 8.1 Run Import Command:
```powershell
Invoke-WebRequest -Uri "http://localhost:3001/api/admin/sync/google_places" -Method POST -ContentType "application/json" -Body "{}"
```

### 8.2 Watch Backend Terminal:
You should see:
```
⏩ Fetching from Google Places...
📍 Fetching Bangalore...
📥 Bangalore returned 50 stations
📍 Fetching Delhi...
📥 Delhi returned 48 stations
...
✅ Fetched 245 stations from Google Places
🔄 Syncing Google Places...
📥 Fetched 245 stations from Google Places
✅ Google Places sync complete in 15.23s: 245 new, 0 updated, 0 errors
```

### 8.3 Expected Result:
```json
{
  "data": {
    "source_id": "google_places",
    "inserted": 245,
    "updated": 0,
    "errors": 0
  }
}
```

**🎉 Success! You now have 245+ real stations!**

---

## 🚀 Step 9: Verify Data (1 minute)

### 9.1 Check Database Stats:
```powershell
Invoke-WebRequest -Uri "http://localhost:3001/api/admin/stats" -Method GET | Select-Object -ExpandProperty Content
```

### Expected Output:
```json
{
  "data": {
    "total_stations": 255,  // Was 10, now 255!
    "total_connectors": 450,
    "stations_by_source": {
      "seed": 10,
      "google_places": 245
    }
  }
}
```

### 9.2 Refresh Your Frontend:
```
http://localhost:3000
```

**You should now see MANY more stations on the map!** 🗺️

---

## 🎯 Troubleshooting:

### ❌ Error: "API key not valid"
**Solution:** 
- Make sure you copied the ENTIRE key
- Check for extra spaces in `.env` file
- Verify API is enabled in Google Cloud Console

### ❌ Error: "API not enabled"
**Solution:**
- Go back to Google Cloud Console
- Library → Search "Places API"
- Make sure it says "API enabled"

### ❌ Error: "Quota exceeded"
**Solution:**
- Free tier: 40,000 requests/month
- You might have hit the limit
- Check quota in Google Cloud Console

### ❌ Sync returns 0 stations
**Solution:**
1. Check backend logs for errors
2. Verify API key is correct
3. Make sure backend restarted after adding key
4. Check if Google Places API is enabled

---

## 💰 Cost Information:

### Free Tier:
- ✅ First 40,000 requests/month: **FREE**
- ✅ Our import: ~5-10 requests
- ✅ You can import 4000+ times per month!

### After Free Tier:
- $0.032 per request (very cheap)
- You'll get a notification before charges

### Enable Billing (Required):
Even for free tier, you need to:
1. Add a credit card to Google Cloud
2. Don't worry - it won't charge unless you exceed limits
3. You can set budget alerts

---

## 📊 What Data You'll Get:

For each station:
```json
{
  "name": "Shell Recharge - MG Road",
  "address": "123 MG Road, Bangalore",
  "latitude": 12.9716,
  "longitude": 77.5946,
  "phone": "+91 80 1234 5678",
  "rating": 4.5,
  "total_ratings": 234,
  "business_hours": {...},
  "photos": [...],
  "place_id": "ChIJ..."
}
```

---

## 🎉 Success Checklist:

- [ ] Created Google Cloud account
- [ ] Created project "EVCharge India"
- [ ] Enabled Places API
- [ ] Created and copied API key
- [ ] Restricted API key (security)
- [ ] Added key to `apps/backend/.env`
- [ ] Restarted backend server
- [ ] Ran import command
- [ ] Verified 245+ stations imported
- [ ] Refreshed frontend to see new stations

---

## 📞 Need Help?

If you get stuck at any step:
1. Screenshot the error
2. Check which step you're on
3. Tell me the exact error message
4. I'll help you fix it!

---

**Let's start! Tell me when you're ready to begin or if you have any questions!** 🚀

