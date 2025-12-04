# Banana API Integration for Thumbnail Generation

## Overview
ChimeraMatrix now uses Banana API to generate high-quality YouTube thumbnails based on AI-analyzed video content.

## Setup Instructions

### 1. Get Banana API Key
1. Visit [Banana.dev](https://www.banana.dev/)
2. Sign up for an account
3. Navigate to your dashboard
4. Create a new project or use an existing one
5. Copy your API key

### 2. Configure Environment Variables

Add to your `.env` file (or Vercel environment variables):

```bash
BANANA_API_KEY=your_banana_api_key_here
```

### 3. How It Works

#### Flow:
```
User uploads video
    ↓
Gemini analyzes video → Generates structured thumbnail description
    ↓
Banana API receives description → Generates actual thumbnail image
    ↓
Frontend displays generated thumbnail
```

#### Gemini Output Structure:
```json
{
  "thumbnailDescription": {
    "main_subject": "Person pointing at screen with excited expression",
    "extracted_objects": ["laptop", "smartphone", "charts"],
    "background_style": "tech-modern with purple-blue gradient",
    "composition": {
      "subject_position": "right",
      "text_position": "left",
      "object_positioning": "laptop floating on left side"
    },
    "lighting_effects": "rim light, dramatic shadows, neon glow",
    "emotion_mood": "excited, energetic",
    "text_overlay": {
      "title": "GAME CHANGER",
      "subtitle": "You Won't Believe This",
      "font_style": "bold, high contrast"
    },
    "color_palette": {
      "primary": "#5B2CFF",
      "secondary": "#00D9FF",
      "accent": "#FFFFFF"
    }
  }
}
```

#### Banana Prompt Generation:
The system automatically converts the structured description into an optimized prompt for Banana:

```
Main subject: Person pointing at screen with excited expression. 
Objects: laptop, smartphone, charts. 
Background: tech-modern with purple-blue gradient. 
Composition: subject right, text left, laptop floating on left side. 
Lighting: rim light, dramatic shadows, neon glow. 
Mood: excited, energetic. 
Text overlay: "GAME CHANGER" (bold, high contrast). 
Subtitle: "You Won't Believe This". 
Colors: primary #5B2CFF, secondary #00D9FF, accent #FFFFFF. 
Style: professional YouTube thumbnail, high contrast, eye-catching, 4K quality, sharp details, dramatic lighting.
```

### 4. Fallback Behavior

If Banana API fails or is not configured:
- System falls back to text description
- User still sees a visual preview box with the description
- No errors are thrown to the user

### 5. Testing

1. Upload a video
2. Click "Generate AI Strategy"
3. Wait for analysis (includes thumbnail generation)
4. Check the "Recommended Cover" card
5. You should see either:
   - ✅ Generated thumbnail image (if Banana is configured)
   - 📝 Text description in preview box (fallback)

### 6. Customization

To customize the Banana model or parameters, edit `lib/banana.ts`:

```typescript
modelInputs: {
  prompt,
  negative_prompt: 'blurry, low quality, distorted, ugly, bad anatomy, watermark, text artifacts',
  width: 1280,        // YouTube thumbnail size
  height: 720,        // YouTube thumbnail size
  num_inference_steps: 30,
  guidance_scale: 7.5,
}
```

### 7. Cost Considerations

- Banana charges per API call
- Each thumbnail generation = 1 API call
- Monitor usage in your Banana dashboard
- Consider implementing caching for regenerated thumbnails

### 8. Troubleshooting

**Issue: "Banana API key not configured"**
- Solution: Add `BANANA_API_KEY` to your environment variables

**Issue: Thumbnail generation fails**
- Check Banana dashboard for API status
- Verify API key is correct
- Check Vercel logs for detailed error messages
- System will fallback to text description automatically

**Issue: Generated thumbnails don't match video content**
- Gemini's video analysis might need improvement
- Check the `thumbnailDescription` in the API response
- Adjust Gemini prompt in `lib/gemini.ts` if needed

### 9. Future Enhancements

Potential improvements:
- [ ] Cache generated thumbnails
- [ ] Allow users to regenerate thumbnails with different styles
- [ ] Add thumbnail editing capabilities
- [ ] Support multiple thumbnail variations
- [ ] A/B testing for thumbnail performance

## Support

For issues with:
- **Gemini analysis**: Check `lib/gemini.ts`
- **Banana generation**: Check `lib/banana.ts`
- **Frontend display**: Check `fronted/src/components/StrategyCard.tsx`
