# HVAC / BTU / CFM / Dehumidifier Size 免费工具站完整开发计划

日期：2026-05-22

关联需求文档：`docs/hvac-tool-site/requirements.md`

项目方向：Room AC BTU / Portable AC / Dehumidifier Size / CFM / ACH / Bathroom Fan Calculator

目标站点定位：

> Home comfort calculator hub for room AC BTU, portable AC sizing, dehumidifier pint size, CFM by ACH, bathroom fan sizing, garage ventilation, and basic HVAC unit conversions.

---

## 1. 开发原则

本开发计划严格按照需求分析文档执行。第一版不是专业 HVAC 设计软件，不是 Manual J / Manual S / Manual D 替代品，不是霉菌、健康或施工安全诊断工具，而是面向普通家庭用户、租房者、地下室/车库/卧室改善用户、空调/除湿机购买前用户和轻度 DIY 通风用户的 home comfort calculator hub。

第一版必须坚持以下边界：

- 不做 Manual J load calculation 替代品。
- 不做 Manual S 设备最终选型。
- 不做 Manual D duct design。
- 不做全屋中央空调或 heat pump 最终 sizing。
- 不做 wire size、breaker size、refrigerant、gas furnace、combustion safety。
- 不做 mold / asthma / allergy / health diagnosis。
- 不承诺某个空调、除湿机或风扇一定能解决用户问题。
- 不把 HVAC contractor lead 伪装成免费工具结果。
- 不做商业厨房、燃气设备、商业车库、实验室、工业通风、洁净室 sizing。
- 不做 code-compliant duct design。

第一版核心价值：

- 用户输入房间尺寸、面积、层高、日照、人数、厨房、湿度程度、ACH、CFM 等低敏感数据。
- 浏览器端即时输出 BTU/h、tons、dehumidifier pints/day、CFM、ACH、bathroom fan CFM。
- 结果以范围呈现，不给伪精确单点答案。
- 每个结果显示公式、假设、调整项、限制和下一步检查清单。
- 用户可以复制结果、复制假设、分享 URL、下载 CSV、浏览器打印保存 PDF。
- 每个页面都有公式、worked example、assumptions、what is included、what is not included、professional boundary disclaimer、官方来源、FAQ 和相关工具。

---

## 2. 已收集资料与使用方式

### 2.1 官方 / 高可信资料

开发和内容写作优先使用以下资料：

- DOE Room Air Conditioners：用于 room AC BTU 初估、20 BTU/ft² 经验规则、oversizing 会影响除湿的说明。
  - https://www.energy.gov/energysaver/room-air-conditioners

- DOE FEMP Room Air Conditioner 采购指南：用于解释为什么房间空调应匹配空间大小，过大设备会增加购买和运行问题。
  - https://www.energy.gov/eere/femp/purchasing-energy-efficient-room-air-conditioners

- ENERGY STAR Room Air Conditioners：用于购买导向内容和能效参考入口。
  - https://www.energystar.gov/products/room_air_conditioners

- ENERGY STAR Certified Dehumidifiers Product Finder：用于解释除湿机容量、能效、产品额定数据和后续产品筛选入口。
  - https://www.energystar.gov/productfinder/product/certified-dehumidifiers/results

- HVI Bathroom Ventilation：用于 bathroom fan CFM 规则，尤其是小浴室 1 CFM/ft²、最小 50 CFM 和大型浴室按 fixtures 估算。
  - https://www.hvi.org/resources/publications/bathroom-ventilation/

- ASHRAE 62.2 相关公开资料：用于确认住宅通风、局部排风、bathroom / kitchen / garage 等场景的专业边界。
  - https://www.ashrae.org/

- ACCA Technical Manuals：用于明确 Manual J、Manual S、Manual D 的边界，本站不得包装成专业 HVAC 设计工具。
  - https://www.acca.org/standards/technical-manuals

- EPA residential ventilation：用于解释住宅通风需求受房屋大小、居住人数、污染源、密封程度等影响。
  - https://www.epa.gov/indoor-air-quality-iaq/how-much-ventilation-do-i-need-my-home-improve-indoor-air-quality

- EPA mold：用于霉菌/潮湿免责声明，不把除湿机计算器包装成 mold remediation 或健康承诺。
  - https://www.epa.gov/mold

- DOE Portable Air Conditioners test procedure：用于 portable AC 的 SACC / BTU / CEER 口径提示。
  - https://www.energy.gov/eere/buildings/articles/energy-conservation-program-test-procedure-portable-air-conditioners

- Google AdSense policies：用于广告位和低价值内容边界。
  - https://support.google.com/adsense/answer/48182?hl=en

- Google Search helpful content：用于工具页和 guide 页内容质量标准。
  - https://developers.google.com/search/docs/fundamentals/creating-helpful-content

### 2.2 本地调研资料

需求文档提到本地 autocomplete 输出：

```text
D:\桌面\project\project4\tools\seo-lite\outputs\hvac_suggestions.csv
```

开发计划使用其中的搜索信号来确定第一版页面重点：

- room AC / BTU。
- portable AC。
- dehumidifier / basement。
- CFM / ACH。
- bathroom fan。
- AC tonnage / unit conversion。

### 2.3 资料维护原则

- 所有 sizing assumptions 必须集中配置。
- 每个高维护配置项必须有 `source_url`、`last_checked_at`、`notes`。
- 页面必须显示来源和更新时间。
- 官方资料变化时，只改配置和内容注释，不改计算组件业务逻辑。
- 专业边界和 disclaimer 作为全站组件复用，不能散落在各页面里。

---

## 3. 推荐技术栈

当前需求适合做静态优先、浏览器本地计算、内容友好、可部署到 Vercel 的英文工具站。

### 3.1 前端与工程

- 框架：Next.js App Router
- 语言：TypeScript
- UI：React
- 样式：Tailwind CSS
- 内容：MDX 或本地结构化内容文件
- 表单校验：Zod
- 结果范围计算：纯 TypeScript calculator functions
- CSV 导出：浏览器 Blob 或轻量 CSV 工具函数
- 分享链接：URL query encode / decode
- 打印：浏览器 print stylesheet
- 测试：Vitest
- E2E / 视觉检查：Playwright
- 代码质量：ESLint、TypeScript check、Prettier

