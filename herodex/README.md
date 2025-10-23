# Herodex (小侠成长录) 插件

一个游戏化的学习激励与记录系统，将小学生的日常学习任务转化为富有武侠/修仙趣味的"功课呈报"和"技能修炼"过程。

## 功能特性

### 🎮 游戏化学习体验
- **武侠风格界面**: 将学习过程包装成修炼武功的体验
- **技能树系统**: 1-6年级语数英三科知识点的完整技能树
- **等级称号**: 从"初窥门径"到"登峰造极"的成长路径
- **修为点系统**: 量化学习成果，激发持续学习动力

### 👨‍👩‍👧‍👦 家长管理后台
- **仪表盘**: 一目了然的学习进度总览
- **功课评阅**: AI辅助的作业评定系统
- **技能管理**: 灵活的技能树配置和管理
- **进度追踪**: 详细的学习活动记录

### 🤖 AI智能评定
- **自动评阅**: AI师傅分析学习内容并给出建议
- **个性化反馈**: 武侠风格的鼓励性评语
- **智能奖励**: 根据学习内容自动分配修为点和技能熟练度

### 📱 响应式设计
- **多主题支持**: Light/Dark主题自动适配
- **移动端友好**: 完美支持手机和平板设备
- **国际化**: 中英文双语支持

## 安装配置

### 1. 数据库初始化

首先需要在Supabase中执行数据库初始化脚本：

```sql
-- 在Supabase SQL Editor中执行
-- 1. 先执行框架的数据库初始化脚本 (docs/design/database-initialization.sql)
-- 2. 再执行Herodex的数据库脚本 (src/plugins/herodex/docs/database.md中的SQL)
```

### 2. 环境变量配置

在项目根目录的 `.env` 文件中添加：

```env
# Supabase配置
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# AI服务配置 (可选)
VITE_OPENAI_API_KEY=your_openai_api_key
```

### 3. 权限配置

确保用户拥有相应的权限：

**管理员权限**:
- `ui.herodex.admin.view` - 查看管理后台
- `db.hdx_*` - 数据库操作权限

**玩家权限**:
- `ui.herodex.player.view` - 查看玩家界面
- `db.hdx_players.select/update` - 玩家数据权限
- `db.hdx_daily_submissions.*` - 功课呈报权限

## 使用指南

### 家长端操作流程

1. **访问管理后台**: `/admin/herodex`
2. **查看待评阅功课**: 在仪表盘或功课评阅页面
3. **AI评定**: 点击"请师傅评定"获取AI建议
4. **调整奖励**: 根据实际情况调整修为点和技能熟练度
5. **确认授予**: 完成评阅，奖励自动发放给孩子

### 孩子端操作流程

1. **查看角色面板**: `/herodex` - 了解当前修炼进度
2. **呈报功课**: `/herodex/submission` - 提交今日学习成果
3. **查看技能树**: `/herodex/skills` - 探索学习路径
4. **接收奖励**: 师傅评阅后自动获得修为和技能提升

## 技术架构

### 前端技术栈
- **React**: 用户界面框架
- **shadcn/ui**: UI组件库
- **Tailwind CSS**: 样式框架
- **i18next**: 国际化支持

### 后端技术栈
- **Supabase**: 数据库和认证
- **PostgreSQL**: 关系型数据库
- **RLS**: 行级安全策略

### 数据库设计
- `hdx_players`: 玩家信息
- `hdx_skills`: 技能定义
- `hdx_player_skills`: 玩家技能进度
- `hdx_daily_submissions`: 功课呈报
- `hdx_activity_log`: 活动日志

## AI集成

### 支持的AI服务
- **OpenAI GPT**: 需要API Key
- **本地模型**: 支持Ollama等本地部署
- **模拟模式**: 开发测试用

### AI配置
```javascript
import { configureAI } from './lib/ai-service';

// 配置OpenAI
configureAI('openai', {
  apiKey: 'your-api-key',
  model: 'gpt-3.5-turbo'
});

// 配置本地模型
configureAI('local', {
  baseURL: 'http://localhost:11434',
  model: 'llama2'
});
```

## 自定义开发

### 添加新技能
```javascript
import { skillService } from './lib/supabase';

await skillService.createSkill({
  skill_name_game: '九阴真经',
  skill_name_real: '高等数学',
  description_game: '传说中的绝世武功...',
  description_real: '微积分基础知识',
  subject_id: 'math_subject_id',
  grade_level: 6,
  max_level: 5
});
```

### 自定义主题
```css
/* 在 styles/herodex.css 中添加自定义样式 */
.herodex-theme-custom {
  --herodex-primary: #your-color;
  --herodex-xp-gradient: linear-gradient(135deg, #color1, #color2);
}
```

### 扩展AI评定
```javascript
// 在 lib/ai-service.js 中添加自定义评定逻辑
export async function customEvaluateSubmission(submissionData, skillsData) {
  // 自定义评定逻辑
  return {
    comment: '自定义评语',
    suggested_xp: 25,
    suggested_proficiency: [...]
  };
}
```

## 故障排除

### 常见问题

**Q: 插件无法加载？**
A: 检查插件是否正确注册在 `src/plugins/index.js` 中

**Q: 数据库连接失败？**
A: 确认Supabase配置正确，检查环境变量

**Q: AI评定不工作？**
A: 检查AI服务配置，确认API Key有效

**Q: 权限错误？**
A: 确认用户拥有相应的权限，检查RLS策略

### 调试模式
```javascript
// 启用调试日志
localStorage.setItem('herodex-debug', 'true');

// 查看AI配置
import { getAIConfig } from './lib/ai-service';
console.log(getAIConfig());
```

## 贡献指南

1. Fork项目仓库
2. 创建功能分支: `git checkout -b feature/new-feature`
3. 提交更改: `git commit -am 'Add new feature'`
4. 推送分支: `git push origin feature/new-feature`
5. 提交Pull Request

## 许可证

本项目采用MIT许可证，详见LICENSE文件。

## 支持

如有问题或建议，请：
1. 查看文档: `docs/` 目录
2. 提交Issue: GitHub Issues
3. 参与讨论: GitHub Discussions

---

**小侠成长录** - 让学习变成一场武侠冒险！⚔️