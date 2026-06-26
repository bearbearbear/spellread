# SpellRead 多用户系统设计

> **状态**：已实现（Phase 1 本地多用户）  
> **目标**：在同一设备上支持多个学习者，每人拥有独立的 profile 与学习进度；新建用户从空白进度开始。  
> **范围**：本文档仅描述产品与数据设计，不涉及代码改动。

---

## 1. 背景与动机

### 1.1 现状（MVP）

| 维度 | 当前实现 |
|------|----------|
| 存储 | 浏览器 `localStorage`，单键 `spellread-state` |
| 用户 | 至多一个 `UserProfile`（`profile: null` 表示未 onboarding） |
| 进度 | `chapterProgress`、`vocabJournal`、`badges` 等与 profile **共用同一 `AppState`** |
| 切换 | 无；换孩子使用需清除浏览器数据或共用同一进度 |

### 1.2 问题

- 兄弟姐妹、课堂多学生共用一台平板时，进度与 House Points 会混在一起。
- 无法为第二个孩子「从零开始」而不影响第一个孩子的记录。
- 家长端周报、自适应等级无法按人区分。

### 1.3 设计目标

| 目标 | 说明 |
|------|------|
| **多 Profile** | 设备上可创建多个学习者，每人有昵称、头像、学院等 |
| **进度隔离** | 章节状态、Quiz 草稿、生词本、徽章、自适应等级 **按用户独立存储** |
| **新用户空白** | 新建用户进入时，进度等同于当前 `getDefaultState()`（仅 Ch.1 `preview_available`，其余 `locked`） |
| **快速切换** | 首页或 Profile 可切换当前用户，切换后全站数据即时对应该用户 |
| **向后兼容** | 已有单用户数据可无损迁移为「第一个用户」 |
| **分阶段交付** | Phase 1 本地多用户；Phase 2 可选账号与云同步（本文档预留接口，不强制实现） |

### 1.4 非目标（Phase 1）

- 跨设备实时同步（需账号体系，属 Phase 2）
- 社交、好友、排行榜
- 教师批量导入班级（未来扩展）

---

## 2. 概念模型

```
┌─────────────────────────────────────────────────────────┐
│                    Device（本机）                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │  DeviceSettings（设备级，可选）                    │   │
│  │  · debugMode                                    │   │
│  │  · activeUserId                                 │   │
│  └─────────────────────────────────────────────────┘   │
│                         │                              │
│         ┌───────────────┼───────────────┐              │
│         ▼               ▼               ▼              │
│   ┌──────────┐   ┌──────────┐   ┌──────────┐          │
│   │ User A   │   │ User B   │   │ User C   │  …        │
│   │ Save     │   │ Save     │   │ Save     │          │
│   └──────────┘   └──────────┘   └──────────┘          │
└─────────────────────────────────────────────────────────┘

每个 User Save 包含：
  profile · chapterProgress · vocabJournal · badges · recentQuizScores
```

| 概念 | 说明 |
|------|------|
| **Device** | 一台浏览器 / 一台共享平板；Phase 1 不区分「家庭账号」 |
| **User（学习者）** | 儿童读者；通过 onboarding 创建，有唯一 `id` |
| **User Save** | 该用户全部学习数据的一个快照 |
| **Active User** | 当前正在使用 App 的用户；所有页面读写其 Save |
| **Parent PIN** | 仍挂在 **单个 User 的 profile** 上（或设备级，见 §5.3） |

---

## 3. 数据模型

### 3.1 顶层结构（建议）

将现有 `AppState` 拆为 **设备层** + **用户层**：

```typescript
/** 设备级持久化根对象（localStorage 单键或分键，见 §3.3） */
interface DeviceState {
  schemaVersion: number;           // 当前建议 = 2
  activeUserId: string | null;     // 当前选中的用户；null = 需选择/创建用户
  debugMode: boolean;              // 设备级 QA 开关（见 §5.2）
  users: Record<string, UserSave>; // key = UserProfile.id
  userOrder: string[];             // 首页展示顺序（最近使用可置顶）
}

/** 单个用户的全部学习数据（由原 AppState 去掉全局字段而来） */
interface UserSave {
  profile: UserProfile;
  chapterProgress: Record<string, ChapterProgress>;
  vocabJournal: Record<string, VocabEntry>;
  badges: Badge[];
  recentQuizScores: number[];
  createdAt: string;               // ISO 8601
  updatedAt: string;
}
```

`UserProfile`、`ChapterProgress`、`VocabEntry`、`Badge` 等字段 **保持现有类型定义不变**，仅改变存放位置。

### 3.2 新用户的初始 Save

新建用户完成 onboarding 后，写入的 `UserSave` **必须**等同于今天代码中的 `getDefaultState()`，仅 `profile` 替换为新建档案：

| 字段 | 新用户初始值 |
|------|----------------|
| `profile` | `createProfile(...)` + placement 结果 |
| `chapterProgress` | `{ "1-1": { status: "preview_available", ... } }`，其余章不存在或视为 `locked` |
| `vocabJournal` | `{}` |
| `badges` | `DEFAULT_BADGES`（均未 `earnedAt`） |
| `recentQuizScores` | `[]` |
| `createdAt` / `updatedAt` | 当前时间 |

