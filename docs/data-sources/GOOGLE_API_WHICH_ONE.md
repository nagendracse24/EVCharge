# 🔍 Which Google Places API to Enable?

## ✅ USE THIS ONE:

### **"Places API"** (the original one)

**How to identify it:**
- Name: **"Places API"** (no "New" in the name)
- Description: "Google Places API Web Service"
- Icon: Red pin/marker icon
- This is the STABLE, widely-used API

---

## ❌ DON'T USE THIS ONE (Yet):

### **"Places API (New)"**

**Why not:**
- Still in preview/beta
- Different pricing structure
- Different endpoints
- Our code is written for the original API

---

## 📋 Step-by-Step to Find the Right One:

### 1. Go to API Library:
```
Google Cloud Console → APIs & Services → Library
```

### 2. Search:
```
Type: "places"
```

### 3. Look for These Indicators:

#### ✅ CORRECT ONE:
```
Name: Places API
Description: "Nearby Search, Text Search, Details..."
Icon: Red marker/pin
Status: Generally Available (GA)
```

#### ❌ WRONG ONE:
```
Name: Places API (New)
Description: "Next generation Places API..."
Icon: Blue/different icon
Status: Preview or Beta
Badge: "NEW" or "PREVIEW"
```

---

## 🎯 Visual Guide:

When you see the search results, you'll see 2-3 options:

```
1. Places API                    ← ✅ ENABLE THIS ONE!
   (Red pin icon)
   "Google Places API Web Service"

2. Places API (New)              ← ❌ Skip this
   (Different icon)
   "Next generation..."
   [PREVIEW badge]

3. Nearby Places API             ← ❌ Skip this too
   (Part of the new API)
```

---

## 🔧 What to Do:

### Step 1: Click on "Places API" (without "New")
```
The one that says:
"Information about millions of places..."
```

### Step 2: Click "ENABLE"
```
Big blue button at top
```

### Step 3: Verify
```
After enabling, you should see:
"API enabled ✓"
```

---

## 💡 Why We Use the Original API:

1. **More stable** - Battle-tested for years
2. **Better documentation** - More examples and guides
3. **Our code is ready** - Already written for this API
4. **Predictable pricing** - Known cost structure
5. **Wide support** - Most tutorials use this

---

## 🆘 Still Confused?

### Quick Check:
After you click on an API, check the URL in your browser:

#### ✅ CORRECT:
```
https://console.cloud.google.com/apis/library/places-backend.googleapis.com
```

#### ❌ WRONG:
```
https://console.cloud.google.com/apis/library/places.googleapis.com
(Notice: no "backend" in the URL)
```

---

## 📸 What You Should See:

After enabling the correct "Places API", you should see:

```
✓ API enabled

Places API
Google Places API Web Service

[Credentials] [Quotas] [Metrics]

Details:
Retrieve information about places...
- Place Search
- Place Details
- Place Photos
- Place Autocomplete
```

---

## ✅ Quick Verification:

Once enabled, go to:
```
APIs & Services → Enabled APIs
```

You should see:
```
✓ Places API (enabled)
```

**NOT:**
```
❌ Places API (New) - Don't see this? Good!
```

---

## 🚀 After Enabling:

1. Create your API key
2. Restrict it to "Places API" (the one you just enabled)
3. Add to your `.env` file
4. Import stations!

---

**Just remember: Original "Places API" = ✅ | "Places API (New)" = ❌**

**Choose the one WITHOUT "New" in the name!** 🎯

