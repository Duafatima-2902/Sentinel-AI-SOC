# Railway Deployment Guide for Sentinel AI SOC

## Quick Deploy to Railway

1. **Connect your GitHub repository to Railway:**
   - Go to [Railway.app](https://railway.app)
   - Sign in with GitHub
   - Click "New Project" → "Deploy from GitHub repo"
   - Select your `Sentinel-Ai-soc` repository

2. **Configure Environment Variables:**
   Railway will automatically detect the configuration from `railway.json` and `.railwayrc`, but you can add custom environment variables in the Railway dashboard:
   - `NODE_ENV=production`
   - `PORT=5000` (Railway sets this automatically)
   - `FRONTEND_URL=https://your-app.railway.app` (replace with your actual Railway URL)

3. **Deploy:**
   - Railway will automatically build and deploy your application
   - The build process runs `npm run build` (builds React client)
   - The start process runs `npm start` (starts the Express server)

## Configuration Files

- `railway.json` - Railway deployment configuration
- `.railwayrc` - Railway runtime settings
- `.env.production` - Production environment variables template

## Build Process

1. **Install Dependencies:** `npm install` (installs server dependencies)
2. **Post-install:** `npm run postinstall` (installs client dependencies)
3. **Build Client:** `npm run build` (builds React app for production)
4. **Start Server:** `npm start` (starts Express server serving the built React app)

## Production Features

- ✅ CORS configured for Railway domains
- ✅ Static file serving for React build
- ✅ Socket.IO with Railway-compatible CORS
- ✅ Error handling middleware
- ✅ Health check endpoint at `/`
- ✅ Automatic restart on failure
- ✅ Production logging

## Environment Variables

Set these in Railway dashboard:

- `NODE_ENV=production`
- `FRONTEND_URL=https://your-app-name.railway.app`
- `RAILWAY_STATIC_URL=https://your-app-name.railway.app` (if using static hosting)

## Troubleshooting

1. **Build fails:** Check that all dependencies are properly installed
2. **CORS errors:** Verify `FRONTEND_URL` matches your Railway domain
3. **Socket.IO issues:** Ensure CORS configuration includes your Railway domain
4. **Static files not serving:** Verify React build completed successfully

## Monitoring

- Railway provides built-in monitoring and logs
- Health check endpoint: `https://your-app.railway.app/`
- API endpoints: `https://your-app.railway.app/api/*`
