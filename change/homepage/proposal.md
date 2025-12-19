这份需求文档已经去除了文件结构等具体技术细节，专注于**
# 需求文档：App 通用营销与支持页 (Universal Marketing & Support Page)

## 1. 项目背景与目标

* **适用产品**：CleanPhoto (及其后续复用的其他 iOS 产品)
* **页面性质**：静态单页 (Single Page Website)
* **核心目标**：
1. **二合一功能**：同一个 HTML 页面需要同时满足“App Store 营销落地页”和“App Store 技术支持页”的需求。
2. **审核合规**：必须包含苹果审核要求的“联系方式”和“隐私政策入口”。
3. **高度可复用**：页面框架标准化，未来新 App 只需替换文案、图片和主题色即可发布。



---

## 2. 核心交互逻辑 (路由策略)

页面需根据 URL 的不同，展示不同的视觉重心（通过 HTML 锚点实现）：

1. **场景 A：营销落地页 (Marketing URL)**
* **访问地址**：`http://s.ververv.com/photocleaner/` (示例)
* **交互表现**：用户打开页面，默认显示顶部的 **[产品首屏]**，浏览顺序为：首屏 -> 功能介绍 -> 底部支持。


2. **场景 B：技术支持页 (Support URL)**
* **访问地址**：`http://s.ververv.com/photocleaner/#support`
* **交互表现**：用户打开页面，浏览器自动滚动定位到页面的 **[支持中心]** 区域。
* **目的**：让审核人员和寻求帮助的用户直接看到 FAQ 和联系方式。



---

## 3. 页面内容模块需求

页面按垂直流式布局，共分为 4 个核心模块：

### 模块一：产品首屏 (Hero Section)

* **展示目的**：一句话讲清楚产品卖点，引导下载。
* **需展示元素**：
* **App Icon**：产品图标（圆角矩形）。
* **Product Name**：`CleanPhoto`
* **Slogan (主标题)**：`Don't waste time cleaning photos.`
* **Sub-Slogan (副标题)**：`AI-Powered Storage Cleaner. 100% Privacy. Zero Ads.`
* **Action**：`Download on the App Store` 按钮（黑色徽章样式）。



### 模块二：核心功能亮点 (Key Features)

* **展示目的**：展示 App 核心界面和能力。
* **布局建议**：图文交替或网格布局。
* **内容配置**：
1. **智能清理 (Smart Cleanup)**
* *文案*：Find duplicates and similar photos with >99% accuracy.
* *配图*：清理界面截图 (Cleanup Tab UI)。


2. **AI 整理 (AI Album)**
* *文案*：Automatically organize photos by People, Pets, and Scenes.
* *配图*：AI 相册界面截图 (AI Album Tab UI)。


3. **隐私承诺 (Privacy First)**
* *文案*：All processing happens locally on your device. No cloud uploads.
* *配图*：隐私/安全相关的插图或图标。





### 模块三：支持中心 (Support Center) —— **审核关键点**

* **技术要求**：该区域必须设置 HTML ID 为 `support` (即 `<section id="support">`)。
* **视觉区分**：建议使用不同的背景色（如浅灰），以示区分。
* **包含内容**：
1. **Section Title**：`App Support & FAQ`
2. **常见问题 (FAQ)**：采用折叠式或列表式展示（具体文案见第 4 部分）。
3. **联系按钮 (Contact)**：
* *按钮文案*：`Contact Support`
* *交互行为*：点击唤起邮件客户端 (`mailto:support@ververv.com`)，并自动预填邮件标题。





### 模块四：页脚 (Footer)

* **包含内容**：
* 版权信息：`© 2026 Ververv.com`
* **重要链接**：`Privacy Policy` (链接到同目录下的 privacy 页面) | `Terms of Use`



---

## 4. 详细文案内容 (Copywriting)

请直接使用以下英文文案填充页面，以适应海外市场。

### 4.1 FAQ 内容 (针对 CleanPhoto 定制)

* **Q: Is CleanPhoto free to use?**
* A: We offer a 3-day free trial with full access to all features. After the trial, it is a paid subscription. You can cancel anytime in your Apple ID settings.


* **Q: Are my photos safe?**
* A: Yes, absolutely. CleanPhoto processes all your photos locally on your iPhone. We do not upload your photos to any server. Your privacy is our priority.


* **Q: If I delete a photo, is it gone forever?**
* A: No. Deleted photos are moved to the "Recently Deleted" album in your system Photos app. They will be kept there for 30 days before being permanently removed by iOS. You can recover them anytime within that period.


* **Q: How do I restore my purchase?**
* A: Go to CleanPhoto Settings > Premium, and tap "Restore Purchase".



### 4.2 邮件预填内容 (Mailto配置)

* **收件人**: `support@ververv.com`
* **邮件标题 (Subject)**: `CleanPhoto Support Request`
* **邮件正文 (Body)**:
> Device: iPhone
> iOS Version:
> App Version: 1.0
> Please describe your issue here:



---

## 5. UI 设计规范

* **设计风格**：Clean & Minimalist (参考 iOS 原生设计风格)。
* **响应式设计 (Mobile First)**：重点适配手机屏幕（因为 99% 的流量来自 App Store 跳转），同时兼容桌面端浏览。
* **配色方案**：
* 主色调：`#007AFF` (iOS Blue) - 用于按钮和链接。
* 背景色：白色 或 浅灰 (`#F5F5F7`)。
* 文字色：深灰/黑 (`#1D1D1F`)。


* **字体**：系统默认无衬线字体 (San Francisco / Roboto / Helvetica Neue)。