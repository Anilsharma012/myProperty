# Deployment Configuration Guide

This guide explains how to deploy your application to platforms like Railway, Vercel, or any other hosting service using the `VITE_BASE_URL` environment variable.

## Environment Variables Setup

### For Railway Deployment

1. **Set Environment Variable in Railway:**

   ```
   VITE_BASE_URL=https://yourapp.railway.app
   ```

2. **Or create `.env.production` file:**
   ```env
   VITE_BASE_URL=https://yourapp.railway.app
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret_key
   NODE_ENV=production
   ```

### For Vercel Deployment

1. **Set Environment Variable in Vercel Dashboard:**
   ```
   VITE_BASE_URL=https://yourapp.vercel.app
   ```

### For Other Hosting Platforms

Replace with your actual deployed URL:

```
VITE_BASE_URL=https://your-domain.com
```

## How It Works

The application now automatically detects the environment and uses the appropriate base URL:

1. **Development (localhost)**: Uses relative URLs (`/api/...`)
2. **Production with VITE_BASE_URL**: Uses full URLs (`https://yourapp.railway.app/api/...`)
3. **Production without VITE_BASE_URL**: Auto-detects current domain

## Updated Files

The following pages have been updated to use `VITE_BASE_URL`:

### Core Pages:

- ✅ `PostProperty.tsx` - Property posting with image uploads
- ✅ `Properties.tsx` - Property listings
- ✅ `PropertyDetail.tsx` - Individual property views
- ✅ `Categories.tsx` - Category listings
- ✅ `CategoryProperties.tsx` - Category-specific properties

### Authentication Pages:

- ✅ `Login.tsx` - User login/registration
- ✅ `SimpleLogin.tsx` - Simplified login
- ✅ `UserLogin.tsx` - User-specific login
- ✅ `StaffLogin.tsx` - Staff authentication
- ✅ `ComprehensiveAuth.tsx` - Complete auth flow

### Admin & Dashboards:

- ✅ `Admin.tsx` - Admin dashboard
- ✅ `EnhancedAdminDashboard.tsx` - Enhanced admin features
- ✅ `BuyerDashboard.tsx` - Buyer dashboard
- ✅ `EnhancedSellerDashboard.tsx` - Uses centralized API client ✨
- ✅ `AgentDashboard.tsx` - Uses centralized API client ✨

### Communication:

- ✅ `Chat.tsx` - Real-time messaging

### Content Pages:

- ✅ `DynamicPage.tsx` - Dynamic content pages
- ✅ `ContentPage.tsx` - Static content pages

### Testing & Utilities:

- ✅ `FooterTest.tsx` - Footer API testing

## API Utility Functions

### New Utility: `createApiUrl()`

```typescript
import { createApiUrl } from "@/lib/api-utils";

// Old way (localhost only):
fetch("/api/properties");

// New way (works everywhere):
fetch(createApiUrl("/api/properties"));
```

### Available Utilities:

```typescript
import {
  createApiUrl,
  apiFetch,
  apiGet,
  apiPost,
  apiPut,
  apiDelete,
} from "@/lib/api-utils";

// Create URL
const url = createApiUrl("/api/properties");

// Direct fetch with auto URL handling
const response = await apiFetch("/api/properties");

// HTTP method shortcuts
const data = await apiGet("/api/properties");
await apiPost("/api/properties", propertyData);
await apiPut("/api/properties/123", updateData);
await apiDelete("/api/properties/123");
```

## Deployment Steps

### Railway Deployment:

1. **Push your code to GitHub**

2. **Connect to Railway:**

   - Go to [Railway](https://railway.app)
   - Connect your GitHub repository
   - Deploy the project

3. **Set Environment Variables:**

   ```
   VITE_BASE_URL=https://yourapp.railway.app
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret_key
   NODE_ENV=production
   ```

4. **Build and Deploy:**
   Railway will automatically build and deploy your application.

### Manual Verification:

After deployment, verify that:

- ✅ All API calls use the correct base URL
- ✅ Authentication works properly
- ✅ Property uploads and retrievals work
- ✅ Chat functionality operates correctly
- ✅ Admin dashboard loads properly

## Troubleshooting

### Common Issues:

1. **CORS Errors:**

   - Ensure your backend allows requests from your deployed domain
   - Check server CORS configuration

2. **API Calls Failing:**

   - Verify `VITE_BASE_URL` is set correctly
   - Check browser network tab for actual URLs being called
   - Ensure trailing slashes match between frontend and backend

3. **Environment Variables Not Loading:**
   - Verify environment variables are set in hosting platform
   - Restart the deployment after setting variables
   - Check variable names match exactly (case-sensitive)

### Debug Tips:

```javascript
// Check current API configuration
console.log("VITE_BASE_URL:", import.meta.env.VITE_BASE_URL);
console.log("Current URL:", window.location.href);

// Test API URL generation
import { createApiUrl } from "@/lib/api-utils";
console.log("Generated API URL:", createApiUrl("/api/properties"));
```

## Backward Compatibility

The application maintains backward compatibility:

- ✅ Works without `VITE_BASE_URL` set (auto-detects environment)
- ✅ Supports legacy `VITE_API_BASE_URL` variable
- ✅ Falls back to relative URLs for development

## Next Steps

After deployment:

1. Test all major features on the live site
2. Monitor server logs for any API errors
3. Set up monitoring for API performance
4. Configure SSL certificate if not automatically provided
5. Set up custom domain if needed

---

**Note:** Always test your deployment thoroughly before making it live to users!
