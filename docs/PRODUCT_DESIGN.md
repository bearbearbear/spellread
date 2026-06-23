# SpellRead 产品设计文档

> 面向 7–14 岁儿童的 Harry Potter 章节式英语阅读教练。  
> 对标 RAZ-Plus「预习 → 阅读 → 测验 → 进阶」闭环。

## 核心用户旅程（单章）

1. **Chapter Overview**（5–8 min）— 词汇预习 + 背景导读 + Reading / Quiz 状态卡片
2. **Read**（20–30 min）— 自备书阅读 + 计时器
3. **Chapter Quiz**（10–15 min）— **三个独立 Section**，在概览页自由选择、完成后统一提交
4. **Review & Reward** — 错题解析、生词入本、House Points

---

## 4.4 章节 Quiz（Chapter Quiz）

参考 RAZ 将 **Comprehension Quiz** 与 **Vocabulary Quiz** 分为独立测验模块；并参考 **Cambridge B1 Preliminary (PET) Reading Part 6 — Open Cloze**，新增 **段落完形填空（Cloze Passage）** 作为第三个 Section。三个 Section 在**同一章节测验内**以**概览页（Hub）** 为中心：可任意顺序进入、完成后返回概览，全部做完再提交。

### 整体结构

| 项目 | 说明 |
|------|------|
| 总题量 | 每章 12–18 题（含完形空位计分） |
| Section 1 | 阅读理解（约 5–7 题） |
| Section 2 | 词汇训练（约 4–5 题） |
| Section 3 | 完形填空（1 篇短文，6–8 个空位） |
| 导航模式 | **Hub-and-Spoke**：概览页展示三 Section 卡片，点击任意卡片进入；完成该 Section 后**自动返回概览** |
| 完成条件 | 三个 Section 均完成后，概览页出现 **Submit Quiz**；统一计分并进入结果页 |
| 通关规则 | **总分 ≥ 80%**（三 Section 合并计分）；未通过可整章重考 |
| 进度展示 | 每张 Section 卡片实时显示 **正确数/总题数**（如 `5/7`）；概览顶部显示三 Section 合计进度条 |

### Section 1：阅读理解（Reading Comprehension）

| 题型 | 说明 | 示例 |
|------|------|------|
| 主旨题 | 本章主要讲什么 | What is the main problem in this chapter? |
| 细节题 | 人物/事件/地点 | Where does the first owl deliver its letter? |
| 推理题 | 根据上下文推断 | Why do the Dursleys dislike talking about the Potters? |
| 情感/态度题 | 人物感受 | How does Harry feel when he first sees the snake? |
| 顺序题 | 事件排序 | Drag events into the correct order |

**设计要点**

- 本 Section 内仅出现理解类题目，进度条独立
- 题干与选项控制在对应 Lexile 区间
- 每题即时判定 + 解析；难题附「回书找答案」页码提示
- 最后一题提交后点 **Back to Quiz →** 返回概览；未答完的题目下次进入时从**第一道未答题**继续
- 概览卡片显示本节累计得分（已答正确的题数 / 本节总题数）

### Section 2：词汇训练（Vocabulary Training）

| 题型 | 说明 |
|------|------|
| 释义选择 | 选择单词在本章语境中的含义 |
| 语境填空 | 用本章目标词完成句子 |
| 近义/反义 | 与预习词相关的语义关系 |
| 词形变化 | 过去式、复数、词性转换 |
| 听音辨词 | TTS 播放，选出听到的词 |

**设计要点**

- 本 Section 内仅出现词汇类题目，进度条独立
- 错题自动加入生词本，进入间隔复习队列
- 与 Section 1、Section 3 在 UI 上明确区分（图标、配色、标题）
- 完成全部题目后返回概览；卡片显示 **正确数/总题数**
- **与 Section 3 的区别**：本节为**单句**词汇题（含 `context_cloze` 四选一）；Section 3 为**连贯段落**多空位完形，考查语境中的综合运用

### Section 3：完形填空（Cloze Passage）

