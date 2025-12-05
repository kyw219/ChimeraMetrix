const fal = require('@fal-ai/serverless-client');
const { GoogleGenAI } = require('@google/genai');
const fs = require('fs');
const https = require('https');

// Load environment variables
const envContent = fs.readFileSync('.env', 'utf8');
const falKeyMatch = envContent.match(/FAL_API_KEY=(.+)/);
const geminiKeyMatch = envContent.match(/GEMINI_API_KEY=(.+)/);

const FAL_API_KEY = falKeyMatch ? falKeyMatch[1].trim() : null;
const GEMINI_API_KEY = geminiKeyMatch ? geminiKeyMatch[1].trim() : null;

if (!FAL_API_KEY || !GEMINI_API_KEY) {
  console.error('❌ Missing API keys in .env file');
  process.exit(1);
}

// Configure clients
fal.config({ credentials: FAL_API_KEY });
const genAI = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

// Helper to download image
function downloadImage(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (response) => {
      const chunks = [];
      response.on('data', (chunk) => chunks.push(chunk));
      response.on('end', () => resolve(Buffer.concat(chunks)));
      response.on('error', reject);
    });
  });
}

async function testCoverGeneration() {
  try {
    console.log('🧪 Testing Cover Generation Pipeline\n');
    console.log('=' .repeat(60));
    
    // Step 1: Extract frame from video
    console.log('\n📹 Step 1: Extracting frame from video...');
    const testVideoUrl = 'https://v3.fal.media/files/monkey/R6D8anxtsyItZTyBB2ksC_qeoDDxmLSg8cuWasM54KY_output.mp4';
    
    const frameResult = await fal.subscribe('fal-ai/ffmpeg-api/extract-frame', {
      input: {
        video_url: testVideoUrl,
        frame_type: 'middle'
      }
    });
    
    const frameUrl = frameResult.images[0].url;
    console.log('✅ Frame extracted:', frameUrl);
    console.log('   Size:', frameResult.images[0].file_size, 'bytes');
    console.log('   Dimensions:', `${frameResult.images[0].width}x${frameResult.images[0].height}`);
    
    // Step 2: Download frame as base64
    console.log('\n📥 Step 2: Downloading frame...');
    const frameBuffer = await downloadImage(frameUrl);
    const frameBase64 = frameBuffer.toString('base64');
    console.log('✅ Frame downloaded, base64 length:', frameBase64.length);
    
    // Step 3: Test different cover generation approaches
    console.log('\n🎨 Step 3: Testing cover generation methods...');
    console.log('=' .repeat(60));
    
    // Method 1: Text-to-image (without reference frame)
    console.log('\n📝 Method 1: Text-to-Image Generation');
    console.log('-'.repeat(60));
    try {
      const textPrompt = `Create a 16:9 YouTube thumbnail with:
- Bold yellow text "AMAZING VIDEO" with black stroke
- Vibrant background with tech theme
- High contrast, eye-catching design
- Professional and modern style`;
      
      console.log('Prompt:', textPrompt);
      console.log('⏳ Generating image...');
      
      const response1 = await genAI.models.generateContent({
        model: 'gemini-2.0-flash-exp',
        contents: textPrompt,
      });
      
      console.log('Response structure:', Object.keys(response1));
      console.log('Candidates:', response1.candidates?.length);
      
      if (response1.candidates?.[0]?.content?.parts) {
        const parts = response1.candidates[0].content.parts;
        console.log('Parts count:', parts.length);
        
        let foundImage = false;
        for (let i = 0; i < parts.length; i++) {
          const part = parts[i];
          console.log(`Part ${i} keys:`, Object.keys(part));
          
          if (part.inlineData?.data) {
            console.log('✅ SUCCESS: Image generated!');
            console.log('   MIME type:', part.inlineData.mimeType);
            console.log('   Data length:', part.inlineData.data.length);
            foundImage = true;
            
            // Save sample
            const samplePath = 'test_cover_text_only.png';
            fs.writeFileSync(samplePath, Buffer.from(part.inlineData.data, 'base64'));
            console.log('   Saved to:', samplePath);
            break;
          }
          
          if (part.text) {
            console.log('   Text response:', part.text.substring(0, 100));
          }
        }
        
        if (!foundImage) {
          console.log('⚠️  No image data found in response');
        }
      }
    } catch (error) {
      console.error('❌ Method 1 failed:', error.message);
    }
    
    // Method 2: Image + text prompt (using extracted frame as reference)
    console.log('\n📸 Method 2: Image-to-Image with Frame Reference');
    console.log('-'.repeat(60));
    try {
      const imagePrompt = `Based on this video frame, create a professional YouTube thumbnail (16:9):
- Add bold yellow text "AMAZING VIDEO" with black stroke
- Enhance colors and contrast
- Make it eye-catching and clickable
- Keep the main subject from the frame`;
      
      console.log('Prompt:', imagePrompt);
      console.log('⏳ Generating image with frame reference...');
      
      const response2 = await genAI.models.generateContent({
        model: 'gemini-2.0-flash-exp',
        contents: [
          imagePrompt,
          {
            inlineData: {
              data: frameBase64,
              mimeType: 'image/jpeg'
            }
          }
        ],
      });
      
      console.log('Response structure:', Object.keys(response2));
      
      if (response2.candidates?.[0]?.content?.parts) {
        const parts = response2.candidates[0].content.parts;
        console.log('Parts count:', parts.length);
        
        let foundImage = false;
        for (let i = 0; i < parts.length; i++) {
          const part = parts[i];
          console.log(`Part ${i} keys:`, Object.keys(part));
          
          if (part.inlineData?.data) {
            console.log('✅ SUCCESS: Image generated with frame reference!');
            console.log('   MIME type:', part.inlineData.mimeType);
            console.log('   Data length:', part.inlineData.data.length);
            foundImage = true;
            
            // Save sample
            const samplePath = 'test_cover_with_frame.png';
            fs.writeFileSync(samplePath, Buffer.from(part.inlineData.data, 'base64'));
            console.log('   Saved to:', samplePath);
            break;
          }
          
          if (part.text) {
            console.log('   Text response:', part.text.substring(0, 100));
          }
        }
        
        if (!foundImage) {
          console.log('⚠️  No image data found in response');
        }
      }
    } catch (error) {
      console.error('❌ Method 2 failed:', error.message);
    }
    
    // Method 3: Try gemini-2.5-flash-image model
    console.log('\n🎨 Method 3: Using gemini-2.5-flash-image Model');
    console.log('-'.repeat(60));
    try {
      const imagePrompt = `Create a 16:9 YouTube thumbnail:
- Bold yellow text "AMAZING VIDEO" 
- Tech theme background
- High contrast, professional`;
      
      console.log('Prompt:', imagePrompt);
      console.log('⏳ Generating with gemini-2.5-flash-image...');
      
      const response3 = await genAI.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: imagePrompt,
      });
      
      console.log('Response structure:', Object.keys(response3));
      
      if (response3.candidates?.[0]?.content?.parts) {
        const parts = response3.candidates[0].content.parts;
        console.log('Parts count:', parts.length);
        
        let foundImage = false;
        for (let i = 0; i < parts.length; i++) {
          const part = parts[i];
          console.log(`Part ${i} keys:`, Object.keys(part));
          
          if (part.inlineData?.data) {
            console.log('✅ SUCCESS: Image generated with 2.5-flash-image!');
            console.log('   MIME type:', part.inlineData.mimeType);
            console.log('   Data length:', part.inlineData.data.length);
            foundImage = true;
            
            // Save sample
            const samplePath = 'test_cover_2.5_flash.png';
            fs.writeFileSync(samplePath, Buffer.from(part.inlineData.data, 'base64'));
            console.log('   Saved to:', samplePath);
            break;
          }
          
          if (part.text) {
            console.log('   Text response:', part.text.substring(0, 100));
          }
        }
        
        if (!foundImage) {
          console.log('⚠️  No image data found in response');
        }
      }
    } catch (error) {
      console.error('❌ Method 3 failed:', error.message);
    }
    
    console.log('\n' + '='.repeat(60));
    console.log('✨ Test completed!');
    console.log('\n📋 Summary:');
    console.log('- Frame extraction: ✅ Working');
    console.log('- Check above for which image generation methods worked');
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    if (error.stack) {
      console.error(error.stack);
    }
  }
}

testCoverGeneration();
