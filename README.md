# 📼 ShiftCal | 手写排班转 iOS 日历助手

<p align="center">
  <img src="public/pwa-512x512.png" width="128" height="128" alt="ShiftCal Logo" style="border-radius: 28px; box-shadow: 0 8px 24px rgba(0,0,0,0.5);" />
</p>

<p align="center">
  <strong>专为零售、餐饮、倒班工作者打造的多模态排班识别与 iCalendar (.ics) 日历导出工具</strong><br>
  拍照识别手写排班表，智能推导班次与跨年时间，一键秒级同步至 Apple 日历、Google Calendar 与各类主流日程应用。
</p>

<p align="center">
  <a href="https://vuejs.org/"><img src="https://img.shields.io/badge/Vue-3.5-42b883?style=flat-square&logo=vuedotjs" alt="Vue 3"></a>
  <a href="https://vitejs.dev/"><img src="https://img.shields.io/badge/Vite-8.3-646CFF?style=flat-square&logo=vite" alt="Vite"></a>
  <a href="https://tailwindcss.com/"><img src="https://img.shields.io/badge/TailwindCSS-3.4-38B2AC?style=flat-square&logo=tailwind-css" alt="Tailwind CSS"></a>
  <a href="https://web.dev/progressive-web-apps/"><img src="https://img.shields.io/badge/PWA-Ready-E8F624?style=flat-square&logo=pwa&logoColor=black" alt="PWA Ready"></a>
  <a href="https://datatracker.ietf.org/doc/html/rfc5545"><img src="https://img.shields.io/badge/RFC-5545_iCalendar-007ACC?style=flat-square" alt="RFC 5545"></a>
  <a href="#license"><img src="https://img.shields.io/badge/License-MIT-green?style=flat-square" alt="License"></a>
</p>

---

## ⚡ 为什么选择 ShiftCal？

在零售店、餐厅、医院或需要倒班的岗位中，排班表通常是**白板手写或打印表格手写勾画**后拍照发在群里。每次都需要逐日对照、手动在日历中新建日程，不仅费时费力，还极易看漏、看错。

**ShiftCal (排班日历助手)** 采用**实体复古磁带机（Cassette Deck）与《绝区零》(ZZZ) 工业机能风**设计，融合多模态大模型视觉能力，提供从“拍摄图片”到“一键加入手机日历”的全流程顺畅体验。

---

## ✨ 核心特性

### 🤖 1. 多模态视觉智能解析
- **主流模型无缝支持**：
  - 原生支持 **Google Gemini API**（如 `gemini-3.5-flash`、`gemini-3.8-flash`、`gemini-3.1-pro` 等）。
  - 支持 **OpenAI 兼容协议**（如 DeepSeek-VL、Qwen-VL、GPT-4o、Claude 兼容接口等）。
- **动态拉取模型列表**：填入 Base URL 与 Key 即可一键拉取可用多模态模型，支持连通性自检。
- **纯客户端隐私安全**：所有 API 请求直接由浏览器端发出，密钥仅加密存储在本地 LocalStorage，**不设中转服务器，绝不存储用户任何排班隐私**。

### 👥 2. 全员排班与对照透视矩阵
- **单人模式**：输入本人姓名，精准识别个人每日排班与休息。
- **全员提取模式**：一张排班表同时提取所有同事的排班数据。
- **全员对照透视（Matrix View）**：
  - 同屏表格横向展示所有同事在相同日期的出勤状态。
  - 换班、代班、对班一目了然，协调值班不再反复切换图片。
- **个人明细视轨（Individual View）**：
  - 卡片式展示每日班次、起止时间、工时统计与休假汇总。

### 🧠 3. 智能时间推导与置信度质检
- **防跨年翻年错误**：自动注入客户端真实运行日期，智能计算排班月份与年份关系（例如在 12 月底处理 1 月的排班时，自动顺延年份为下一年度，拒绝年份回退）。
- **低置信度视觉预警**：对潦草字迹、模糊或涂改部分，AI 自动判定置信度。小于 0.7 的项目高亮提醒复核，杜绝排班看漏。

### ✏️ 4. 交互式排班微调与预设班次
- **内置常见零售/倒班预设**：
  - `9-6` (09:00 - 18:00) 早班
  - `10-7` (10:00 - 19:00) 常规班
  - `11-8` (11:00 - 20:00) / `12-9` (12:00 - 21:00) 中班
  - `1330` (13:30 - 22:30) 晚中班
  - `2-11` (14:00 - 23:00) 晚班打烊
  - `8-5` / `7-4` 清晨班
  - `X` / `Vacay` / `Compl(t)` 休假
- 点击任意单元格即可弹窗微调时间、修改备注与班次类型。