参考 [Cambridge PET Reading Part 6（Open Cloze）](https://www.cambridgeenglish.org/exams-and-tests/preliminary/) 的呈现形式，结合儿童章节阅读场景做适龄化改造。

#### 与 PET Part 6 的对照

| 维度 | PET Part 6（B1 官方） | SpellRead Section 3（适龄化） |
|------|----------------------|------------------------------|
| 文本长度 | 约 120–150 词，单段 | **1–3 段**，约 120–220 词 |
| 空位数 | 6 个 | **6–8 个**（按章节 Lexile 浮动） |
| 空位内容 | 以语法功能词为主（介词、代词、连词等） | **以本章目标词汇为主**（≥ 60%），辅以少量语法/情节词 |
| 作答方式 | 开放式，每空一词，无选项 | 按难度分档：**词库拖拽** 或 **开放式输入**（见下） |
| 文本来源 | 独立邮件/博文等 | **原创章节摘要**（复述情节，不引用原著大段原文） |
| 计分 | 每空 1 分 | 每空 1 分；拼写错误不计分（同 PET） |

#### 题型分档（自适应）

根据 `vocabLevel` / 章节 Lexile 自动选择呈现模式，家长端可手动覆盖。

| 模式 | 适用 | 交互 | 说明 |
|------|------|------|------|
| **Guided Cloze**（引导式） | Lexile &lt; 900 或 vocabLevel / clozeLevel 较低 | 词库（Word Bank）点选填入空位 | 词库 = 本章 6–10 个目标词 + 2–3 个干扰项；降低挫败感 |
| **Open Cloze**（开放式） | Lexile ≥ 900 且词汇/完形水平较高 | 每空一个文本输入框 | 贴近 PET；接受 `acceptAlternatives` 中的同义/词形变体 |

> Guided 与 Open 可共存于同一内容包：低难度显示词库，高难度隐藏词库仅留输入框。

#### 空位类型

| 类型 | 占比（建议） | 示例 | 设计意图 |
|------|-------------|------|----------|
| `vocabulary` | 60–70% | The Dursleys tried to act ___ toward their neighbors. → `normal` | 巩固预习与 Section 2 目标词 |
| `plot` | 15–25% | Harry slept in a ___ under the stairs. → `cupboard` | 检验情节记忆（非生僻词） |
| `grammar` | 10–20% | People whispered ___ the Potters. → `about` | 高阶学员 PET 式语法/搭配训练 |

#### 段落与命题规范

1. **段落数**：1–3 段；情节简单章用 1 段，多线叙事可用 2–3 段分段落呈现
2. **叙述视角**：第三人称过去时，与原著叙事一致
3. **空位分布**：避免连续两空相邻；首段至少 1 空、末段至少 1 空
4. **提示策略**：
   - Guided 模式：词库外不提供额外提示
   - Open 模式：可显示 `(n.)` / `(v.)` 等词性提示；难题附 `pageHint`
5. **版权**： passage 为编辑撰写的**情节摘要**，不复制 Rowling 原文句式；空位答案词可来自词表

#### 交互与判定

- 全文先只读展示标题 + 段落，空位以 `(1) ______` 编号标注
- 用户可**先通读全文**再逐空作答（对齐 PET 策略：read whole text first）
- 全部空位填完后 **Submit Passage**，计分后**自动返回概览**
- 已完成的 Section 再次点击进入可查看完形解析反馈；修改答案后重新提交可更新概览得分
- 判定规则：
  - 大小写不敏感；首尾空格忽略
  -  contractions：`don't` 计两词，PET 规则下不考察；儿童版避免 contraction 空位
  - `acceptAlternatives` 数组收录可接受变体（如 `disappeared` / `vanished` 若语境允许）
- 错题：关联 `relatedWord` 入生词本；解析展示完整句 + 本章语境说明

#### Section 3 计分

- 单独计分：`6/8 (75%)` 等形式，显示在概览卡片右侧
- 空位全部计入总分母；**不**因 Section 3 是「一题」而只算 1 分
- 完形未提交前，卡片显示 `0/N`；提交后更新为实际正确数

### 概览页交互（Hub）

| 行为 | 说明 |
|------|------|
| 点击 Section 卡片 | 进入对应 Section（任意顺序） |
| 卡片得分 | 右侧显示 `正确数/总题数` 与百分比；已完成 Section 显示 ✓ |
| 整体进度 | 顶部进度条 = 三 Section 正确数之和 / 总题数之和 |
| 中途离开 | Section 内 **← Back to Quiz** 随时返回概览，已答题目保留 |
| 提交测验 | 三 Section 均完成后，底部出现 **Submit Quiz →**，进入总结果页 |
| 已通过重进 | 本章已通关时进入 Quiz 显示**上次成绩**；**Retake Quiz** 需确认，会清空完成状态与上次结果 |

### 结果页

- **Overall**：总分与是否通关
- **Section 1 得分**：理解题 correct/total（%）
- **Section 2 得分**：词汇题 correct/total（%）
- **Section 3 得分**：完形空位 correct/total（%）
- 未通过：整章重考（三 Section 题目重新随机）或回读章节

### 线框：Quiz 概览页（Hub）

```
┌─────────────────────────────────────────┐
│  ← Back to reading                       │
│  Chapter Quiz · The Vanishing Glass      │
│  Tap any section to begin.               │
├─────────────────────────────────────────┤
│  Overall progress          12/17         │
│  ████████████░░░░░░                      │
├─────────────────────────────────────────┤
│  ┌───────────────────────────────────┐  │
│  │ 📖 Section 1: Reading Comp.  5/6  │  │  ← 可点击
│  │    理解本章情节与人物        83%  │  │
│  └───────────────────────────────────┘  │
│  ┌───────────────────────────────────┐  │
│  │ ✨ Section 2: Vocabulary     4/4 ✓│  │  ← 可点击
│  │    巩固本章生词             100%  │  │
│  └───────────────────────────────────┘  │
│  ┌───────────────────────────────────┐  │
│  │ 📝 Section 3: Cloze Passage  0/7  │  │  ← 可点击
│  │    段落完形填空               0%  │  │
│  └───────────────────────────────────┘  │
├─────────────────────────────────────────┤
│  [ Submit Quiz → ]   （三节均完成后显示）│
└─────────────────────────────────────────┘
```

### 线框：Section 进行中（Section 1 / 2）

```
┌─────────────────────────────────────────┐
│  ← Back to Quiz                          │
│  📖 Section 1: Reading Comprehension     │
│  ████████░░  Question 4 of 6            │
├─────────────────────────────────────────┤
│  Why is Uncle Vernon angry at the end?  │
│  ○ ...  ○ ...  ○ ...  ○ ...             │
├─────────────────────────────────────────┤
│  [ Submit Answer ]                      │
│  [ Back to Quiz → ]  （最后一题后出现）  │
└─────────────────────────────────────────┘
```

### 线框：Section 3 — Guided Cloze（词库模式）

```
┌─────────────────────────────────────────┐
│  ← Back to Quiz                          │
│  📝 Section 3: Cloze Passage             │
│  Read the passage, then fill each blank. │
├─────────────────────────────────────────┤
│  A Strange Boy                            │
│                                           │
│  The Dursleys were proud to be (1) ___,   │
│  but people sometimes (2) ___ about the   │
│  Potters. When the dark wizard (3) ___,    │
│  wizards across Britain (4) ___.          │
│                                           │
│  Word Bank:  normal · whispered ·         │
│  vanished · rejoiced · peculiar · survive │
├─────────────────────────────────────────┤
│  [ Submit Passage ]  → 自动返回概览        │
└─────────────────────────────────────────┘
```

### 线框：Section 3 — Open Cloze（开放式，高阶）

```
┌─────────────────────────────────────────┐
│  ← Back to Quiz                          │
│  📝 Section 3: Cloze Passage             │
│  Write ONE word for each gap.             │
├─────────────────────────────────────────┤
│  Harry had a thin face and (1) [______]   │
│  hair. He lived with the Dursleys, who    │
│  treated him very (2) [______].           │
│                                           │
│  Tip: Read the whole passage before you   │
│  start filling in the gaps.               │
├─────────────────────────────────────────┤
│  [ Submit Passage ]  → 自动返回概览        │
└─────────────────────────────────────────┘
```

### 线框：总结果页

```
┌─────────────────────────────────────────┐
│  🎉 Chapter Complete!                    │
│  Overall: 82% (14/17)                   │
├──────────┬──────────┬───────────────────┤
│ 📖 Comp  │ ✨ Vocab │ 📝 Cloze          │
│  5/6 83% │ 4/4 100% │ 5/7 71%           │
├──────────┴──────────┴───────────────────┤
│  [ Back to Map ]                        │
└─────────────────────────────────────────┘
```

### 内容包数据结构（`quiz.cloze`）

每章 JSON 包含 `quiz.cloze` 对象（已写入 `ChapterContent` 类型）：

```json
{
  "quiz": {
    "comprehension": [ "..." ],
    "vocabulary": [ "..." ],
    "cloze": {
      "id": "cloze-ch01",
      "title": "A Strange Boy",
      "paragraphs": [
        "The Dursleys were proud to be (1) ___, but people sometimes (2) ___ about the Potters.",
        "When the dark wizard (3) ___, wizards across Britain (4) ___.",
        "Baby Harry was the only one who seemed to (5) ___ that terrible night."
      ],
      "gaps": [
        {
          "id": 1,
          "answer": "normal",
          "acceptAlternatives": [],
          "gapType": "vocabulary",
          "relatedWord": "normal",
          "explanation": "The Dursleys value being ordinary and unremarkable.",
          "pageHint": "p. 6"
        },
        {
          "id": 2,
          "answer": "whisper",
          "acceptAlternatives": ["whispered"],
          "gapType": "vocabulary",
          "relatedWord": "whisper",
          "explanation": "People spoke quietly about the Potters' strange history."
        }
      ],
      "wordBank": [
        "normal", "whisper", "vanished", "rejoiced", "survive",
        "peculiar", "shouted", "forgot"
      ],
      "guidedMode": true,
      "openMode": true
    }
  }
}
```

| 字段 | 必填 | 说明 |
|------|------|------|
| `title` | ✓ | 短文标题（原创，点明本章主题） |
| `paragraphs` | ✓ | 1–3 个字符串；空位用 `(n) ___` 占位，与 `gaps[].id` 对应 |
| `gaps` | ✓ | 6–8 项；`answer` 为首选答案 |
| `wordBank` | Guided 时必填 | 目标词 + 干扰项；Open 模式可省略或仅作复习展示 |
| `guidedMode` / `openMode` | 可选 | 控制该章是否启用某模式；默认由自适应引擎决定 |

### 内容生产流程（Editorial）

1. **选词**：从本章 `vocabulary` 数组取 Tier 1–2 词为主，6–8 个入空
2. **写摘要**：编辑撰写 1–3 段原创情节复述（120–220 词），确保每空上下文足够
3. **挖空**：优先挖目标词；高 Lexile 章可加 1–2 个 `grammar` 空（介词、连词）
4. **词库**：Guided 模式干扰项与正确项词性/长度相近，避免一眼可排除
5. **QA 清单**：
   - [ ] 空位答案唯一或 `acceptAlternatives` 已列全
   - [ ] 通读全文后每空可仅凭上下文推出
   - [ ] 无原著逐句复制
   - [ ] 与 Section 2 单句 `context_cloze` 不重复同一 `(stem, answer)` 组合

---

## 4.2 章节概览（Chapter Overview）

原「Chapter Preview」页面更名为 **Chapter Overview**，作为单章学习枢纽：顶部展示 **Reading** 与 **Quiz** 状态卡片，下方保留词汇预习、背景导读与 Mini Check。

### Reading / Quiz 状态卡片

概览页顶部以两张可点击卡片呈现本章进度：

| 卡片 | 跳转 | 状态展示 |
|------|------|----------|
| **Reading** | `/read` | **Not started** / **In progress** / **Completed ✓**（阅读页点击「完成阅读」后） |
| **Quiz** | `/quiz` | **N/M sections done**（已完成 Section 数 / 总 Section 数）；通关后显示 **Passed ✓** 与最佳得分 |

**Reading 完成判定**

- 用户在阅读页点击 **I'm Done Reading** 后，`ChapterProgress.readingCompleted = true`，`status` 变为 `quiz_pending`
- Overview 的 Reading 卡片显示 **Completed ✓** 及阅读分钟数

**Quiz Section 进度**

- 每完成一个 Quiz Section（理解 / 词汇 / 完形）并返回 Quiz 概览后，进度写入 `ChapterProgress.quizDraft.completedSections`
- Overview 的 Quiz 卡片显示如 `2/3 sections done`
- 章节 Quiz 通关（`status = completed`）后显示 **Passed ✓**

### 线框：Chapter Overview

```
┌─────────────────────────────────────────┐
│  ← Back to map          Go to Reading → │
│  Chapter Overview                        │
│  Book 1 · Chapter 2: The Vanishing Glass │
├──────────────────┬──────────────────────┤
│  📖 Reading      │  ❓ Quiz              │
│  Read in your    │  Comprehension,      │
│  own book        │  vocabulary & cloze  │
│     Completed ✓  │         2/3          │
│        18 min    │    sections done     │
├──────────────────┴──────────────────────┤
│  Words learned  ████████░░  8/12        │
│  📜 Background · vocabulary cards · ...  │
└─────────────────────────────────────────┘
```

### 词汇预习与背景导读

（见核心用户旅程。）

### 快捷跳转：Go to Reading

概览页右上角提供 **「Go to Reading →」** 链接，允许跳过剩余词汇卡片和 Mini Check，直接进入阅读计时页。

| 项目 | 说明 |
|------|------|
| 位置 | Overview 页顶栏右侧（词汇学习、Mini Check 各阶段均可见） |
| 行为 | 若本章预习未完成，自动标记为 `reading` 状态后跳转 |
| 用途 | 测试流程、已熟悉词汇的孩子快速进入阅读 |
| 与正常流程关系 | 不阻断正常预习路径；跳过后仍可回地图重进 Overview |

### 路由

| 路径 | 页面 |
|------|------|
| `/book/:book/chapter/:chapter/overview` | Chapter Overview（主入口） |
| `/book/:book/chapter/:chapter/preview` | 重定向至 `overview`（兼容旧链接） |

---

## 4.10 Debug 模式（开发 / 测试）

首页底部提供 **Debug Mode** 开关，仅供测试与内容 QA 使用。

| 项目 | 说明 |
|------|------|
| 位置 | 首页底部虚线框区域（Parent Dashboard 下方） |
| 开启后 | Book 1 全部 17 章 + **Ch.0 Test Sandbox** 由 `locked` 变为可进入 |
| 关闭后 | 不重新锁定已解锁章节（保留当前进度） |
| 持久化 | 存入 `localStorage`（`AppState.debugMode`） |
| 生产环境 | 正式版可隐藏或移至家长 PIN 保护区域 |

```
┌─────────────────────────────────────────┐
│  Debug Mode          [ OFF / ON ]       │
│  Unlock all chapters + Ch.0 sandbox     │
└─────────────────────────────────────────┘
```

### Ch.0 Test Sandbox（测试章）

Debug Mode 开启后，地图显示 **🧪 Test** 格子（Chapter 0），用于反复测试 Overview 上 Reading / Quiz 状态卡片与完整流程，**不影响** Chapters 1–17 的解锁进度。

| 项目 | 说明 |
|------|------|
| 内容 | 精简词表、2 道理解题、2 道词汇题、3 空完形；无原著情节 |
| 入口 | 首页地图 · Debug Mode ON → 点击 **Test** |
| 重置 | Overview 页 **Reset Ch.0 progress** 一键清空阅读 / Quiz 草稿 |
| 隔离 | 通过 Quiz 不调用 `unlockNextChapter`；不计入「首章完成」徽章 |

---

## 相关模块（摘要）

- **自适应**：分别追踪 `comprehensionLevel`、`vocabLevel` 与 `clozeLevel`；Guided / Open Cloze 按 Lexile 与历史得分切换；家长端周报展示薄弱 Section
- **激励**：Quiz 通关 +30 House Points；结果页展示三 Section 得分
- **信息架构**：`Books → Chapter → Overview（词汇 + 状态卡片）→ Read / Quiz`；Quiz 内含 Hub 与三 Section 子页
- **实现状态**：三 Section Quiz（含完形填空）与 Hub 导航**已上线**（`QuizPage.tsx`、`ClozePassageView.tsx`、`quiz.cloze` 内容包）

完整架构、版权与迭代路线见项目 README 与 `docs/` 目录。