### 3.2 部署与运营资源

- 本地开发：PowerShell
- 版本管理：Git
- 远程仓库：GitHub，用户名 `whywbhydyq`
- 部署：Vercel
- DNS：Cloudflare 或域名服务商
- 索引验证：Google Search Console
- 行为分析：Vercel Analytics、Plausible 或 GA4
- 广告准备：Google AdSense、`ads.txt`

### 3.3 资源使用优先级

开发过程中优先使用：

1. 本地需求分析文档。
2. DOE、ENERGY STAR、HVI、ASHRAE、ACCA、EPA 等官方/高可信资料。
3. 本地配置文件维护 assumptions、source 和 last_checked_at。
4. Git 管理阶段性交付。
5. GitHub CLI 和 Vercel CLI 管理仓库、预览部署、正式部署。
6. Search Console、真实计算事件、copy/share/export 和模板下载数据决定后续扩展。

---

## 4. 推荐项目目录结构

```text
project4/
  docs/
    hvac-tool-site/
      requirements.md
      development-plan.md
  app/
    layout.tsx
    page.tsx
    sitemap.ts
    robots.ts
    room-ac-btu-calculator/
      page.tsx
    window-ac-size-calculator/
      page.tsx
    portable-ac-size-calculator/
      page.tsx
    ac-tonnage-calculator/
      page.tsx
    dehumidifier-size-calculator/
      page.tsx
    basement-dehumidifier-size-calculator/
      page.tsx
    cfm-by-ach-calculator/
      page.tsx
    ach-calculator/
      page.tsx
    bathroom-fan-cfm-calculator/
      page.tsx
    garage-ventilation-calculator/
      page.tsx
    room-ventilation-calculator/
      page.tsx
    btu-converter/
      page.tsx
    guides/
      how-many-btu-per-square-foot/
        page.tsx
      why-oversized-ac-does-not-dehumidify/
        page.tsx
      portable-ac-sacc-vs-btu/
        page.tsx
      30-pint-vs-50-pint-dehumidifier/
        page.tsx
      cfm-vs-ach/
        page.tsx
      bathroom-fan-cfm-guide/
        page.tsx
      what-is-ac-tonnage/
        page.tsx
      dehumidifier-pints-explained/
        page.tsx
    room-size/
      what-size-ac-for-150-sq-ft/
        page.tsx
      what-size-ac-for-300-sq-ft/
        page.tsx
      what-size-ac-for-500-sq-ft/
        page.tsx
    portable-ac/
      14000-btu-portable-ac-room-size/
        page.tsx
    dehumidifier/
      what-size-dehumidifier-for-1000-sq-ft-basement/
        page.tsx
    bathroom-fan/
      what-size-fan-for-small-bathroom/
        page.tsx
    templates/
      room-ac-sizing-worksheet/
        page.tsx
      basement-humidity-checklist/
        page.tsx
      hvac-contractor-questions/
        page.tsx
    about/
      page.tsx
    contact/
      page.tsx
    privacy/
      page.tsx
    terms/
      page.tsx
    disclaimer/
      page.tsx
  src/
    components/
      layout/
      tool-shell/
      calculators/
      result/
      assumptions/
      professional-boundary/
      export/
      seo/
      ui/
    content/
      guides/
      tools/
      faq/
      templates/
    lib/
      calculators/
        room-area.ts
        room-volume.ts
        ac-btu.ts
        ac-tonnage.ts
        btu-conversions.ts
        dehumidifier-size.ts
        cfm-ach.ts
        bathroom-fan.ts
        garage-ventilation.ts
        room-ventilation.ts
      config/
        ac-sizing-assumptions.ts
        common-ac-sizes.ts
        dehumidifier-assumptions.ts
        ventilation-assumptions.ts
        room-presets.ts
        dampness-levels.ts
        sources.ts
      csv/
        export.ts
      share/
        encode.ts
        decode.ts
      validation/
        schemas.ts
      analytics/
        events.ts
      seo/
        metadata.ts
        structured-data.ts
      formatting/
        numbers.ts
        units.ts
    tests/
      calculators/
      config/
      csv/
      share/
```

---

## 5. 第一版页面范围

### 5.1 工具页

1. `/room-ac-btu-calculator/`
   - H1: Room AC BTU Calculator
   - 目标：按房间面积和条件估算 BTU。

2. `/window-ac-size-calculator/`
   - H1: Window Air Conditioner Size Calculator
   - 目标：窗口空调购买前估算。

3. `/portable-ac-size-calculator/`
   - H1: Portable AC Size Calculator
   - 目标：解释 portable AC BTU / SACC 和房间大小。

4. `/ac-tonnage-calculator/`
   - H1: AC Tonnage Calculator
   - 目标：BTU ↔ tons 转换和解释。

5. `/dehumidifier-size-calculator/`
   - H1: Dehumidifier Size Calculator
   - 目标：按面积和 dampness 推荐 pint/day 范围。

6. `/basement-dehumidifier-size-calculator/`
   - H1: Basement Dehumidifier Size Calculator
   - 目标：地下室场景长尾。

7. `/cfm-by-ach-calculator/`
   - H1: CFM by ACH Calculator
   - 目标：目标 ACH 反推 CFM。

8. `/ach-calculator/`
   - H1: ACH Calculator
   - 目标：给定 CFM 算 ACH。

9. `/bathroom-fan-cfm-calculator/`
   - H1: Bathroom Fan CFM Calculator
   - 目标：浴室排风扇购买前估算。

10. `/garage-ventilation-calculator/`
    - H1: Garage Ventilation Calculator
    - 目标：教育性 CFM/ACH 估算，不处理 CO/code 保证。

### 5.2 Guide 页

1. `/guides/how-many-btu-per-square-foot/`
2. `/guides/why-oversized-ac-does-not-dehumidify/`
3. `/guides/portable-ac-sacc-vs-btu/`
4. `/guides/30-pint-vs-50-pint-dehumidifier/`
5. `/guides/cfm-vs-ach/`
6. `/guides/bathroom-fan-cfm-guide/`
7. `/guides/what-is-ac-tonnage/`
8. `/guides/dehumidifier-pints-explained/`