### 📅 5. 严格 RFC 5545 标准与 iOS 深度优化
- **完整 iCalendar 协议**：严格遵循 RFC 5545 规范（含 75 字符换行折叠、全天日程次日 DTEND 不闭合区间修正、Asia/Shanghai 时区支持）。
- **iOS Safari 特别适配**：提供直接打开、webcal 数据流及文件下载等方式，解决 iOS 浏览器无法直接拉起日历导入的痛点。
- **智能提醒策略**：
  - 支持仅对本人排班设置上班前提醒（如提前 60 分钟），避免全员日程轰炸日历闹钟。
  - 支持自主选择是否将“休假”导出为全天日历事件。

### 📼 6. 实体磁带拟物机能美学 (ZZZ Style)
- 灵感来自《绝区零》的工业机能风 UI，高对比度黑金酸性黄配色 (`#111215`, `#1E2024`, `#E8F624`)。
- 拟物化卡带插槽、转轮动效、工业按键质感与斑马警示纹。
- 搭载 `Unbounded Sans` 与 `JetBrains Mono` 字体，极具机械潮酷质感。

### 📱 7. PWA 渐进式离线应用
- 完整的 Manifest 与 Service Worker 缓存，静态资源即开即用。
- 在 Safari 或 Chrome 中可直接**添加到主屏幕**，获得如原生 App 般的独立窗口全屏体验。

---

## 🛠️ 技术栈

