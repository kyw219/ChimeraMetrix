# Current Limitations

## File Size Limit

**Current Limit:** 4.5 MB per video

### Why?

Vercel's free tier has a **4.5 MB request body size limit**. This means videos larger than 4.5MB cannot be uploaded directly to the API.

### Solutions

#### Option 1: Use Smaller Videos (Current Workaround)
- Compress your video to under 4.5MB
- Use shorter video clips for testing
- The app will automatically show mock data for larger files

#### Option 2: Upgrade to Vercel Pro (Paid)
- **Cost:** $20/month
- **Benefit:** 50MB request body limit
- **How:** Go to Vercel Dashboard → Upgrade to Pro

#### Option 3: Implement Cloud Storage (Best Long-term Solution)
We're planning to implement this in the future:
1. Upload videos directly to cloud storage (Vercel Blob, AWS S3, or Cloudflare R2)
2. Send only the video URL to the backend
3. Backend downloads and analyzes the video from the URL
4. **Benefit:** Support videos up to 100MB+

---

## Current Behavior

When you upload a video larger than 4.5MB:
- ✅ The app will show a friendly error message
- ✅ Automatically falls back to mock data for demo purposes
- ✅ Console logs will show the file size issue

---

## Testing with Real API

To test the real backend API:

1. **Find a small video** (< 4.5MB)
2. **Upload it** to the app
3. **Check browser console** (F12) for detailed logs
4. **Watch the magic happen!** ✨

---

## Recommended Test Videos

- Short clips (5-10 seconds)
- Lower resolution (480p or 720p)
- Compressed format (H.264)

Example command to compress a video:
```bash
ffmpeg -i input.mp4 -vcodec h264 -acodec aac -b:v 500k output.mp4
```

---

## Future Roadmap

- [ ] Implement cloud storage integration
- [ ] Support videos up to 100MB
- [ ] Add video compression in the browser before upload
- [ ] Progress bar for large uploads
- [ ] Chunked upload support
