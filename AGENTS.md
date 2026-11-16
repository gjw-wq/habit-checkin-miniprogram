# 打卡小程序 AI 开发指令（AGENTS.md）

## 项目概述

习惯养成打卡微信小程序，原生开发（WXML/WXSS/JS），无框架、无 npm 依赖，日历组件自实现，数据全部存于微信本地 Storage。共三个页面：首页（项目列表 + 打卡）、添加项目页、项目详情页（日历 + 统计 + 记录）。

## 开发环境

- 操作系统：Windows
- 开发工具：微信开发者工具
- appid：touristappid（体验模式）
- 基础库：3.x（wx.showModal 的 editable 能力自 2.17.1 起可用）

## 开发规范

- 只使用微信小程序原生语法：WXML 用 wx:for / wx:if / wx:key，事件用 bindtap / bindlongpress / bindinput
- 数据读写一律通过 utils/storage.js；统计计算一律通过 utils/stats.js；日期处理一律通过 utils/date.js，页面不得自己拼日期逻辑
- 日期统一 "YYYY-MM-DD" 字符串；解析必须 split 后 new Date(y, m-1, d)，禁止 new Date("YYYY-MM-DD")
- 页面四件套齐全，新页面必须在 app.json 注册
- 需要下拉刷新的页面在 .json 配置 "enablePullDownRefresh": true，并在 onPullDownRefresh 中 wx.stopPullDownRefresh()
- 颜色语义固定：打卡/完成 #07C160，今天强调 #576B95，未完成 #CCCCCC，主色 #07C160

## 代码风格

- 缩进 2 空格；字符串与对象键一律 ASCII 直引号，禁止中文弯引号
- 函数名 camelCase；常量 UPPER_SNAKE_CASE；WXML class 命名 kebab-case
- WXSS 布局优先 Flex，日历用 Grid（repeat(7, 1fr)）；全局公共样式（卡片、按钮、进度条、空状态）写在 app.wxss
- 不留 TODO、占位符、注释掉的代码
- 界面文案全部中文

## 测试要求

每个功能完成后在微信开发者工具中手动验证：

1. 新建项目（空名称、非正整数目标天数均被拦截），保存后首页出现卡片
2. 打卡成功后：卡片绿色勾、按钮置灰、连续/总天数 +1、进度条前进；再次点击提示不可重复
3. 打卡带备注时，详情页日历点击当天可看到备注
4. 日历切换上/下个月正确渲染；今天蓝色边框；打卡日期绿色；未来日期不可点
5. 连续天数正确：今天已打卡则含今天；今天未打卡则从昨天起算；中间断一天连续数归零重计
6. 删除项目后首页消失且其打卡记录一并清除（重建同名项目不显示旧记录）
7. 空状态、下拉刷新、onShow 返回刷新均正常

## 注意事项

- 保持代码简洁，避免过度设计；日历以纯数据驱动渲染，不做复杂的自定义组件抽象
- 记录数据量小，全量读写即可，勿做分页或缓存
- 图标用 emoji 与纯 CSS 圆形色块，不引入任何图片资源
- 详情页"删除项目"必须二次确认，删除后 navigateBack