| 模块 | 技术选型 | 说明 |
| :--- | :--- | :--- |
| **前端框架** | [Vue 3](https://vuejs.org/) (Composition API / `<script setup>`) | 响应式状态与组件化架构 |
| **构建工具** | [Vite 8](https://vitejs.dev/) | 毫秒级冷启动与极速 HMR |
| **CSS 样式** | [Tailwind CSS 3](https://tailwindcss.com/) + PostCSS | 自定义机能风工业配色与拟物组件 |
| **图标库** | [Lucide Vue Next](https://lucide.dev/) | 现代线性风格图标 |
| **日历协议** | RFC 5545 (iCalendar `.ics`) | 跨平台日程协议，适配 Apple / Google / Outlook |
| **PWA 支持** | `vite-plugin-pwa` + Workbox | 离线缓存、Manifest、主屏幕安装 |
| **图形生成** | [Sharp](https://sharp.pixelplumbing.com/) | 自动生成全套多尺寸 PWA 与 Apple Touch 图标 |
| **交互特效** | `canvas-confetti` | 导入成功仪式感反馈 |

---

## 🚀 快速开始

### 1. 环境准备
确保本地安装了 **Node.js 18.0+** 以及包管理器 **npm**（或 pnpm / yarn）。

### 2. 克隆与安装依赖
```bash
# 克隆仓库
git clone https://github.com/il057/ShiftCal.git

# 进入目录
cd ShiftCal

# 安装项目依赖
npm install
```

### 3. 本地启动开发服务
```bash
npm run dev
```
打开浏览器访问控制台输出的地址（通常为 `http://localhost:5173/`）。

### 4. 生产环境构建与预览
```bash
# 打包构建
npm run build

# 本地预览打包产物
npm run preview
```

### 5. 重新生成 PWA 矢量图标（可选）
项目中内置了基于 Sharp 的全尺寸图标生成脚本：
```bash
node generate-icons.js
```
该脚本会自动根据内置矢量 SVG 生成 `favicon.png`、`apple-touch-icon.png`、`pwa-192x192.png`、`pwa-512x512.png`。

---

## 🔑 API 配置指南

使用前，请点击界面右上角的 **「API 配置」** 按钮：

### 选项 A：使用 Google Gemini（推荐）
1. 前往 [Google AI Studio](https://aistudio.google.com/) 免费创建 API Key。
2. 在 ShiftCal 设置面板中：
   - **服务商**：选择 `Google Gemini`
   - **Base URL**：默认为 `https://generativelanguage.googleapis.com`（国内若有自建反代可直接填反代地址）
   - **API Key**：填入你的 Gemini Key
3. 点击 **「拉取模型列表」**，推荐选择 `gemini-2.5-flash` 或 `gemini-1.5-flash`（视觉识别能力强且速度极快）。
4. 点击 **「连通性测试」**，验证成功后保存。

### 选项 B：使用 OpenAI 兼容协议
1. 支持如 DeepSeek-VL、Qwen-VL、OpenAI GPT-4o、Moonshot 或自建 OneAPI / NewAPI / 硅基流动等聚合网关。
2. 在设置面板中：
   - **服务商**：选择 `OpenAI 兼容协议`
   - **Base URL**：例如 `https://api.openai.com/v1` 或你的第三方网关地址
   - **API Key**：填入对应的访问令牌
3. 点击 **「拉取模型列表」**，选择具有 **视觉输入能力（Vision / Multimodal）** 的模型。

---

## 📖 使用步骤

```mermaid
graph LR
    A[📷 拍摄 / 上传排班表] --> B[⚙️ 选择提取模式]
    B --> C[⚡ AI 视觉自动结构化]
    C --> D[🔍 置信度核对与微调]
    D --> E[📅 导出 .ics / 一键导入 iOS]
```

1. **导入卡带（上传图片）**：
   - 点击磁带插槽选择图片、直接拍照、拖拽图片放入，或在页面直接 `Ctrl+V` / `Cmd+V` 粘贴截图。
   - 新手也可点击下方 **「装填示例排班卡带」** 快速体验。
2. **选择提取策略**：
   - 提取个人排班：可指定姓名，专注个人日程。
   - 提取全员排班：全店/全组排班一次性解析。
3. **核对与修正**：
   - 查看识别卡片，低置信度（< 0.7）项目会自动显示醒目提示。
   - 点击单元格唤起编辑抽屉，可快捷点击常用班次进行更正。
4. **导出日历**：
   - 点击 **「导出日历 (.ics)」** 打开操作抽屉。
   - iPhone / iPad 用户：点击 **「在日历中打开」**，Safari 将直接唤起 iOS 日历完成一键批量添加。
   - Mac / Windows / Android 用户：下载 `.ics` 文件后双击或导入至 Outlook / 飞书 / 谷歌日历。

---

## 📂 项目结构

```text
ShiftCal/
├── .github/
│   └── workflows/
│       └── deploy.yml          # GitHub Actions 自动化构建部署至 GitHub Pages
├── public/
│   ├── favicon.svg             # 网站矢量图标
│   ├── apple-touch-icon.png    # iOS 主屏幕图标
│   ├── pwa-192x192.png         # PWA 标准尺寸图标
│   ├── pwa-512x512.png         # PWA 高清尺寸图标
│   └── fonts/                  # 本地中英文机能风格字体
├── src/
│   ├── assets/
│   │   └── main.css            # Tailwind 基础指令与 ZZZ 工业拟物自定义样式
│   ├── components/
│   │   ├── ApiSettingsModal.vue   # API 密钥、Base URL 与模型拉取配置弹窗
│   │   ├── ExportActionSheet.vue  # RFC 5545 日历导出与 iOS 唤起操作抽屉
│   │   ├── HistoryList.vue        # 历史排班卡带归档库
│   │   ├── ImageUploader.vue      # 拟物化复古磁带上传插槽与交互
│   │   ├── ShiftEditorModal.vue   # 单日班次与工时微调编辑弹窗
│   │   └── ShiftGridView.vue      # 个人视轨与全员对照透视矩阵组件
│   ├── composables/
│   │   ├── useConfig.js           # API 配置管理、持久化与模型列表拉取
│   │   ├── useIcsExporter.js      # 日历文件触发与下载逻辑
│   │   ├── useScheduleHistory.js  # 本地排班历史记录管理
│   │   └── useScheduleParser.js   # 多模态 API 解析、Prompt 组装与跨年时间推算
│   ├── utils/
│   │   ├── icsHelper.js           # RFC 5545 标准 iCalendar 文本生成引擎
│   │   └── presets.js             # 预设班次映射、颜色标记与系统 Prompt 模板
│   ├── App.vue                    # 应用主外壳、顶部操控台与主流程装配
│   └── main.js                    # Vue 根入口
├── generate-icons.js              # 基于 Sharp 的 PWA 图标批处理生成脚本
├── index.html                     # HTML 页面骨架与 PWA Meta 标签
├── package.json                   # 项目依赖与 Scripts
├── tailwind.config.js             # Tailwind CSS 颜色与机能主题配置
└── vite.config.js                 # Vite 构建与 VitePWA 离线缓存规则配置
```

---

## 🌐 自动部署 (GitHub Actions)

本项目已配置完整的 GitHub Actions CI/CD 流水线（详见 [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml)）。
- 当代码推送到 `main` 分支时，将自动触发构建并部署至 **GitHub Pages**。
- 支持免自建服务器开箱即用。

---

## 🔒 隐私与安全性申明

1. **零服务端存储**：ShiftCal 是一个纯前端静态单页应用（PWA），不架设任何后端中转服务器。
2. **数据留存本地**：你的排班图片、API Key 及解析生成的排班记录仅存储在当前设备的浏览器 `LocalStorage` 中。
3. **接口直连**：排班图片仅通过直连方式发送给用户自己配置的 Google Gemini 或兼容端点，绝不流经任何第三方第三方代理。

---

## 📄 开源许可证

本项目基于 [MIT License](LICENSE) 开源。欢迎提交 Issue 或 Pull Request 共同改进！
