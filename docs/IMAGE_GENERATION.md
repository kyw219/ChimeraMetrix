# 封面图片生成功能

## 概述

系统现在支持使用 Gemini 2.0 Flash 模型自动生成视频封面图片。

## 功能特性

### ✅ 已实现（Phase 1 MVP）

1. **优化的封面描述生成**
   - 详细的视觉布局（构图、焦点、背景）
   - 文字元素规格（内容、位置、字体、颜色、特效）
   - 装饰元素（emoji、图形）
   - 色彩方案优化
   - 平台特定优化（YouTube 16:9 / TikTok/Shorts 9:16）

2. **AI 图片生成**
   - 使用 `gemini-2.0-flash-exp` 模型
   - 纯文字到图片生成
   - 返回 base64 编码的图片数据
   - 自动降级到文字描述（如果生成失败）

3. **前端显示**
   - 显示真实的 AI 生成图片
   - 优雅的降级处理
   - 视觉标识（"AI Generated" 徽章）

## API 变化

### Strategy 类型更新

```typescript
export interface Strategy {
  cover: string;              // 文字描述（降级方案）
  coverImageUrl?: string;     // base64 图片数据
  coverPrompt?: CoverPrompt;  // 详细的生成描述
  title: string;
  hashtags: string;
  postingTime: string;
}
```

### 响应示例

```json
{
  "success": true,
  "data": {
    "strategy": {
      "cover": "AI-generated thumbnail optimized for tiktok",
      "coverImageUrl": "data:image/png;base64,iVBORw0KGgoAAAANS...",
      "title": "5分钟学会做蛋糕",
      "hashtags": "#美食 #烘焙 #教程",
      "postingTime": "7:00 PM EST"
    }
  }
}
```

## 工作流程

1. **视频分析** → 提取特征（category, emotion, visualStyle 等）
2. **策略生成** → 生成 title, hashtags, postingTime
3. **封面描述** → 基于特征生成详细的视觉描述
4. **图片生成** → 调用 Gemini 图片模型生成封面
5. **返回结果** → 包含 base64 图片数据

## 降级策略

如果图片生成失败（超时、错误、配额用完）：
- 返回文字描述
- 前端显示文字描述的视觉预览
- 用户体验不受影响

## 性能考虑

- **生成时间**：图片生成可能需要 5-15 秒
- **数据大小**：base64 图片约 100-500KB
- **成本**：图片生成比文字生成成本更高

## 未来优化（Phase 2 & 3）

- [ ] 视频抽帧功能
- [ ] 基于视频帧生成封面
- [ ] 云存储集成（替代 base64）
- [ ] 对话式迭代优化
- [ ] A/B 测试多个版本
- [ ] 用户手动调整参数

## 环境配置

确保 `.env` 文件包含：

```bash
GEMINI_API_KEY=your_api_key_here
GEMINI_MODEL=gemini-1.5-pro
```

图片生成模型会自动使用 `gemini-2.0-flash-exp`，无需额外配置。