### 5.3 长尾页

1. `/room-size/what-size-ac-for-150-sq-ft/`
2. `/room-size/what-size-ac-for-300-sq-ft/`
3. `/room-size/what-size-ac-for-500-sq-ft/`
4. `/portable-ac/14000-btu-portable-ac-room-size/`
5. `/dehumidifier/what-size-dehumidifier-for-1000-sq-ft-basement/`
6. `/bathroom-fan/what-size-fan-for-small-bathroom/`

### 5.4 模板页

1. `/templates/room-ac-sizing-worksheet/`
2. `/templates/basement-humidity-checklist/`
3. `/templates/hvac-contractor-questions/`

### 5.5 支撑页

上线前必须完成：

- Home / Tool hub
- About
- Contact
- Privacy Policy
- Terms
- Disclaimer

---

## 6. 数据配置计划

### 6.1 AC Sizing Assumptions

```json
{
  "source": "DOE Room Air Conditioners",
  "base_btu_per_sqft": 20,
  "shade_adjustment": -0.10,
  "sun_adjustment": 0.10,
  "extra_person_btu": 600,
  "kitchen_extra_btu": 4000,
  "base_ceiling_height_ft": 8,
  "source_url": "https://www.energy.gov/energysaver/room-air-conditioners",
  "last_checked_at": "2026-05-22",
  "notes": "Preliminary room AC estimate only. Not Manual J."
}
```

原则：

- 20 BTU/ft² 只用于 room-level preliminary estimate。
- 结果必须输出范围，不输出伪精确值。
- 层高修正是 advanced optional adjustment，必须标注不是 DOE 官方精确扩展。
- 每个页面说明 not Manual J。

### 6.2 Common AC Sizes

```json
[
  { "btu": 5000, "label": "5,000 BTU" },
  { "btu": 6000, "label": "6,000 BTU" },
  { "btu": 8000, "label": "8,000 BTU" },
  { "btu": 10000, "label": "10,000 BTU" },
  { "btu": 12000, "label": "12,000 BTU" },
  { "btu": 14000, "label": "14,000 BTU" }
]
```

### 6.3 Dehumidifier Assumptions

```json
{
  "source": "ENERGY STAR Certified Dehumidifiers / product ratings",
  "capacity_unit": "pints_per_day",
  "size_model": "room_area_plus_dampness_level",
  "source_url": "https://www.energystar.gov/productfinder/product/certified-dehumidifiers/results",
  "last_checked_at": "2026-05-22",
  "notes": "Estimate only. Actual needs depend on moisture source, temperature, air leakage, and product rating method."
}
```

原则：

- 除湿机结果输出 pint/day range。
- dampness_level 必须可见并可修改。
- water intrusion yes/no 只触发 warning，不承诺解决。
- 页面说明不是 mold remediation。

### 6.4 Ventilation Assumptions

```json
{
  "source": "HVI bathroom ventilation guidance and ASHRAE ventilation standards",
  "bathroom_min_cfm": 50,
  "small_bathroom_cfm_per_sqft": 1,
  "source_url": "https://www.hvi.org/resources/publications/bathroom-ventilation/",
  "last_checked_at": "2026-05-22",
  "notes": "For residential bathroom fan sizing only. Check local code and product installation manual."
}
```

原则：

- bathroom fan 可按 area 或 fixtures 输出估算。
- CFM/ACH 页面不做 duct design。
- garage ventilation 页面必须提示不用于 CO control、combustion appliance、commercial garage 或 code compliance。

---

## 7. 核心公式模块

### 7.1 房间面积

```text
room_area_sqft = length_ft × width_ft
total_area = area_section_1 + area_section_2 + ...
```

### 7.2 房间体积

```text
room_volume_cuft = length_ft × width_ft × ceiling_height_ft
room_volume_m3 = length_m × width_m × height_m
```

### 7.3 Room AC 基础 BTU 估算

```text
base_BTU_per_hour = room_area_sqft × 20
```

### 7.4 BTU 调整项

```text
adjusted_BTU = base_BTU

if room_is_heavily_shaded:
  adjusted_BTU *= 0.90

if room_is_very_sunny:
  adjusted_BTU *= 1.10

if occupants > 2:
  adjusted_BTU += (occupants - 2) × 600

if room_is_kitchen:
  adjusted_BTU += 4000

height_factor = ceiling_height_ft / 8
adjusted_BTU *= height_factor
```

注意：

- 结果应转换为 recommended BTU range。
- 层高修正作为 advanced optional adjustment。
- 页面必须说明这不是 Manual J。

### 7.5 BTU to Tons

```text
tons = BTU_per_hour ÷ 12000
```

### 7.6 BTU to kW

```text
kW_thermal = BTU_per_hour × 0.000293071
```

说明：

- 这是热量/冷量单位转换，不是电力输入功率。
- 空调耗电取决于 EER、CEER、SEER2、COP 等效率。

### 7.7 EER / Watts 估算

```text
input_watts = BTU_per_hour ÷ EER
```

仅在用户输入 EER/CEER 时用于估算用电。

### 7.8 Dehumidifier Size

推荐使用分级经验模型：

```text
base_pints_per_day = lookup(room_area, dampness_level)
```

输入维度：

- room area
- dampness level
- basement yes/no
- temperature
- water intrusion yes/no
- continuous drain yes/no

输出：

- recommended pint/day range
- common product class
- drainage recommendation
- warning if water intrusion is present

### 7.9 ACH to CFM

```text
CFM = room_volume_cuft × target_ACH ÷ 60
```

### 7.10 CFM to ACH

```text
ACH = CFM × 60 ÷ room_volume_cuft
```

### 7.11 Bathroom Fan CFM

100 sq ft 以下简化：

```text
recommended_CFM = max(room_area_sqft × 1, 50)
```

大型浴室 fixture 模型：

```text
recommended_CFM =
  50 × toilet_count
  + 50 × shower_count
  + 50 × tub_count
  + 100 × jetted_tub_count
```

### 7.12 Garage Ventilation

教育性估算：

```text
required_CFM = garage_volume_cuft × target_ACH ÷ 60
```

限制：

- 不用于燃烧设备、CO 控制、商业车库或 code compliance。
- 必须提醒安装 CO detector，并咨询专业人士处理燃气设备和尾气风险。

