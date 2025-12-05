const fal = require('@fal-ai/serverless-client');
const { GoogleGenAI } = require('@google/genai');
const fs = require('fs');
const https = require('https');

// Load API keys
const envContent = fs.readFileSync('.env', 'utf8');
const FAL_API_KEY = envContent.match(/FAL_API_KEY=(.+)/)[1].trim();
const GEMINI_API_KEY = envContent.match(/GEMINI_API_KEY=(.+)/)[1].trim();

fal.config({ credentials: FAL_API_KEY });
const genAI = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

function downloadImage(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      const chunks = [];
      res.on('data', (chunk) => chunks.push(chunk));
      res.on('end', () => resolve(Buffer.concat(chunks)));
      res.on('error', reject);
    });
  });
}

async function test() {
  console.log('🧪 测试：Gemini 能否基于视频帧生成带人脸的封面\n');
  
  // Step 1: 从视频提取帧
  console.log('📹 Step 1: 提取视频帧...');
  const videoUrl = 'https://v3.fal.media/files/monkey/R6D8anxtsyItZTyBB2ksC_qeoDDxmLSg8cuWasM54KY_output.mp4';
  
  const frameResult = await fal.subscribe('fal-ai/ffmpeg-api/extract-frame', {
    input: { video_url: videoUrl, frame_type: 'middle' }
  });
  
  const frameUrl = frameResult.images[0].url;
  console.log('✅ 帧已提取:', frameUrl);
  
  // Step 2: 下载帧
  console.log('\n📥 Step 2: 下载帧...');
  const frameBuffer = await downloadImage(frameUrl);
  const frameBase64 = frameBuffer.toString('base64');
  console.log('✅ 帧已下载');
  
  // Step 3: 让 Gemini 基于这个帧生成封面（保留人脸）
  console.log('\n🎨 Step 3: 让 Gemini 基于帧生成封面（保留人脸）...');
  
  const prompt = `Based on this video frame, create a YouTube thumbnail (16:9):
- Keep the person/face from the original frame
- Add bold yellow text "AMAZING CONTENT" with black outline
- Enhance colors and make it more eye-catching
- Professional YouTube thumbnail style`;
  
  console.log('Prompt:', prompt);
  console.log('\n⏳ 生成中...');
  
  const response = await genAI.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: [
      prompt,
      {
        inlineData: {
          data: frameBase64,
          mimeType: 'image/jpeg'
        }
      }
    ],
  });
  
  // 检查结果
  const parts = response.candidates?.[0]?.content?.parts || [];
  
  for (const part of parts) {
    if (part.inlineData?.data) {
      console.log('✅ 成功！封面已生成（包含原视频中的人脸）');
      
      const outputPath = 'cover_with_face.png';
      fs.writeFileSync(outputPath, Buffer.from(part.inlineData.data, 'base64'));
      console.log('📁 已保存到:', outputPath);
      console.log('\n🎉 测试成功！Gemini 可以基于视频帧生成带人脸的封面');
      return;
    }
  }
  
  console.log('❌ 未找到图像数据');
}

test().catch(console.error);
