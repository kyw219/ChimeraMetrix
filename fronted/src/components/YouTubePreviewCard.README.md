# YouTubePreviewCard 组件使用文档

## 概述

`YouTubePreviewCard` 是一个高度还原 YouTube 首页推荐卡片的 React 组件，用于预览视频在 YouTube 首页的真实显示效果。

## 组件特性

✅ 严格按照 YouTube 首页视频卡片结构实现  
✅ 16:9 缩略图 + 右下角时长标签  
✅ 标题自动两行截断（超出显示省略号）  
✅ 圆形频道头像  
✅ 中文格式观看数（43.5万次观看）  
✅ 响应式设计，适配不同屏幕  
✅ 使用 Tailwind CSS，与项目风格一致  

## Props 接口

```typescript
interface YouTubePreviewCardProps {
  thumbnailUrl: string;      // 缩略图 URL（16:9）
  duration: string;          // 视频时长 "12:45" 或 "1:23:45"
  title: string;             // 视频标题（自动两行截断）
  avatarUrl?: string;        // 频道头像（可选，默认显示首字母）
  channelName: string;       // 频道名称
  views: number;             // 观看数（数字，自动格式化）
  publishedTime: string;     // 发布时间文本 "1个月前"
}
```

## 基础使用

```tsx
import { YouTubePreviewCard } from "@/components/YouTubePreviewCard";

function MyComponent() {
  return (
    <YouTubePreviewCard
      thumbnailUrl="https://example.com/thumbnail.jpg"
      duration="12:45"
      title="I Tried NYC's SPICIEST Noodles Challenge 🔥"
      channelName="FoodieAdventures"
      views={435000}
      publishedTime="3周前"
    />
  );
}
```

## 在 Upload.tsx 中使用

替换现有的 `StrategyPreview` 组件：

```tsx
import { YouTubePreviewCard } from "@/components/YouTubePreviewCard";

// 在 strategy 生成后显示预览
{strategy && (
  <div className="mt-8">
    <h2 className="text-base font-bold text-primary mb-4">
      YouTube 首页预览效果
    </h2>
    
    <div className="flex justify-center">
      <YouTubePreviewCard
        thumbnailUrl={strategy.coverImageUrl || "默认图片URL"}
        duration="10:24"
        title={strategy.title}
        channelName="Your Channel"
        views={0}
        publishedTime="刚刚"
      />
    </div>
  </div>
)}
```

## 观看数格式化规则

组件会自动将数字格式化为中文：

- `5,600` → "5.6千次观看"
- `43,500` → "4.4万次观看"
- `1,250,000` → "125.0万次观看"
- `150,000,000` → "1.5亿次观看"

## 工具函数

配套的 `youtubePreviewUtils.ts` 提供了实用函数：

```typescript
import {
  generateRandomDuration,
  generateRandomViews,
  generateRandomPublishedTime,
  extractVideoDuration,
} from "@/lib/youtubePreviewUtils";

// 生成随机时长（用于 demo）
const duration = generateRandomDuration(); // "8:23"

// 生成随机观看数
const views = generateRandomViews(); // 125000

// 生成随机发布时间
const time = generateRandomPublishedTime(); // "3周前"

// 从视频文件提取真实时长
const realDuration = await extractVideoDuration(videoFile);
```

## Demo 页面

查看 `YouTubePreviewDemo.tsx` 获取完整示例：

```tsx
import { YouTubePreviewDemo } from "@/components/YouTubePreviewDemo";

// 在开发环境中查看效果
<YouTubePreviewDemo />
```

## 样式定制

组件使用 Tailwind CSS，可以通过包装容器调整尺寸：

```tsx
{/* 小尺寸 */}
<div className="max-w-[280px]">
  <YouTubePreviewCard {...props} />
</div>

{/* 标准尺寸（默认） */}
<div className="max-w-[360px]">
  <YouTubePreviewCard {...props} />
</div>

{/* 大尺寸 */}
<div className="max-w-[480px]">
  <YouTubePreviewCard {...props} />
</div>
```

## 注意事项

1. **不显示的字段**：组件严格遵循 YouTube 首页样式，不显示：
   - 视频简介 (description)
   - Hashtags（除非在标题中）
   - Posting time（内部策略字段）
   - 任何额外的 CTA 或按钮

2. **标题截断**：标题超过两行会自动截断并显示省略号（`line-clamp-2`）

3. **头像占位符**：如果不提供 `avatarUrl`，会显示频道名称的首字母

4. **时长格式**：支持 `MM:SS` 和 `H:MM:SS` 两种格式

## 未来增强

- [ ] Hover 自动播放预览（需要视频文件）
- [ ] 验证标记（verified badge）
- [ ] 会员专属标记
- [ ] 字幕/CC 标记
- [ ] 4K/HD 标记

## 相关文件

- `fronted/src/components/YouTubePreviewCard.tsx` - 主组件
- `fronted/src/components/YouTubePreviewDemo.tsx` - Demo 示例
- `fronted/src/lib/youtubePreviewUtils.ts` - 工具函数
- `fronted/src/components/StrategyPreview.tsx` - 已集成该组件