---

## 8. 工具功能开发计划

### 8.1 通用输入

通用输入字段：

- Length
- Width
- Area
- Ceiling height
- Unit system
- Sun exposure
- Shade
- Occupants
- Kitchen / heat source
- Insulation estimate
- Room type
- Dampness level
- Basement yes/no
- Water intrusion yes/no
- Continuous drain yes/no
- Target ACH
- CFM
- Bathroom fixtures
- Duct length hint

输入校验：

- length、width、area、height 必须大于 0。
- ACH、CFM 必须大于 0。
- occupants 不得为负。
- dampness level 必须从 preset 中选择。
- 过大面积或极端层高提示用户检查输入。
- water intrusion yes 时显示修复水源和专业建议。

### 8.2 通用输出

所有工具尽量输出：

- room area
- room volume
- base BTU estimate
- adjusted BTU range
- equivalent tons
- common AC size options
- dehumidifier pint/day range
- required CFM
- resulting ACH
- bathroom fan CFM recommendation
- assumptions
- warnings
- next-step checklist

### 8.3 结果表达原则

结果必须以范围呈现：

```text
Estimated room AC size: 8,000-10,000 BTU/h
```

不要输出：

```text
You need exactly 9,214 BTU/h
```

原因：

- 家用 HVAC sizing 有大量现场变量。
- 用户需要的是购买前范围，不是工程设计数值。

### 8.4 结果拆解

每个工具应给：

```text
Base estimate
- Room area
- Base rule

Adjustments
- Sun exposure
- Occupants
- Kitchen / heat sources
- Ceiling height
- Insulation assumption

Result
- Suggested range
- Common product sizes
- What to check before buying
```

### 8.5 Room AC BTU Calculator

路径：`/room-ac-btu-calculator/`

输入：

- room length
- width
- ceiling height
- sun exposure
- shade
- number of occupants
- kitchen yes/no
- insulation estimate

输出：

- recommended BTU range
- tons
- common AC size options
- oversizing / undersizing warning

验收标准：

- 使用 DOE 20 BTU/ft² 作为基础。
- 显示 sun、shade、occupants、kitchen、height 调整。
- 输出范围和常见产品尺寸。
- 页面说明 not Manual J。

### 8.6 Window AC Size Calculator

路径：`/window-ac-size-calculator/`

定位：

- 与 Room AC BTU 共用核心公式，但页面针对 window air conditioner 购买前估算。

验收标准：

- 输出 recommended BTU range。
- 解释 oversizing 会影响除湿。
- 解释 window fit、EER/CEER、noise、drainage、安装限制作为购买前 checklist。

### 8.7 Portable AC Size Calculator

路径：`/portable-ac-size-calculator/`

输入：

- room size
- ceiling height
- sun exposure
- occupants
- heat sources
- single-hose / dual-hose note
- product BTU / SACC optional

输出：

- recommended capacity range
- SACC / ASHRAE BTU warning
- sealing and exhaust notes

验收标准：

- 页面解释 portable AC BTU / SACC / CEER 差异。
- 提醒用户看产品标签。
- 不承诺 14,000 BTU portable AC 能覆盖特定面积。

### 8.8 AC Tonnage Calculator

路径：`/ac-tonnage-calculator/`

输入：

- BTU/h 或 tons

输出：

- tons
- BTU/h
- kW thermal optional

验收标准：

- 解释 1 ton = 12,000 BTU/h。
- 明确不用于整屋系统最终选型。
- 链接到 What is AC Tonnage guide。

### 8.9 Dehumidifier Size Calculator

路径：`/dehumidifier-size-calculator/`

输入：

- room area
- dampness level
- temperature
- basement yes/no
- water intrusion yes/no
- continuous drain yes/no

输出：

- recommended pint/day range
- common product class
- drainage recommendation
- warnings

验收标准：

- 输出范围。
- 解释 pints/day。
- 提醒容量口径可能变化，用户要看产品标签。
- water intrusion yes 时提示修复水源。
- 不承诺解决 mold。

### 8.10 Basement Dehumidifier Size Calculator

路径：`/basement-dehumidifier-size-calculator/`

定位：

- 与 Dehumidifier Size 共用核心模型，但针对地下室场景增加 dampness、temperature、drainage、air leakage 解释。

验收标准：

- 支持 basement-specific warnings。
- 链接到 Basement Humidity Checklist。
- 不做 mold remediation 或 health diagnosis。

### 8.11 CFM by ACH Calculator

路径：`/cfm-by-ach-calculator/`

输入：

- room length
- width
- height
- target ACH

输出：

- room volume
- required CFM
- formula

验收标准：

- 使用 CFM = volume × ACH ÷ 60。
- 说明适用范围。
- 不做 duct design。

### 8.12 ACH Calculator

路径：`/ach-calculator/`

输入：

- room volume 或 dimensions
- CFM

输出：

- ACH
- formula
- assumptions

验收标准：

- 使用 ACH = CFM × 60 ÷ volume。
- 链接到 CFM vs ACH guide。
- 不给医疗或 code-compliant ventilation 承诺。

### 8.13 Bathroom Fan CFM Calculator

路径：`/bathroom-fan-cfm-calculator/`

输入：

- bathroom area
- ceiling height optional
- toilet / shower / tub / jetted tub count
- duct length hint

输出：

- recommended CFM
- fixture-based CFM
- minimum CFM
- purchase checklist

验收标准：

- 小浴室按 max(area × 1, 50)。
- 大浴室按 fixtures 计算。
- 提醒 duct length、bend、roof/wall cap、fan rating、noise、local code。

### 8.14 Garage Ventilation Calculator

路径：`/garage-ventilation-calculator/`

输入：

- garage dimensions
- target ACH
- optional CFM

输出：

- required CFM
- resulting ACH
- safety warnings

验收标准：

- 只做教育性 CFM/ACH。
- 不用于 CO control、combustion appliance、commercial garage 或 code compliance。
- 提醒安装 CO detector 和咨询专业人士。

---

## 9. 分享、导出和模板

### 9.1 MVP 必做

- Copy result summary。
- Copy assumptions。
- Share URL with query params。
- Download CSV。
- Print / save as PDF。

