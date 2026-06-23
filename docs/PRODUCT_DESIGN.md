# SpellRead 产品设计文档

> 面向 7–14 岁儿童的 Harry Potter 章节式英语阅读教练。  
> 对标 RAZ-Plus「预习 → 阅读 → 测验 → 进阶」闭环。

## 核心用户旅程（单章）

1. **Chapter Preview**（5–8 min）— 词汇预习 + 背景导读
2. **Read**（20–30 min）— 自备书阅读 + 计时器
3. **Chapter Quiz**（8–12 min）— **两个独立 Section**，顺序完成
4. **Review & Reward** — 错题解析、生词入本、House Points

---

## 4.4 章节 Quiz（Chapter Quiz）

参考 RAZ 将 **Comprehension Quiz** 与 **Vocabulary Quiz** 分为两个独立测验模块；SpellRead 在**同一章节测验流程内**以两个 Section 顺序呈现，而非混排。

### 整体结构

| 项目 | 说明 |
|------|------|
| 总题量 | 每章 10–15 题 |
| Section 1 | 阅读理解（约 6–9 题） |
| Section 2 | 词汇训练（约 4–6 题） |
| 流程 | 概览 → Section 1 全部做完 → Section 1 小结 → Section 2 全部做完 → 总结果 |
| 通关规则 | **总分 ≥ 80%**（两 Section 合并计分）；未通过可整章重考 |
| 间隔 | Section 1 结束后展示本节得分，可短暂休息再进入 Section 2 |

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
- Section 结束页显示：理解题得分 X/Y（Z%）

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
- 与 Section 1 在 UI 上明确区分（图标、配色、标题）

### 结果页

- **Overall**：总分与是否通关
- **Section 1 得分**：理解题 correct/total（%）
- **Section 2 得分**：词汇题 correct/total（%）
- 未通过：整章重考（两 Section 题目重新随机）或回读章节

### 线框：Quiz 概览页

```
┌─────────────────────────────────────────┐
│  Chapter Quiz · The Vanishing Glass      │
│  Two sections — complete one at a time   │
├─────────────────────────────────────────┤
│  Section 1: 📖 Reading Comprehension     │
│  理解本章情节与人物 · 7 questions        │
├─────────────────────────────────────────┤
│  Section 2: ✨ Vocabulary Training       │
│  巩固本章生词 · 5 questions              │
├─────────────────────────────────────────┤
│  [ Start Section 1 → ]                  │
└─────────────────────────────────────────┘
```

### 线框：Section 进行中

```
┌─────────────────────────────────────────┐
│  Section 1 of 2 · Reading Comprehension │
│  ████████░░  Question 4 of 7            │
├─────────────────────────────────────────┤
│  Why is Uncle Vernon angry at the end?  │
│  ○ ...  ○ ...  ○ ...  ○ ...             │
├─────────────────────────────────────────┤
│  [ Submit Answer ]                      │
└─────────────────────────────────────────┘
```

### 线框：Section 1 完成 → 进入 Section 2

```
┌─────────────────────────────────────────┐
│  📖 Reading Comprehension — Complete    │
│           5/7 (71%)                     │
│  Take a short break if you need one!    │
│  [ Start Section 2: Vocabulary → ]      │
└─────────────────────────────────────────┘
```

### 线框：总结果页

```
┌─────────────────────────────────────────┐
│  🎉 Chapter Complete!                    │
│  Overall: 83% (10/12)                   │
├──────────────┬──────────────────────────┤
│ 📖 Comp 6/7  │ ✨ Vocab 4/5             │
│    86%       │    80%                   │
├──────────────┴──────────────────────────┤
│  [ Back to Map ]                        │
└─────────────────────────────────────────┘
```

---

## 相关模块（摘要）

- **自适应**：分别追踪 `comprehensionLevel` 与 `vocabLevel`；家长端周报展示薄弱 Section
- **激励**：Quiz 通关 +30 House Points；结果页展示双 Section 得分
- **信息架构**：`Books → Chapter → Quiz`（内含 Section 1 / Section 2 子流程）

完整架构、版权与迭代路线见项目 README 与 `docs/` 目录。