**禁止**从其他用户复制进度、House Points 或生词本。

### 3.3 存储策略（Phase 1）

| 方案 | 键名 | 优点 | 缺点 |
|------|------|------|------|
| **A. 单键聚合（推荐）** | `spellread-v2` 存整个 `DeviceState` | 原子写入、迁移简单 | 用户增多后单 JSON 变大 |
| B. 索引 + 分用户键 | `spellread-index` + `spellread-user-{id}` | 单用户读写小 | 切换用户需两次读；一致性需额外处理 |

**推荐 Phase 1 用方案 A**。按估算：每用户 Save 约 50–200 KB（17 章 + 生词本），5 个用户仍远低于 `localStorage` 5 MB 上限。

### 3.4 与现有 `AppState` 的对照

| 现有 `AppState` 字段 | 迁移后归属 |
|---------------------|-----------|
| `profile` | `users[id].profile` |
| `chapterProgress` | `users[id].chapterProgress` |
| `vocabJournal` | `users[id].vocabJournal` |
| `badges` | `users[id].badges` |
| `recentQuizScores` | `users[id].recentQuizScores` |
| `debugMode` | `DeviceState.debugMode`（设备级） |

运行时可在 Context 中继续暴露 **「当前用户的逻辑 AppState」**（`ActiveUserState`），以减少页面层改动：

```typescript
type ActiveUserState = UserSave & { debugMode: boolean };
```

---

## 4. 用户流程

### 4.1 首次打开（无数据）

```
打开 App
  → 无 spellread-v2 / 无用户
  → 欢迎页「Get Started」
  → Onboarding（现有流程）
  → 创建 UserSave + 设为 activeUserId
  → 首页
```

### 4.2 已有用户，再次打开

```
打开 App
  → 读取 DeviceState
  → activeUserId 有效
  → 加载该用户 Save → 首页（显示其地图与进度）
```

### 4.3 添加新用户

```
首页 / Profile · 「Add learner」
  → 简短确认（「新同学将从第一章开始，进度空白」）
  → Onboarding（可跳过「Bring your own book」长说明，保留 profile + placement）
  → 新建 UserSave（空白进度）
  → 设为 activeUserId
  → 首页
```

### 4.4 切换用户

```
点击用户头像条 / Profile 用户列表
  → 选择 User B
  → activeUserId = B.id
  → 持久化 DeviceState
  → 全站 React state 替换为 B 的 Save（无需刷新页面）
```

| 规则 | 说明 |
|------|------|
| 未保存草稿 | 切换前若 Quiz Section 有未提交草稿，**自动保存到当前用户**（与现行为一致） |
| 路由 | 切换后停留在当前路由；若该用户无 profile 逻辑不应触发 |
| 最近使用 | 切换后将该 `id` 移到 `userOrder` 首位 |

### 4.5 删除用户

- 入口：Profile → Manage learners → 删除（需 **家长 PIN** 或长按确认）
- 删除 `users[id]`，若删的是 `activeUserId` 则切换到 `userOrder` 中下一用户或 `null`
- **不可恢复**（Phase 1 无云端备份时明确提示）

### 4.6 线框：首页用户切换条

```
┌─────────────────────────────────────────┐
│  [🧙 Harry ▼]  [🦉 Lily]  [＋ Add]       │  ← 横向头像条，当前用户高亮
├─────────────────────────────────────────┤
│  Book 1 · Philosopher's Stone           │
│  Chapter map …                          │
└─────────────────────────────────────────┘
```

### 4.7 线框：选择用户（多用户时冷启动）

若 `activeUserId === null` 且 `users` 非空：

```
┌─────────────────────────────────────────┐
│  Who's reading today?                   │
├─────────────────────────────────────────┤
│  [ 🧙 Harry    Gryffindor · 12 pts ]    │
│  [ 🦉 Lily     Ravenclaw · 45 pts ]     │
│  [ ＋ Add a new learner ]                │
└─────────────────────────────────────────┘
```

---

## 5. 功能归属与边界

### 5.1 按用户隔离（必须）

| 数据 / 行为 | 隔离 |
|-------------|------|
| 章节解锁与 `ChapterProgress` | ✓ |
| Overview 闪卡「已掌握」、Mini Check | ✓ |
| 阅读计时与 `readingMinutes` | ✓ |
| Quiz 草稿 `quizDraft`、历史 `quizAttempts` | ✓ |
| 生词本 `vocabJournal`、复习队列 | ✓ |
| House Points、`streakDays`、`readerLevel` | ✓ |
| 自适应 `vocabLevel` / `comprehensionLevel` / `clozeLevel` | ✓ |
| 徽章 `earnedAt` | ✓ |
| Placement 结果 | ✓ |

### 5.2 设备级（共享）