### 9.2 分享链接要求

- 只包含低敏感尺寸和选项。
- 不包含地址、健康信息、房屋图纸或个人身份信息。
- URL 参数可读，方便用户检查。
- 分享链接必须能还原输入和结果。

### 9.3 CSV 导出要求

CSV 至少包含：

- tool type
- input dimensions
- assumptions
- adjustment factors
- result range
- common product sizes
- warnings
- disclaimer

### 9.4 模板页

第一版模板页：

- Room AC sizing worksheet。
- Basement humidity checklist。
- HVAC contractor questions。

模板页必须：

- 有字段解释。
- 有示例。
- 可复制或下载。
- 链接到相关工具。
- 下载按钮附近不放广告。

---

## 10. 内容开发计划

### 10.1 工具页统一模板

每个工具页必须包含：

1. H1。
2. 一句话说明。
3. 工具本体。
4. 结果范围。
5. Copy / Share / Export。
6. Formula used。
7. Worked example。
8. Assumptions。
9. What is included。
10. What is not included。
11. Safety / professional boundary disclaimer。
12. Official sources。
13. FAQ。
14. Related calculators。

### 10.2 Guide 页统一模板

每个 guide 页必须包含：

- 明确用户问题。
- 场景背景。
- 公式或规则。
- worked example。
- 常见错误。
- 购买前 checklist。
- 风险边界。
- CTA 回相关工具。
- 相关来源。

### 10.3 长尾页统一模板

每个长尾页必须包含：

- 具体场景。
- 预填工具。
- 公式解释。
- 示例计算。
- 购买前 checklist。
- 风险边界。
- CTA 回主工具。

### 10.4 第一批内容主题

第一版重点覆盖：

- Room AC BTU。
- Window AC。
- Portable AC SACC vs BTU。
- AC tonnage。
- Dehumidifier pint size。
- Basement dehumidifier。
- CFM / ACH。
- Bathroom fan CFM。
- Garage ventilation safety boundary。
- HVAC contractor questions。

---

## 11. SEO 开发计划

### 11.1 基础 SEO

每个可索引页面必须有：

- 唯一 title。
- 唯一 meta description。
- 唯一 H1。
- canonical URL。
- Open Graph title / description。
- Breadcrumb。
- 相关工具内链。
- 相关 guide 和模板内链。

不使用 meta keywords。优先做好 title、H1、正文匹配、内部链接和真实工具行为。

### 11.2 结构化数据

按页面类型添加：

- 工具页：WebApplication。
- Guide 页：Article / FAQPage。
- 模板页：Article 或 CreativeWork。
- 全站：BreadcrumbList。

FAQ 必须在页面可见，结构化数据必须与可见内容一致。

### 11.3 Sitemap 和 Robots

上线前必须完成：

- `/sitemap.xml` 返回 200。
- `/robots.txt` 返回 200。
- robots 中声明 sitemap。
- sitemap 包含工具页、guide 页、长尾页、模板页和支撑页。
- canonical、sitemap、Open Graph 使用最终正式域名。
- 所有核心页面不能带 `noindex`。
- 不把 Vercel preview 域名写进 sitemap、canonical、robots、Open Graph 或文档。

### 11.4 内链策略

首页链接到：

- Room AC BTU。
- Window AC。
- Portable AC。
- Dehumidifier。
- Basement Dehumidifier。
- CFM / ACH。
- Bathroom Fan。
- AC Tonnage。
- Templates。

工具页之间互链：

- Room AC BTU -> Window AC、Portable AC、AC Tonnage、Oversized AC guide。
- Window AC -> Room AC BTU、How many BTU per square foot、AC Tonnage。
- Portable AC -> Portable AC SACC vs BTU、Room AC BTU、14000 BTU portable AC room size。
- Dehumidifier -> Basement Dehumidifier、30 pint vs 50 pint、Dehumidifier pints explained。
- Basement Dehumidifier -> Dehumidifier Size、Basement Humidity Checklist。
- CFM by ACH -> ACH Calculator、CFM vs ACH、Room Ventilation。
- ACH Calculator -> CFM by ACH、CFM vs ACH。
- Bathroom Fan -> Bathroom Fan Guide、CFM by ACH、Small Bathroom Fan page。
- Garage Ventilation -> CFM by ACH、Safety disclaimer、CO detector note。

长尾页必须回链到对应工具页，并至少链接 3 个相关页面。

---

## 12. 隐私、合规和可信度

### 12.1 隐私原则

- 不需要登录。
- 不收集地址。
- 不收集健康症状。
- 不上传房屋图纸。
- 分享 URL 只包含低敏感尺寸和选项。
- 不记录用户个人身份信息。

### 12.2 Analytics 事件

只记录匿名事件：

- `calculate_clicked`
- `sample_loaded`
- `copy_result_clicked`
- `copy_assumptions_clicked`
- `share_clicked`
- `csv_exported`
- `template_downloaded`

事件属性只允许：

- `tool_type`
- `room_type`
- `result_bucket`
- `has_warning`
- `unit_system`
- `export_type`

禁止记录：

- 地址。
- 健康症状。
- 房屋图纸。
- 用户完整家庭布局。
- contractor lead 信息。

### 12.3 准确性边界

所有关键工具都显示：

```text
This is a preliminary estimate for room-level sizing. Actual cooling, dehumidification, or ventilation needs depend on climate, insulation, windows, air leakage, equipment ratings, ducting, and local code. For whole-home HVAC, duct design, mold problems, combustion appliances, or safety-critical uses, consult a qualified professional.
```

禁止使用：

- exact HVAC load
- guaranteed comfort
- mold removal guarantee
- Manual J replacement
- code-compliant duct design
- medically safe ventilation

### 12.4 独立性声明

全站和相关页面必须包含：

```text
This site provides educational estimates only. It does not replace Manual J, Manual S, Manual D, a licensed HVAC contractor, local code, product manuals, or professional mold/health advice.
```

---

## 13. AdSense 与变现计划

### 13.1 AdSense 位置原则

工具页适合：

- 结果区下方一个广告。
- 公式解释后一个广告。
- FAQ 前一个广告。

Guide 页适合：

- 首屏正文后。
- worked example 后。
- FAQ 前。

