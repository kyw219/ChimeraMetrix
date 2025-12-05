const fal = require('@fal-ai/serverless-client');

// Load FAL_API_KEY from .env file manually
const fs = require('fs');
const envContent = fs.readFileSync('.env', 'utf8');
const falKeyMatch = envContent.match(/FAL_API_KEY=(.+)/);
const FAL_API_KEY = falKeyMatch ? falKeyMatch[1].trim() : null;

if (!FAL_API_KEY) {
  console.error('❌ FAL_API_KEY not found in .env file');
  process.exit(1);
}

fal.config({
  credentials: FAL_API_KEY,
});

async function test() {
  try {
    console.log('🧪 Testing fal.ai frame extraction API...\n');
    
    // Use the example video from the documentation
    const testVideoUrl = 'https://v3.fal.media/files/monkey/R6D8anxtsyItZTyBB2ksC_qeoDDxmLSg8cuWasM54KY_output.mp4';
    
    console.log('📹 Video URL:', testVideoUrl);
    console.log('🔧 API Endpoint: fal-ai/ffmpeg-api/extract-frame\n');
    
    // Test with different frame types
    const frameTypes = ['first', 'middle', 'last'];
    
    for (const frameType of frameTypes) {
      try {
        console.log(`\n⏳ Extracting ${frameType} frame...`);
        
        const result = await fal.subscribe('fal-ai/ffmpeg-api/extract-frame', {
          input: {
            video_url: testVideoUrl,
            frame_type: frameType
          },
          logs: true,
          onQueueUpdate: (update) => {
            if (update.status === 'IN_PROGRESS') {
              update.logs?.map((log) => log.message).forEach(msg => console.log('  📝', msg));
            }
          }
        });
        
        console.log(`✅ SUCCESS - ${frameType} frame extracted!`);
        console.log('📊 Full result object:', JSON.stringify(result, null, 2));
        
        // Try different possible result structures
        const frameUrl = result?.images?.[0]?.url || 
                        result?.data?.images?.[0]?.url || 
                        result?.output?.images?.[0]?.url;
        
        if (frameUrl) {
          console.log('🖼️  Frame URL:', frameUrl);
        } else {
          console.log('⚠️  Could not find frame URL in result');
        }
        
      } catch (e) {
        console.log(`❌ Failed to extract ${frameType} frame:`, e.message);
        if (e.body) {
          console.log('Error details:', JSON.stringify(e.body, null, 2));
        }
      }
    }
    
    console.log('\n✨ Test completed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.stack) {
      console.error(error.stack);
    }
  }
}

test();
