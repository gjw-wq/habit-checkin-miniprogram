# 打卡小程序技术设计（TECH_DESIGN）

## 技术栈

- 前端：微信小程序原生开发（WXML + WXSS + JavaScript，ES6）
- 框架/依赖：无（不使用 Vant Weapp 等组件库，日历自实现）
- 数据存储：微信本地存储 wx.setStorageSync / wx.getStorageSync
- 开发环境：Windows + 微信开发者工具（appid 使用 touristappid）

## 项目结构

```
02-habit-checkin-miniprogram/
  project.config.json        # 项目配置
  sitemap.json               # 收录配置
  app.js                     # 小程序入口
  app.json                   # 全局配置（3 个页面注册）
  app.wxss                   # 全局样式（色板、卡片、按钮、进度条）
  pages/
    index/                   # 首页：项目卡片列表 + 打卡
    add/                     # 添加项目页
    detail/                  # 项目详情：信息 + 统计 + 日历 + 记录
  utils/
    storage.js               # 数据层：项目与打卡记录的增删查、防重复
    date.js                  # 日期工具：格式化、月天数、加减天
    stats.js                 # 统计算法：连续天数、最长连续、完成率
```

## 数据模型

### Project（打卡项目，存储于 key "checkin_projects"，数组）

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| id | string | 唯一 ID：时间戳 + 随机数 |
| name | string | 项目名称 |
| target | number | 目标天数（正整数） |
| created_at | number | 创建时间戳（ms） |

### CheckinRecord（打卡记录，存储于 key "checkin_records"，数组）

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| id | string | 唯一 ID |
| project_id | string | 关联项目 ID |
| date | string | 打卡日期 "YYYY-MM-DD" |
| note | string | 打卡备注，可为空 |
| created_at | number | 打卡时间戳（ms） |

## 关键技术点

1. **防重复打卡**：saveCheckin 先查询同 project_id + 同 date 的记录，存在则返回 null，由页面提示"今日已打卡"，保证数据层一致性。
2. **日历构建**：detail 页维护 `calYear/calMonth`，buildCalendar(year, month, dates, notes) 生成单元格数组：首行用空占位补齐星期偏移（new Date(year, month-1, 1).getDay()），每个格子含 day/dateStr/checked/isToday/isFuture/hasNote；WXML 用 grid-template-columns: repeat(7, 1fr) 渲染。
3. **日期安全解析**：不使用 `new Date("YYYY-MM-DD")`（iOS/Android 对连字符日期解析不一致），统一 split 后 `new Date(y, m-1, d)` 按本地时区构造；加减天数用 Date 的 setDate。
4. **连续天数算法**（getStreak）：若今天已打卡从今天起算，否则从昨天起算；逐日往前减一天检查打卡集合（用 Set 提升查找效率），直到断档。
5. **最长连续算法**（getLongestStreak）：日期排序去重后线性扫描，相邻日期差 1 天则累计，否则重置。
6. **完成率**：已打卡天数 / 目标天数，四舍五入为百分比，超过 100% 时界面封顶展示（进度条同理封顶）。
7. **删除项目**：先删项目，再按 project_id 过滤掉全部打卡记录，两 key 同步更新。
8. **打卡备注输入**：wx.showModal 开启 editable（基础库 2.17.1+），一个 API 同时完成"确认 + 输入备注"，无需自制弹层。
9. **刷新机制**：首页/详情页 onShow 全量重算；onPullDownRefresh 刷新后 stopPullDownRefresh。详情页通过 onLoad options.id 接收项目 ID。