模板页规则：

- 下载按钮附近不放广告。
- checklist 和 worksheet 内容保持清晰。

禁止：

- 广告放在 Calculate、Copy、Download 按钮旁。
- 广告伪装成产品推荐或结果卡。
- 移动端把广告插在输入和结果之间。
- 工具页只有表单和广告。

### 13.2 非 AdSense 变现路径

优先级：

1. 房间空调 / window AC / portable AC。
2. 除湿机、crawl space dehumidifier、drain hose、condensate pump。
3. 浴室排风扇、humidity sensor fan、quiet fan、duct kit、wall cap、timer switch。
4. 温湿度计、hygrometer、thermometer、smart sensor、CO detector。
5. AC filter、box fan、air purifier、MERV filter。
6. 本地 HVAC lead，但只在 guide 页面作为“需要专业计算时问 contractor 什么问题”，不要在工具结果中强推。
7. 模板：room AC sizing worksheet、basement humidity checklist、contractor questions checklist、dehumidifier comparison spreadsheet。

### 13.3 不要依赖的路径

- 一开始强制用户填地址获取 contractor quote。
- 恐吓式 mold / health lead。
- “best portable AC” 薄 affiliate 榜单。
- 用不透明评分推荐产品。
- 将专业 HVAC 服务包装成免费计算结果。

---

## 14. 开发阶段与任务拆分

## Phase 0：公式、资料和专业边界

目标：先把公式、assumptions、source 和 professional boundary 做扎实。

任务：

- 初始化 Git 仓库。
- 初始化 Next.js + TypeScript 项目。
- 配置 Tailwind CSS。
- 配置 ESLint、TypeScript check、Prettier。
- 配置 Vitest。
- 配置 Playwright。
- 建立 BTU、tons、CFM、ACH、pints 单位库。
- 建立 AC sizing assumptions 配置。
- 建立 common AC sizes 配置。
- 建立 dehumidifier sizing assumptions 配置。
- 建立 ventilation assumptions 配置。
- 建立 disclaimer 组件。
- 建立 result range 输出组件。
- 建立 source note 组件。
- 建立基础 layout、header、footer。
- 建立 About、Contact、Privacy、Terms、Disclaimer 空页面。

验收：

- 所有结果显示假设。
- 所有专业边界有提示。
- 公式有单元测试。
- 修改 assumptions 不需要改 UI 组件。
- `npm run dev` 可启动。
- `npm run build` 通过。

## Phase 1：AC / BTU 入口

目标：先上线搜索最大、工具最直观的 AC / BTU 相关页面。

先做：

1. Room AC BTU Calculator。
2. Window AC Size Calculator。
3. Portable AC Size Calculator。
4. AC Tonnage Calculator。
5. How Many BTU per Square Foot guide。
6. Portable AC SACC vs BTU guide。
7. Why Oversized AC Does Not Dehumidify guide。

任务：

- 实现 room area。
- 实现 room volume。
- 实现 base BTU。
- 实现 BTU adjustments。
- 实现 recommended BTU range。
- 实现 common AC size matching。
- 实现 BTU to tons。
- 实现 BTU to kW。
- 开发 ToolShell、ResultRange、AdjustmentBreakdown、WarningList。
- 开发 Copy result、Copy assumptions、Share URL、CSV export。
- 写工具页正文、FAQ、来源和专业边界。

验收：

- 用户进入页面 5 秒内知道输入什么。
- 输入变化后结果即时更新。
- 结果给范围，不给伪精确。
- Room AC 页面说明 not Manual J。
- Portable AC 页面解释 SACC / BTU / CEER。

## Phase 2：除湿机入口

目标：完成 basement / damp room 高购买意图工具和内容。

再做：

1. Dehumidifier Size Calculator。
2. Basement Dehumidifier Size Calculator。
3. 30 Pint vs 50 Pint Dehumidifier guide。
4. Dehumidifier Pints Explained guide。
5. Basement Humidity Checklist。

任务：

- 建立 dampness level model。
- 实现 area + dampness 的 pints/day range。
- 实现 basement adjustments。
- 实现 water intrusion warning。
- 实现 drainage recommendation。
- 写地下室、容量、口径变化、mold boundary 内容。

验收：

- 输出 recommended pint/day range。
- water intrusion yes 时提示修复水源。
- 页面不承诺解决 mold。
- 模板页可复制或下载 checklist。

## Phase 3：CFM / ACH / Bathroom Fan

目标：完成通风教育和浴室风扇购买前估算，但不进入 duct/code 设计。

再做：

1. CFM by ACH Calculator。
2. ACH Calculator。
3. Bathroom Fan CFM Calculator。
4. Garage Ventilation Calculator。
5. CFM vs ACH guide。
6. Bathroom Fan CFM Guide。

任务：

- 实现 room volume。
- 实现 ACH to CFM。
- 实现 CFM to ACH。
- 实现 bathroom area rule。
- 实现 bathroom fixture model。
- 实现 garage ventilation educational estimate。
- 写 duct/code/CO safety boundary。

验收：

- CFM / ACH 互算准确。
- Bathroom fan 输出小浴室和 fixture 两种模型。
- Garage 页面显示 CO detector 和 professional warning。
- 不输出 duct size、wire、breaker、code compliance。

## Phase 4：长尾页、模板和 SEO

目标：完成第一版页面矩阵，避免工具壳。

任务：

- 完成 room-size 长尾页。
- 完成 portable AC 长尾页。
- 完成 basement dehumidifier 长尾页。
- 完成 bathroom fan 长尾页。
- 完成 room AC sizing worksheet。
- 完成 HVAC contractor questions。
- 补首页 Tool hub。
- 补 About、Contact、Privacy、Terms、Disclaimer。
- 每页配置 title、description、canonical。
- 每页配置 WebApplication / Article / FAQPage / BreadcrumbList schema。
- 创建 sitemap。
- 创建 robots。
- 检查所有页面 200。
- 检查移动端布局。
- 检查广告占位不靠近按钮。
- 运行 lint。
- 运行 typecheck。
- 运行 unit tests。
- 运行 build。
- 用 Playwright 检查核心流程。

验收：

