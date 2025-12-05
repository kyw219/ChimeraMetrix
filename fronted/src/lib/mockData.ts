export const mockAnalysis = {
  category: "Food & Cooking",
  emotion: "Excitement & Curiosity",
  visualStyle: "High-contrast, close-up shots with vibrant colors",
  keywords: ["noodles", "spicy", "street food", "ASMR", "mukbang"],
  audience: "Gen Z food enthusiasts (18-28)",
  hookType: "Visual Hook",
};

export const mockStrategy = {
  cover: "High-contrast close-up noodle pull with bold white text overlay: 'SPICIEST NOODLES IN NYC'. Steam visible, vibrant red sauce, chopsticks mid-pull creating dramatic strings.",
  title: "I Tried NYC's SPICIEST Noodles Challenge 🔥 (Instant Regret)",
  description: "I ventured into NYC's most notorious spicy noodle spot and immediately regretted my life choices! 🔥🥵\n\nIn this video, I take on the infamous 'Dragon's Breath' noodle challenge - a dish so spicy, only 3% of customers finish it. Watch as I struggle through tears, sweat, and pure determination to conquer these fiery noodles.\n\n🌶️ What's in the video:\n• First impressions of the restaurant\n• The moment I realized I made a mistake\n• My honest reaction (spoiler: lots of regret)\n• Would I do it again?\n\nIf you enjoyed this spicy food challenge, don't forget to LIKE and SUBSCRIBE for more food adventures around NYC! Drop a comment if you've tried this place or have other spicy challenges I should attempt.\n\n📍 Location: [Restaurant Name], East Village, NYC\n🎵 Music: [Credits]\n\n#SpicyFoodChallenge #NYCFood #FoodieAdventure",
  hashtags: "#spicyfood #foodchallenge #noodlesasmr #streetfood #foodie #mukbang #nyceats #spicynoodles",
  postingTime: "7:00 PM EST (Peak dinner browsing time)",
  reasoning: {
    cover: "High-contrast food close-ups with action (noodle pull) generate 47% higher CTR on food content. Bold text overlay with emoji increases stop-scroll rate by 32%.",
    title: "First-person narrative ('I Tried') creates relatability. Specificity ('NYC's SPICIEST') builds curiosity. Emoji and parenthetical commentary add personality and humor.",
    description: "Engaging description with clear structure: hook, content preview, call-to-action, and relevant details. Uses emojis for visual appeal and includes SEO keywords naturally.",
    hashtags: "Mix of trending food tags (#spicyfood, #mukbang) with location (#nyceats) and content type (#foodchallenge). 8 hashtags optimal for maximum reach without spam.",
    time: "7 PM EST targets users browsing during dinner decision-making. Food content performs 64% better 6-8 PM when users are hungry and seeking inspiration.",
  },
};

export const mockBacktestData = {
  views: [
    { time: "1h", value: 1200 },
    { time: "3h", value: 4500 },
    { time: "6h", value: 12000 },
    { time: "12h", value: 28000 },
    { time: "24h", value: 45000 },
  ],
  ctr: [
    { time: "1h", value: 8.2 },
    { time: "3h", value: 7.8 },
    { time: "6h", value: 7.5 },
    { time: "12h", value: 7.1 },
    { time: "24h", value: 6.9 },
  ],
  likes: [
    { time: "1h", value: 98 },
    { time: "3h", value: 360 },
    { time: "6h", value: 960 },
    { time: "12h", value: 2240 },
    { time: "24h", value: 3600 },
  ],
  metrics: {
    views24h: "45,000",
    ctr24h: "6.9%",
    likes24h: "3,600",
    confidence: "87%",
  },
};

export const mockMatchedVideos = [
  {
    thumbnail: "🍜",
    title: "Spicy Ramen Challenge Goes WRONG",
    ctr: "7.2%",
    views24h: "42,000",
    similarity: "0.89",
  },
  {
    thumbnail: "🔥",
    title: "I Ate The World's Hottest Noodles",
    ctr: "6.8%",
    views24h: "38,500",
    similarity: "0.85",
  },
  {
    thumbnail: "🥵",
    title: "EXTREME Spicy Food Challenge NYC",
    ctr: "7.5%",
    views24h: "51,200",
    similarity: "0.82",
  },
];

export const mockInsights = {
  predictionSteps: [
    "Video features extracted (visual + title + cover description)",
    "AI-generated cover description for semantic matching",
    "Matched against 3 most similar videos in database",
    "Aggregated metrics (views, likes, CTR)",
    "Temporal curve generated based on matched samples",
  ],
  factors: [
    {
      name: "Cover Design",
      impact: "High Impact",
      description: "Matches high-performing visual contrast patterns.",
    },
    {
      name: "Title Framing",
      impact: "Medium Impact",
      description: "Uses curiosity framing.",
    },
    {
      name: "Hashtag Combination",
      impact: "Medium Impact",
      description: "Includes trending tags.",
    },
    {
      name: "Posting Time",
      impact: "Low Impact",
      description: "Aligns with mid-level activity.",
    },
  ],
};
