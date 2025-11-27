# Deployment Guide

This guide covers deploying the ChimeraMatrix Backend to Vercel.

## Prerequisites

- Vercel account (sign up at https://vercel.com)
- Vercel CLI installed (`npm i -g vercel`)
- Google Gemini API key
- Git repository (GitHub, GitLab, or Bitbucket)

## Step 1: Prepare Your Project

1. **Ensure all environment variables are documented**

Check `.env.example` contains all required variables:
```bash
GEMINI_API_KEY=
GEMINI_MODEL=gemini-1.5-pro
ALLOWED_ORIGINS=
MAX_FILE_SIZE=104857600
ALLOWED_FILE_TYPES=mp4,mov,avi,webm
SESSION_TIMEOUT=3600
```

2. **Verify vercel.json configuration**

```json
{
  "functions": {
    "api/**/*.ts": {
      "maxDuration": 60,
      "memory": 1024
    }
  },
  "env": {
    "NODE_ENV": "production"
  }
}
```

3. **Test locally (optional)**

```bash
# Install Vercel CLI
npm i -g vercel

# Run local development server
vercel dev
```

## Step 2: Deploy to Vercel

### Option A: Deploy via Vercel Dashboard (Recommended)

1. **Connect your Git repository**
   - Go to https://vercel.com/new
   - Import your Git repository
   - Vercel will auto-detect the project settings

2. **Configure build settings**
   - Framework Preset: Other
   - Build Command: `npm run build` (or leave empty)
   - Output Directory: (leave empty for serverless functions)
   - Install Command: `npm install`

3. **Add environment variables**
   - Go to Project Settings → Environment Variables
   - Add each variable from `.env.example`:
     - `GEMINI_API_KEY`: Your Gemini API key
     - `GEMINI_MODEL`: `gemini-1.5-pro`
     - `ALLOWED_ORIGINS`: Your frontend URL (e.g., `https://your-app.vercel.app`)
     - `MAX_FILE_SIZE`: `104857600`
     - `ALLOWED_FILE_TYPES`: `mp4,mov,avi,webm`
     - `SESSION_TIMEOUT`: `3600`

4. **Deploy**
   - Click "Deploy"
   - Wait for deployment to complete
   - Your API will be available at `https://your-project.vercel.app/api/*`

### Option B: Deploy via CLI

1. **Login to Vercel**
```bash
vercel login
```

2. **Deploy**
```bash
# First deployment (will prompt for configuration)
vercel

# Production deployment
vercel --prod
```

3. **Add environment variables**
```bash
vercel env add GEMINI_API_KEY
# Enter your API key when prompted

vercel env add GEMINI_MODEL
# Enter: gemini-1.5-pro

vercel env add ALLOWED_ORIGINS
# Enter your frontend URL

# Repeat for other variables
```

4. **Redeploy with environment variables**
```bash
vercel --prod
```

## Step 3: Verify Deployment

1. **Check deployment status**
   - Go to Vercel Dashboard → Your Project → Deployments
   - Ensure deployment status is "Ready"

2. **Test API endpoints**

```bash
# Test with curl (replace YOUR_DOMAIN)
curl https://YOUR_DOMAIN.vercel.app/api/analyze \
  -X POST \
  -H "Origin: https://your-frontend.vercel.app" \
  -F "video=@test-video.mp4" \
  -F "platform=youtube"
```

3. **Check logs**
   - Go to Vercel Dashboard → Your Project → Logs
   - Monitor for any errors or issues

## Step 4: Configure CORS

1. **Update ALLOWED_ORIGINS**

Add your frontend domain to the ALLOWED_ORIGINS environment variable:

```bash
# Via CLI
vercel env add ALLOWED_ORIGINS production
# Enter: https://your-frontend.vercel.app,https://www.your-domain.com

# Or via Dashboard
# Project Settings → Environment Variables → Edit ALLOWED_ORIGINS
```

2. **Redeploy**
```bash
vercel --prod
```

## Step 5: Upload CSV Data

The `backtest-data.csv` file should be in your repository root. Vercel will automatically include it in the deployment.

**Verify CSV is accessible:**
```bash
# Check deployment includes CSV
vercel ls
```

If CSV is large (>4.5MB), consider:
- Using Vercel Blob Storage
- Using external database (PostgreSQL, MongoDB)
- Compressing the CSV file

## Step 6: Monitor and Optimize

### Set up monitoring

1. **Vercel Analytics**
   - Enable in Project Settings → Analytics
   - Monitor request volume and response times

2. **Error tracking (optional)**
   - Integrate Sentry: https://sentry.io
   - Add Sentry DSN to environment variables

### Optimize performance

1. **Enable caching**
   - CSV data is cached in memory automatically
   - Consider adding Redis for session storage in production

2. **Monitor function execution**
   - Check function logs for slow operations
   - Optimize Gemini API calls if needed

3. **Set up alerts**
   - Configure Vercel notifications for deployment failures
   - Set up uptime monitoring (e.g., UptimeRobot)

## Troubleshooting

### Common Issues

**1. Function timeout (504 Gateway Timeout)**
- Increase `maxDuration` in `vercel.json` (max 60s for Pro plan)
- Optimize Gemini API calls
- Check for infinite loops or blocking operations

**2. CORS errors**
- Verify `ALLOWED_ORIGINS` includes your frontend domain
- Check origin header in request
- Ensure CORS middleware is applied to all endpoints

**3. File upload fails**
- Check `MAX_FILE_SIZE` environment variable
- Verify file format is supported
- Check Vercel function payload limits (4.5MB for Hobby, 50MB for Pro)

**4. Gemini API errors**
- Verify `GEMINI_API_KEY` is set correctly
- Check API quota and rate limits
- Review Gemini API logs

**5. CSV data not found**
- Ensure `backtest-data.csv` is in repository root
- Check file is not in `.gitignore`
- Verify file path in `lib/csv-db.ts`

### Debug mode

Enable detailed logging:

```bash
# Add to environment variables
vercel env add DEBUG production
# Enter: true

# Redeploy
vercel --prod
```

### View function logs

```bash
# Real-time logs
vercel logs --follow

# Recent logs
vercel logs
```

## Production Checklist

Before going to production:

- [ ] All environment variables set
- [ ] CORS configured with production domains
- [ ] CSV data uploaded and accessible
- [ ] API endpoints tested
- [ ] Error monitoring configured
- [ ] Performance monitoring enabled
- [ ] Backup strategy for CSV data
- [ ] Rate limiting configured (if needed)
- [ ] Documentation updated
- [ ] Frontend integration tested

## Scaling Considerations

### Vercel Plans

- **Hobby**: Free, 100GB bandwidth, 100 hours function execution
- **Pro**: $20/month, 1TB bandwidth, 1000 hours function execution
- **Enterprise**: Custom pricing, dedicated support

### When to upgrade

- High traffic (>100k requests/month)
- Need longer function execution (>10s)
- Require larger file uploads (>4.5MB)
- Need team collaboration features

### Alternative scaling strategies

1. **Use external database**
   - Migrate from CSV to PostgreSQL/MongoDB
   - Reduces function memory usage
   - Enables better caching

2. **Implement caching layer**
   - Use Redis for session storage
   - Cache Gemini API responses
   - Reduce API calls

3. **Optimize Gemini API usage**
   - Batch requests when possible
   - Use smaller models for simple tasks
   - Implement request queuing

## Support

- Vercel Documentation: https://vercel.com/docs
- Vercel Support: https://vercel.com/support
- Gemini API Documentation: https://ai.google.dev/docs

## Next Steps

After successful deployment:

1. Integrate with frontend application
2. Set up CI/CD pipeline
3. Configure custom domain (optional)
4. Enable HTTPS (automatic with Vercel)
5. Monitor performance and errors
6. Plan for scaling as traffic grows