- robots.txt 正常。
- sitemap.xml 正常。
- canonical 正常。
- 页面 200。
- WebApplication / FAQ / Article schema 正常。
- Core Web Vitals 不被大型脚本拖垮。
- About、Contact、Privacy、Terms、Disclaimer 完成。

## Phase 5：部署和验证

目标：发布可被索引、可验证的正式站点。

任务：

- 创建 GitHub 仓库。
- 推送代码到 GitHub。
- 创建 Vercel 项目。
- 配置环境变量。
- 部署 preview。
- 检查 preview 页面。
- 绑定正式域名。
- 检查正式域名 200。
- 检查 sitemap、robots、canonical 使用正式域名。
- 配置 Search Console。
- 提交 sitemap。
- 请求索引首页、核心工具页和主要长尾页。
- 配置 analytics。
- 配置 AdSense 准备项。
- 添加 `ads.txt`。

验收：

- 正式域名首页返回 200。
- 所有核心工具页返回 200。
- sitemap 返回 200 且格式正确。
- robots 指向 sitemap。
- Search Console 能提交 sitemap。
- analytics 能收到核心工具事件。
- 没有把 Vercel preview 域名写进 canonical、sitemap、robots、Open Graph 或文档。

## Phase 6：后续扩展

只在上线后数据证明有效时继续。

按 Search Console query 添加：

- specific room sizes。
- specific BTU sizes。
- basement sizes。
- portable AC BTU pages。
- bathroom fan room sizes。
- metric / UK / Australia variants。
- contractor question templates。

暂缓或不做：

- duct size calculator。
- mini split / heat pump final sizing。
- whole-home HVAC load calculation。
- mold remediation。
- health advice。
- electrical / refrigerant / gas furnace / combustion safety。

---

## 15. 测试计划

### 15.1 单元测试

必须覆盖：

- room area。
- room volume。
- base BTU。
- shade adjustment。
- sun adjustment。
- occupant adjustment。
- kitchen adjustment。
- height factor。
- recommended BTU range。
- common AC size matching。
- BTU to tons。
- BTU to kW。
- EER to input watts。
- dehumidifier pint range lookup。
- basement adjustment。
- ACH to CFM。
- CFM to ACH。
- bathroom fan area rule。
- bathroom fan fixture model。
- garage ventilation CFM。
- share URL encode / decode。
- CSV export。

### 15.2 页面测试

必须覆盖：

- 首页能进入所有核心工具。
- Room AC BTU Calculator 可输出范围和调整拆解。
- Window AC Size Calculator 可用。
- Portable AC Size Calculator 显示 SACC / BTU warning。
- AC Tonnage Calculator 可互转。
- Dehumidifier Size Calculator 可输出 pint/day range。
- Basement Dehumidifier 显示 water intrusion warning。
- CFM by ACH 可反推 CFM。
- ACH Calculator 可反推 ACH。
- Bathroom Fan CFM 可按面积和 fixtures 计算。
- Garage Ventilation 显示 safety boundary。
- Copy result 可用。
- Copy assumptions 可用。
- CSV export 可用。
- Share URL 可还原输入。
- 校验错误能显示。
- 移动端表单可操作。

### 15.3 SEO 和合规检查

必须覆盖：

- 每页只有一个 H1。
- 每页有 title 和 description。
- 每页有 canonical。
- sitemap 包含所有目标页面。
- robots 不阻止核心页面。
- FAQ structured data 与页面内容一致。
- WebApplication structured data 与工具功能一致。
- 所有结果标注 preliminary estimate。
- AC 页面说明 not Manual J。
- CFM / duct 相关页面说明 not Manual D。
- Dehumidifier 页面说明 not mold remediation。
- 页面不是 thin content。

---

## 16. 验收标准

### 16.1 工具可用性

- 用户进入页面 5 秒内知道输入什么。
- 输入变化后结果即时更新。
- 结果给范围，不给伪精确。
- 负数、空值、极端值有错误提示。
- 可复制、分享、下载 CSV。
- 可浏览器打印保存 PDF。
- 移动端可用。

### 16.2 内容质量

每个工具页必须包含：

- 工具本体。
- 公式。
- worked example。
- assumptions。
- what is included。
- what is not included。
- safety / professional boundary disclaimer。
- official sources。
- FAQ。
- related calculators。

每个长尾页必须包含：

- 具体场景。
- 预填工具。
- 公式解释。
- 示例计算。
- 购买前 checklist。
- 风险边界。
- CTA 回主工具。

### 16.3 可信度

- 所有结果标注 preliminary estimate。
- 所有 assumptions 可见。
- 所有来源可点击。
- 所有 AC 页面说明 not Manual J。
- 所有 CFM / duct 页面说明 not Manual D。
- 所有 dehumidifier 页面说明 not mold remediation。
- 不出现 exact HVAC load、guaranteed comfort、mold removal guarantee、Manual J replacement、code-compliant duct design、medically safe ventilation。

### 16.4 SEO 技术

- robots.txt 正常。
- sitemap.xml 正常。
- canonical 正常。
- 页面 200。
- WebApplication / FAQ / Article schema 正常。
- Core Web Vitals 不被大型脚本拖垮。

### 16.5 AdSense 准备

- About、Contact、Privacy、Terms、Disclaimer 完成。
- 页面不是薄工具。
- 广告位不靠近按钮。
- 无广告状态下页面依然有独立价值。
- 模板下载按钮附近不放广告。

---

## 17. 上线后指标和决策

### 17.1 上线后 30 天

目标：

- Search Console 出现 500+ impressions。
- 至少 5 个页面有 impressions。
- 工具交互率 > 10%。
- 至少 50 次计算事件。
- 至少 10 次 copy / share / export。

行动：

- 修复未索引页面。
- 优化有 impressions 但 CTR 低的 title 和 description。
- 给有曝光页面补示例、FAQ、模板入口。
- 不急于扩展 duct design、Manual J、health 或 contractor lead。

### 17.2 上线后 90 天

目标：

- 月自然点击 > 300。
- 月计算次数 > 1,500。
- 至少 15 个长尾词有 impressions。
- room AC 或 dehumidifier 方向至少一个页面有稳定点击。
- affiliate 点击率有早期信号。

继续扩展条件：