| 数据 / 行为 | 说明 |
|-------------|------|
| `debugMode` | QA 用；开启后对所有用户显示 Ch.0 与全章解锁 **行为** 仍写入**当前用户**的 `chapterProgress` |
| 内容包 `content/book1/*.json` | 只读，全局共享 |
| UI 语言 / 主题（若未来有） | 建议设备级 |

### 5.3 家长端

| 项目 | Phase 1 设计 |
|------|----------------|
| 入口 | `/parent` 仍从 Bottom Nav 进入 |
| 查看对象 | **当前 active 用户**的周报与难度调节 |
| 切换 | 家长页顶栏增加「查看：Harry ▼」下拉，切换后报表数据切换 |
| PIN | 方案 A：每用户 `profile.parentPin`（现有字段）<br>方案 B：设备级单一 PIN（家长只记一个密码）<br>**推荐 A**，与「每孩独立档案」一致 |

---

## 6. 迁移方案（v1 → v2）

### 6.1 检测

```
若存在 localStorage['spellread-state'] 且不存在 spellread-v2：
  → 执行一次性迁移
```

### 6.2 迁移步骤

1. 解析旧 `AppState` 为 `legacy`
2. 若 `legacy.profile` 存在：
   - 以 `legacy.profile.id` 为键，构建 `UserSave`（拷贝 progress / journal / badges / scores）
   - `activeUserId = legacy.profile.id`
3. 若 `legacy.profile === null`：
   - `users = {}`，`activeUserId = null`（走新用户/onboarding 流程）
4. `debugMode` ← `legacy.debugMode`
5. 写入 `spellread-v2`；可选保留旧键只读备份 `spellread-state-migrated`
6. `schemaVersion = 2`

### 6.3 回滚

- 迁移前复制旧 JSON 到 `spellread-state-backup`
- 设置页（Debug）可提供「恢复 v1 备份」（仅开发/支持用）

---

## 7. API 与模块划分（实现参考，本文不编码）

### 7.1 存储层

| 函数 | 职责 |
|------|------|
| `loadDeviceState()` | 读盘 + 迁移 + 默认空设备 |
| `saveDeviceState(device)` | 写盘 |
| `getActiveUserSave(device)` | 返回当前用户 Save 或 null |
| `setActiveUser(device, userId)` | 切换用户 |
| `createUserSave(profile)` | 空白 Save + 注册到 `users` |
| `deleteUser(device, userId)` | 删除并修正 active |

### 7.2 Context

`AppProvider` 持有 `DeviceState` + 派生的 `activeUserState`；`setState` 仅更新 **当前用户** 的 Save 并写回 `DeviceState.users[activeUserId]`。

### 7.3 页面改动要点（实现阶段）

| 页面 | 改动 |
|------|------|
| `HomePage` | 用户切换条；无 active 时显示选择器 |
| `OnboardingPage` | 支持 `mode: 'first' \| 'additional'` 文案差异 |
| `ProfilePage` | 管理学习者列表、添加、删除 |
| `ParentDashboardPage` | 按 active 用户展示；可选切换 |
| 其余学习页 | 无感（继续读 `useApp().state`，底层已是当前用户） |

---

## 8. Phase 2 预留：账号与云同步（可选）

不在 Phase 1 实现，但数据模型预留：

```typescript
interface UserProfile {
  // …现有字段
  accountId?: string;      // 关联云端账号
  lastSyncedAt?: string;
}
```

| 能力 | 说明 |
|------|------|
| 登录 | 邮箱 / 魔法链接 / 家长 Google 账号 |
| 同步 | `UserSave` 整包或增量同步至服务端 |
| 多设备 | 同一 `accountId` 拉取最新 Save；冲突时 **最后写入胜出** 或提示合并 |
| 与本地多用户关系 | 云端账号可绑定设备上的某个 `UserProfile.id` |

---

## 9. 安全与隐私

| 主题 | 说明 |
|------|------|
| 数据位置 | Phase 1 仅本机；不上传 |
| 儿童隐私 | 昵称避免真实姓名；家长同意流程仍在 **每个新用户** onboarding 保留 |
| 删除 | 删除用户即清除其 local Save |
| PIN | 仅存本地 hash；不可明文记录于文档或日志 |

---

## 10. 验收标准（Phase 1）

- [ ] 可创建 ≥2 个用户，各自完成 Ch.1 后进度互不影响
- [ ] 用户 B 新建时：仅 Ch.1 可进，House Points = 0，生词本为空
- [ ] 切换用户后，地图、Overview、Quiz、Words、Review 均显示对应用户数据
- [ ] 从 v1 单用户迁移后，原进度完整保留为第一个用户
- [ ] 删除用户 B 后，用户 A 数据不变
- [ ] Debug Mode 开关对所有用户生效，但各用户 debug 下的章节进度仍隔离

---

## 11. 相关文档

- [PRODUCT_DESIGN.md](./PRODUCT_DESIGN.md) — 单章学习流程、Quiz、闪卡
- [BETA_TEST.md](./BETA_TEST.md) — 测试协议（多用户场景需补充用例）
- [COPYRIGHT.md](./COPYRIGHT.md) — 内容政策不变