- Room AC、portable AC、dehumidifier、bathroom fan 至少一个主题形成稳定入口。
- copy / share / export 行为证明工具有复用价值。
- Search Console 暴露新的 room size、BTU size、basement、bathroom fan 查询。
- 模板页有下载或点击。

### 17.3 上线后 180 天

目标：

- 月自然点击 > 2,000。
- 月计算次数 > 10,000。
- 至少一个页面进入核心长尾前 10。
- 模板下载或 affiliate 点击形成可判断数据。
- Search Console 暴露新的 room size / dehumidifier / bathroom fan 长尾。

### 17.4 12 个月目标

- 60-100 个高质量页面。
- 月自然 PV 8,000-25,000 为现实目标。
- 月自然 PV 50,000+ 为做得好的目标。
- 收入结构：AdSense 打底，affiliate 和 contractor lead 后置。

### 17.5 硬停止条件

满足任意条件应暂停：

- 上线 60 天后 Search Console 几乎没有 impressions。
- 工具交互率低于 5%。
- 用户反馈集中在“结果无法用于真实购买”，且无法通过增加参数解决。
- 长尾页变成重复面积表，没有独立解释和工具预填。
- 为了增长不得不进入 Manual J / Manual D / mold remediation / health advice。
- AdSense 或 Search Console 提示低价值内容且无法补充实质内容。
- affiliate 内容淹没工具，导致页面像产品榜单。

---

## 18. 风险控制

### 18.1 专业边界风险

处理方式：

- 每页明确 not Manual J。
- CFM / duct 相关页面明确 not Manual D。
- 整屋系统建议找专业人士。
- 不做施工、电气、冷媒、燃气、燃烧安全页面。

### 18.2 准确性风险

处理方式：

- 结果给范围。
- 显示 assumptions。
- 显示 what is not included。
- 说明 insulation、climate、windows、orientation、air leakage、equipment ratings 都会影响结果。

### 18.3 除湿 / 霉菌风险

处理方式：

- water intrusion 或 visible mold 场景提示修复水源和咨询专业人士。
- 不承诺除湿机解决 mold。
- 不做 asthma、allergy 或 health diagnosis。

### 18.4 Portable AC Rating 风险

处理方式：

- 单独做 Portable AC SACC vs BTU guide。
- 工具结果提醒看产品标签。
- 不承诺标称 14,000 BTU portable AC 覆盖特定面积。

### 18.5 CFM / Duct 越界风险

处理方式：

- MVP 不做 duct size calculator。
- 只做 ACH / CFM 和 bathroom fan。
- Garage ventilation 只做教育估算，不做 CO/code 保证。

### 18.6 Affiliate 可信度风险

处理方式：

- 第一版不自动推荐产品。
- 工具结果不混 affiliate。
- 产品导流放在 guide 或 buying checklist 中。
- 不做薄“best portable AC”榜单。

---

## 19. 推荐开发顺序

建议按以下顺序交付：

1. 初始化项目和基础布局。
2. 建立 sources 和 collected references。
3. 建立 AC sizing assumptions。
4. 建立 common AC sizes。
5. 建立 dehumidifier assumptions。
6. 建立 ventilation assumptions。
7. 建立 professional boundary / disclaimer 组件。
8. 实现 room area 和 room volume。
9. 实现 base BTU。
10. 实现 BTU adjustments。
11. 实现 result range。
12. 实现 common AC size matching。
13. 实现 BTU to tons / kW。
14. 实现 dehumidifier pint range。
15. 实现 ACH to CFM。
16. 实现 CFM to ACH。
17. 实现 bathroom fan CFM。
18. 实现 garage ventilation CFM。
19. 写单元测试。
20. 做 Room AC BTU Calculator。
21. 做 Window AC Size Calculator。
22. 做 Portable AC Size Calculator。
23. 做 AC Tonnage Calculator。
24. 做 Dehumidifier Size Calculator。
25. 做 Basement Dehumidifier Size Calculator。
26. 做 CFM by ACH Calculator。
27. 做 ACH Calculator。
28. 做 Bathroom Fan CFM Calculator。
29. 做 Garage Ventilation Calculator。
30. 做 Copy result、Copy assumptions。
31. 做 Share URL。
32. 做 CSV export。
33. 做 print stylesheet。
34. 补首页 Tool hub。
35. 补 8 个 Guide 页。
36. 补 6 个长尾页。
37. 补 3 个模板页。
38. 补 About、Contact、Privacy、Terms、Disclaimer。
39. 补 SEO metadata、structured data、sitemap、robots。
40. 跑测试、lint、typecheck、build。
41. 部署 preview。
42. 绑定正式域名。
43. 配置 Search Console 和 analytics。
44. 发布后观察 30 天数据。

---

## 20. 第一版完成定义

第一版完成不是指覆盖所有 HVAC 问题，而是指以下闭环完整：

- 有 Room AC、Window AC、Portable AC、AC Tonnage、Dehumidifier、Basement Dehumidifier、CFM by ACH、ACH、Bathroom Fan、Garage Ventilation 10 个工具页。
- 有 8 个 Guide 页。
- 有 6 个长尾页。
- 有 3 个模板页。
- 已收集并配置 DOE、ENERGY STAR、HVI、ASHRAE、ACCA、EPA 等高可信来源。
- 所有 assumptions 集中配置，并有 source_url、last_checked_at、notes。
- 所有结果给范围，不给伪精确。
- 所有工具可即时计算、复制、分享、导出 CSV。
- 所有工具页有公式、worked example、assumptions、FAQ、来源和专业边界。
- 不登录、不上传地址、不收集健康信息、不做 Manual J / S / D、不承诺 mold / health / code 结果。
- 有 sitemap、robots、canonical、结构化数据。
- 有 Privacy、Terms、Contact、About、Disclaimer。
- 有 Search Console 验证。
- 有 30 / 90 / 180 天继续或停止判断标准。

这个 MVP 的目标是验证：

> 用户在搜索房间空调要多少 BTU、便携空调适合多大房间、地下室需要多大除湿机、浴室风扇要多少 CFM 或 ACH/CFM 怎么换算时，是否会用这个工具站得到房间级估算、公式解释和购买前检查清单，并实际复制、分享、导出结果。

