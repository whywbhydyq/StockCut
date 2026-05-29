# HVAC / BTU / CFM / Dehumidifier Size 免费工具站需求分析文档

日期：2026-05-22

方向：Room AC BTU / Portable AC / Dehumidifier Size / CFM / ACH / Bathroom Fan Calculator

目标：做一个面向家庭用户、租房者、地下室/车库/卧室改善用户、空调/除湿机购买前用户、轻度 DIY 通风用户的英文免费工具站。核心不是做专业 HVAC 设计软件，不是替代 Manual J / Manual S / Manual D，也不是做健康诊断，而是做一组低敏感、无需登录、即时估算、可解释公式、可分享、可复用、适合 AdSense 和 affiliate 的 home comfort calculator hub。

---

## 1. 结论先行

建议做，而且是 6 个新增候选里第二优先的方向。

推荐定位：

> Home comfort calculator hub for room AC BTU, portable AC sizing, dehumidifier pint size, CFM by ACH, bathroom fan sizing, garage ventilation, and basic HVAC unit conversions.

第一版应该做：

1. Room AC BTU Calculator
2. Window AC Size Calculator
3. Portable AC Size Calculator
4. AC Tonnage Converter / Calculator
5. Dehumidifier Size Calculator
6. Basement Dehumidifier Size Calculator
7. CFM by ACH Calculator
8. ACH Calculator
9. Bathroom Fan CFM Calculator
10. Garage Ventilation Calculator
11. Room Ventilation Calculator
12. BTU to kW / Watts / Tons Converter

不建议一开始做：

- Manual J load calculation 替代品
- 全屋中央空调最终选型
- heat pump sizing 最终建议
- duct design / Manual D 替代品
- wire size、breaker size、refrigerant、gas furnace、combustion safety
- mold/asthma/allergy/health diagnosis
- 保证某个空调或除湿机一定能解决用户问题
- HVAC contractor lead 伪装成免费工具

这个方向适合 AdSense 的原因：

- 用户已经在搜 `BTU calculator`、`room AC size calculator`、`portable AC size calculator`、`dehumidifier size calculator`、`basement dehumidifier size chart`、`CFM calculator`、`ACH calculator`、`bathroom fan CFM calculator`、`AC tonnage calculator`。
- 输入低敏感：房间面积、层高、窗户、日照、房间类型、湿度程度、ACH、CFM，不需要地址、账单、账号或个人健康信息。
- 结果即时：BTU/h、AC tonnage、dehumidifier pints/day、CFM、ACH、fan size 可以实时计算。
- 搜索和购买意图强：用户常在买空调、除湿机、排风扇、风管配件前搜索。
- 页面可以提供充分出版价值：公式、官方经验规则、oversizing 风险、humidity/ventilation 解释、房间场景、worked examples、限制说明。
- 广告和 affiliate 路径强：房间空调、portable AC、除湿机、浴室风扇、空气净化器、滤网、温湿度计、HVAC tools、本地 HVAC lead。

最大风险：

- HVAC sizing 容易被用户误认为专业设计，必须反复说明是 preliminary estimate。
- BTU 估算过于简化，真实负荷受 insulation、climate、windows、orientation、occupants、appliances、air leakage 影响。
- 除湿机 sizing 与温湿度、房间密闭性、渗水、地下室条件有关，不能承诺解决 mold。
- CFM/duct 页面容易进入施工级设计，MVP 应只做 ACH/ventilation education 和 bathroom/garage fan sizing，不做完整 duct design。
- 医疗/健康相关表述必须谨慎，不承诺改善哮喘、过敏或疾病。

最终判断：7 个门槛中约 6.5/7 通过。值得做，但产品定位必须是“room-level home comfort estimation”，不是“professional HVAC design”。

---

## 2. 调研依据

### 2.1 官方/高可信来源

- 美国能源部 Room Air Conditioners 页面说明，房间空调通常范围约 5,500-14,000 BTU/h；购买时需要按房间大小选择合适容量，通常每平方英尺约需 20 BTU。来源：https://www.energy.gov/energysaver/room-air-conditioners
- 同一 DOE 页面提醒，空调过大时会很快降温但不能充分除湿，导致房间感觉潮湿；过小则难以达到舒适温度。来源：https://www.energy.gov/energysaver/room-air-conditioners
- DOE Federal Energy Management Program 的 room air conditioner 采购指南同样强调应选择适合空间大小的设备，过大会增加购买成本和能耗，并影响除湿。来源：https://www.energy.gov/eere/femp/purchasing-energy-efficient-room-air-conditioners
- ENERGY STAR Room Air Conditioners 页面提供 room AC 相关产品类别和效率筛选入口，可作为购买导向内容的可信来源。来源：https://www.energystar.gov/products/room_air_conditioners
- ENERGY STAR Certified Dehumidifiers Product Finder 提供 dehumidification capacity、integrated energy factor、annual energy use 等字段，说明除湿机 sizing 和能耗可以通过产品额定数据解释。来源：https://www.energystar.gov/productfinder/product/certified-dehumidifiers/results
- HVI Bathroom Ventilation 页面给出住宅浴室通风建议：100 平方英尺以下的浴室通常按每平方英尺 1 CFM 估算，最小 50 CFM；大型浴室按 fixtures 计算。来源：https://www.hvi.org/resources/publications/bathroom-ventilation/
- ASHRAE Standard 62.2 是住宅通风的核心标准之一，公开资料中可见 kitchen、bathroom、garage 等场景的 CFM 指标和局部排风要求示例。来源：https://www.ashrae.org/File%20Library/Technical%20Resources/Standards%20and%20Guidelines/Standards%20Addenda/62-2001/62-2001_Addendum-n.pdf
- ACCA 官方说明 Manual J 是住宅负荷计算方法，Manual S 用于住宅设备选择，Manual D 用于住宅 duct design。这说明本站不能把简化工具包装成专业 HVAC 设计。来源：https://www.acca.org/standards/technical-manuals
- EPA 关于住宅通风的资料强调通风需求受房屋大小、居住人数、污染源、空气密封程度等影响，应结合专业标准和实际情况。来源：https://www.epa.gov/indoor-air-quality-iaq/how-much-ventilation-do-i-need-my-home-improve-indoor-air-quality
- EPA mold/moisture 资料通常建议控制湿度、修复水源和通风，但不应把普通除湿机计算器作为 mold 治疗或健康承诺工具。来源：https://www.epa.gov/mold
- DOE 关于 portable air conditioners 的能效和测试规则资料提到 portable AC 有专门能效评价方式，市场上还存在 BTU rating / SACC / CEER 口径差异；页面内容应提醒用户看产品标签。来源：https://www.energy.gov/eere/buildings/articles/energy-conservation-program-test-procedure-portable-air-conditioners
- Google AdSense 政策要求页面不能主要为展示广告而创建，不能诱导点击，广告位置不能误导用户。来源：https://support.google.com/adsense/answer/48182?hl=en
- Google Search helpful content 文档强调内容应面向用户、有实质帮助、清楚来源和可信度。来源：https://developers.google.com/search/docs/fundamentals/creating-helpful-content

### 2.2 Autocomplete 搜索信号

本地抓取 Google autocomplete 后，HVAC 方向出现 92 条相关建议，输出文件：

`D:\桌面\project\project4\tools\seo-lite\outputs\hvac_suggestions.csv`

典型长尾：

- `btu calculator ac`
- `btu calculator for room`
- `btu calculator mini split`
- `room ac size calculator`
- `window air conditioner room size calculator`
- `room size ac tonnage calculator`
- `portable air conditioner room size calculator`
- `what size portable air conditioner for 1000 square feet`
- `14 000 btu portable air conditioner room size`
- `dehumidifier size calculator`
- `dehumidifier size calculator metric`
- `dehumidifier room size calculator`
- `basement dehumidifier size chart`
- `what size dehumidifier for 1000 sq ft basement`
- `cfm calculator hvac`
- `cfm calculator for exhaust fan`
- `cfm calculator formula`
- `ach calculator cfm`
- `bathroom fan cfm calculator`
- `bathroom exhaust fan size calculator`
- `duct size calculator by cfm`
- `duct size calculator excel`
- `ac tonnage calculator formula`

结论：

- 用户确实在按工具词搜索。
- 搜索意图集中在“买多大设备”而不是学术知识。
- AC、dehumidifier、CFM/ACH、bathroom fan 是最适合第一版的组合。
- `duct size calculator` 有搜索，但它越界风险更高，应放到后期或只做教育性 airflow/velocity converter。

### 2.3 竞品/替代方案观察

竞品大致分为七类：

1. 泛 BTU 计算器
   - 例：Calculator.net BTU Calculator、Omni Calculator、Inch Calculator、LearnMetrics。
   - 优点：证明 `BTU calculator` 需求长期存在。
   - 缺口：许多页面是泛公式或广告页，没有把 room AC、portable AC、dehumidifier、CFM、bathroom fan 串成 home comfort workflow。
   - 来源：https://www.calculator.net/btu-calculator.html

2. 房间空调 sizing 工具
   - 例：ACCalculator、HVACDirect、各品牌 room AC size chart。
   - 优点：用户购买前强搜索。
   - 缺口：很多页面只按面积给 BTU，没有清楚解释 oversizing、日照、层高、厨房、人和 portable AC rating 差异。

3. Dehumidifier size 计算器
   - 例：HVACBase、HowManyBTUs、Dehumidify.net、PickHVAC、零售商 buying guide。
   - 优点：地下室/潮湿房间搜索强，affiliate 价值高。
   - 缺口：不少页面混淆旧 AHAM 口径、新 DOE 口径、pint/day、room dampness 和实际湿度条件。

4. CFM / ACH 计算器
   - 例：Omni、CalculatorAtoZ、engineering calculators、HVAC school 工具。
   - 优点：公式稳定，输入低敏感。
   - 缺口：泛 CFM 词有发动机、空压机、HVAC 混杂意图；本站应聚焦 room ventilation / exhaust fan / ACH。

5. Bathroom fan sizing 工具
   - 例：HVI、Home Depot/Lowes guide、bath fan calculator 小站。
   - 优点：低风险、购买意图强。
   - 缺口：很多内容只给 1 CFM/ft²，没有和噪音、duct length、shower/toilet fixtures、timer/humidity sensor 解释结合。

6. Duct size calculator
   - 例：HVACDirect、TruTechTools、engineering toolbox、品牌表格。
   - 优点：搜索明确。
   - 缺口：专业边界强，真正 duct design 需要 Manual D、static pressure、friction rate、equipment blower、registers。

7. 品牌/零售商 sizing guide
   - 例：Daikin、LG、Home Depot、Lowes、Aprilaire、Frigidaire。
   - 优点：转化强。
   - 缺口：偏品牌/产品，不一定中立；工具可做跨品牌初步估算，再导向产品选择。

竞品启发：

- 不要只做 `BTU = area × 20` 的薄页。
- 第一版要围绕用户购买前的具体问题：这个房间用多大空调？地下室用多大除湿机？浴室风扇要多少 CFM？
- CFM/ACH 可以做，但要聚焦通风教育和小场景，不做 duct system design。
- Duct size、mini split、heat pump、whole-home sizing 可以后期作为 guide 或转换器，不作为 MVP 主工具。

---

## 3. 7 个门槛问题

| 问题 | 判断 | 说明 |
|---|---|---|
| 用户是否已经在搜这个工具？ | 通过 | `BTU calculator`、`room AC size calculator`、`portable AC size calculator`、`dehumidifier size calculator`、`CFM calculator`、`ACH calculator`、`bathroom fan CFM calculator` 都有公开搜索结果和 autocomplete。 |
| 前 10 个搜索结果有没有弱页面？ | 部分通过 | 头部 BTU 词有大站和零售商，但长尾中仍有单页工具、旧 UI、小站、薄解释页；机会在 room type、portable AC、basement dehumidifier、bathroom fan、ACH 长尾。 |
| 能不能做 20+ 高质量长尾页？ | 通过 | 可按面积、房间类型、层高、日照、窗户、地下室、车库、浴室、湿度、设备类型、BTU/tonnage、ACH/CFM 拆出大量页面。 |
| 输入是否低敏感、无需登录？ | 通过 | 输入房间尺寸、湿度程度、人数、窗户、层高、ACH、CFM，不需要身份、地址、健康数据、账号。 |
| 工具结果是否即时、可分享、可复用？ | 通过 | 计算即时；不同房间、设备和场景会反复使用；结果可复制、分享、导出。 |
| 页面是否能提供足够出版价值？ | 通过 | 可解释 BTU、tons、EER/CEER、oversizing、humidity、pints/day、ACH、CFM、bath fan、portable AC SACC。 |
| 广告不赚钱时是否还有 affiliate / 模板 / 导流路径？ | 通过 | 空调、portable AC、除湿机、浴室风扇、空气净化器、滤网、温湿度计、HVAC lead、home improvement retailer affiliate。 |

结论：6.5/7 可以做。唯一扣分点是头部词竞争强且专业边界明显，但长尾空间足够。

---

## 4. 目标用户

### 4.1 主要用户

1. 买房间空调或窗机的家庭用户
   - 痛点：不知道 5,000 / 8,000 / 10,000 / 12,000 / 14,000 BTU 对应多大房间。
   - 搜索词：`room ac size calculator`, `window air conditioner room size calculator`, `what size AC for 300 sq ft room`。
   - 需要结果：推荐 BTU range、过大/过小提醒、可选设备类别。

2. 买 portable AC 的用户
   - 痛点：portable AC 的 BTU 标称、SACC、房间面积和实际效果容易混乱。
   - 搜索词：`portable ac size calculator`, `14 000 btu portable air conditioner room size`, `what size portable AC for 1000 square feet`。
   - 需要结果：房间估算、SACC/ASHRAE BTU 口径提示、排热和门窗密封提醒。

3. 地下室/潮湿房间用户
   - 痛点：不知道 30 pint、50 pint、70 pint 除湿机适合多大房间，尤其 basement。
   - 搜索词：`dehumidifier size calculator`, `what size dehumidifier for 1000 sq ft basement`, `basement dehumidifier size chart`。
   - 需要结果：pints/day range、湿度严重程度、排水方式、温度和密封性提醒。

4. 浴室/厨房/洗衣房排风用户
   - 痛点：不知道 bathroom fan 需要多少 CFM。
   - 搜索词：`bathroom fan cfm calculator`, `bathroom exhaust fan size calculator`, `shower fan size calculator`。
   - 需要结果：按面积/fixtures 给 CFM，提醒 duct length、sone、humidity sensor。

5. 通风/空气交换初学者
   - 痛点：看到 ACH、CFM、room volume，不知道怎么互算。
   - 搜索词：`ach calculator cfm`, `cfm calculator formula`, `room ventilation calculator`。
   - 需要结果：CFM ↔ ACH 互算，适用范围解释。

6. 轻度 DIY / homeowner
   - 痛点：想快速理解 AC tonnage、BTU、kW、CFM、tons 的关系。
   - 搜索词：`ac tonnage calculator`, `btu to tons calculator`, `cfm calculator hvac`。
   - 需要结果：单位转换和初步估算，不做施工级建议。

### 4.2 非目标用户

- 需要 Manual J / Manual S / Manual D 的专业 HVAC contractor。
- 正在做中央空调、heat pump、furnace、duct system 正式设计的人。
- 需要处理 mold remediation、asthma、allergy、medical ventilation 的用户。
- 需要 refrigerant charge、gas furnace venting、combustion air、electrical breaker sizing 的用户。
- 商业建筑、实验室、工业通风、厨房商用 hood、洁净室用户。

这些场景应转向专业工程师、HVAC contractor、local code、ACCA manuals、ASHRAE standards 或设备厂商。

---

## 5. 网站定位

推荐英文定位：

> Free room comfort calculators for AC BTU, portable AC size, dehumidifier pints, CFM, ACH, and bathroom fan sizing.

中文解释：

这是一个帮助普通用户在购买房间空调、portable AC、除湿机、浴室排风扇或理解 CFM/ACH 前做初步估算的免费工具站。用户输入房间面积、层高、日照、湿度、ACH 或 CFM，网站输出推荐范围、公式、假设、注意事项和下一步参考。

不要定位成：

- professional HVAC load calculation software
- Manual J calculator
- duct design software
- mold removal tool
- medical ventilation calculator
- code compliance calculator

推荐品牌表达：

- Estimate the right size before you buy.
- Simple AC, dehumidifier, and ventilation calculators for rooms.
- BTU, CFM, ACH, and pint-size estimates with clear assumptions.

独立性声明：

> This site provides educational estimates only. It does not replace Manual J, Manual S, Manual D, a licensed HVAC contractor, local code, product manuals, or professional mold/health advice.

---

## 6. 到底该做什么内容

这个站应该做成“房间舒适度 sizing 工具矩阵”，不是泛 HVAC 百科，也不是工程软件。

### 6.1 第一层：房间空调 BTU / portable AC

目标：吃下最大搜索入口和购买前需求。

核心问题：

- 我的房间需要多少 BTU？
- 5,000 / 8,000 / 10,000 / 12,000 / 14,000 BTU 适合多大房间？
- portable AC 的 BTU 和 window AC 有什么差别？
- 空调太大会怎样？太小会怎样？

应做工具：

- Room AC BTU Calculator
- Window AC Size Calculator
- Portable AC Size Calculator
- BTU to Tons Calculator
- BTU to kW / Watts Converter

出版价值：

- 解释 DOE 的 20 BTU/ft² 经验值。
- 解释 ENERGY STAR / DOE 的房间空调尺寸表。
- 解释 oversizing 会影响除湿。
- 解释日照、厨房、人数、层高、隔热、窗户影响。
- 解释 portable AC 的 SACC/BTU 标签差异。

### 6.2 第二层：除湿机 sizing

目标：承接 basement / damp room 的高购买意图。

核心问题：

- 这个地下室需要 30 pint 还是 50 pint？
- pints/day 是什么意思？
- 温度、湿度、渗水、房间密封性怎么影响除湿机？
- 为什么除湿机容量口径会变化？

应做工具：

- Dehumidifier Size Calculator
- Basement Dehumidifier Size Calculator
- Pint to Liter Converter
- Dehumidifier Running Cost Calculator
- Humidity Target Calculator

出版价值：

- 解释 pints/day capacity。
- 解释 room size、dampness、temperature、air leakage。
- 解释 continuous drain、pump、bucket size。
- 解释新旧容量口径可能不同，用户要看产品标签。
- 明确不承诺 mold 处理。

### 6.3 第三层：CFM / ACH / bathroom fan

目标：切入低风险通风工具和排风扇购买意图。

核心问题：

- 一个房间要多少 CFM 才能达到 X ACH？
- 当前 CFM 对这个房间等于多少 ACH？
- 浴室排风扇需要多少 CFM？
- 车库/地下室/洗衣房通风如何粗估？

应做工具：

- CFM by ACH Calculator
- ACH Calculator
- Room Ventilation Calculator
- Bathroom Fan CFM Calculator
- Garage Ventilation Calculator
- Kitchen / Laundry Exhaust CFM guide

出版价值：

- 解释 ACH 和 CFM。
- 解释 room volume。
- 解释 bathroom fan 的 1 CFM/ft² 简化规则和大型浴室 fixtures 规则。
- 解释 duct length、backdraft damper、noise/sone、humidity sensor。
- 不做商业厨房、燃气设备、code-grade 通风设计。

### 6.4 第四层：单位转换和教育页

目标：支撑长尾和内部链接。

应做：

- BTU to Tons
- Tons to BTU
- BTU to kW
- CFM to ACH
- ACH to CFM
- Pints to Liters
- Sq ft to BTU charts
- Room size charts

这些页面不能只有转换器，必须配：

- 公式
- 使用场景
- 限制
- 相关主工具链接

### 6.5 第五层：模板和导流页

可做：

- Room AC sizing worksheet
- Basement humidity checklist
- Bathroom fan replacement checklist
- Portable AC buying checklist
- Dehumidifier comparison spreadsheet
- HVAC sizing questions to ask a contractor

这些页面用于：

- 邮件订阅
- 模板下载
- affiliate 导流
- 本地 contractor lead 的前置教育

---

## 7. MVP 范围

### 7.1 MVP 必做工具

1. Room AC BTU Calculator
   - 输入：room length、width、ceiling height、sun exposure、shade、number of occupants、kitchen yes/no、insulation estimate。
   - 输出：recommended BTU range、tons、oversizing/undersizing warning。
   - 目标关键词：`room ac size calculator`、`btu calculator for room`。

2. Window AC Size Calculator
   - 输入：room sq ft、sun/shade、occupants、kitchen、ceiling height。
   - 输出：BTU range、common unit sizes、ENERGY STAR label reminder。
   - 目标关键词：`window air conditioner room size calculator`。

3. Portable AC Size Calculator
   - 输入：room sq ft、ceiling height、sun exposure、heat sources、hose type optional。
   - 输出：estimated cooling capacity、SACC/BTU label explanation、portable AC caveats。
   - 目标关键词：`portable ac size calculator`。

4. Dehumidifier Size Calculator
   - 输入：room sq ft、ceiling height optional、dampness level、temperature、basement yes/no、water intrusion yes/no。
   - 输出：pints/day range、drainage recommendation、warning if water source should be fixed。
   - 目标关键词：`dehumidifier size calculator`。

5. Basement Dehumidifier Size Calculator
   - 输入：basement sq ft、dampness、temperature、finished/unfinished、drain access。
   - 输出：pint range、continuous drain/pump hint、mold disclaimer。
   - 目标关键词：`what size dehumidifier for 1000 sq ft basement`。

6. CFM by ACH Calculator
   - 输入：length、width、height、target ACH。
   - 输出：required CFM。
   - 目标关键词：`ach calculator cfm`。

7. ACH Calculator
   - 输入：room dimensions、fan CFM。
   - 输出：ACH。
   - 目标关键词：`ach calculator`。

8. Bathroom Fan CFM Calculator
   - 输入：bathroom sq ft、ceiling height、fixtures、shower/tub/toilet、duct length optional。
   - 输出：recommended CFM、minimum 50 CFM reminder、noise and duct notes。
   - 目标关键词：`bathroom fan cfm calculator`。

9. AC Tonnage Calculator
   - 输入：BTU/h 或 room estimate。
   - 输出：tons、BTU/h、kW conversion。
   - 目标关键词：`ac tonnage calculator`。

10. BTU / CFM / Pint Unit Converter
    - 输入：BTU、tons、kW、pints、liters。
    - 输出：converted values and use cases。

### 7.2 MVP 必做内容页

第一批 28 个页面：

1. `/room-ac-btu-calculator/`
2. `/window-ac-size-calculator/`
3. `/portable-ac-size-calculator/`
4. `/ac-tonnage-calculator/`
5. `/dehumidifier-size-calculator/`
6. `/basement-dehumidifier-size-calculator/`
7. `/cfm-by-ach-calculator/`
8. `/ach-calculator/`
9. `/bathroom-fan-cfm-calculator/`
10. `/garage-ventilation-calculator/`
11. `/btu-to-tons-calculator/`
12. `/btu-to-kw-calculator/`
13. `/pints-to-liters-calculator/`
14. `/guides/how-many-btu-per-square-foot/`
15. `/guides/why-oversized-ac-does-not-dehumidify/`
16. `/guides/portable-ac-sacc-vs-btu/`
17. `/guides/30-pint-vs-50-pint-dehumidifier/`
18. `/guides/what-size-dehumidifier-for-basement/`
19. `/guides/cfm-vs-ach/`
20. `/guides/bathroom-fan-cfm-guide/`
21. `/room-size/what-size-ac-for-150-sq-ft/`
22. `/room-size/what-size-ac-for-300-sq-ft/`
23. `/room-size/what-size-ac-for-500-sq-ft/`
24. `/dehumidifier/what-size-dehumidifier-for-1000-sq-ft-basement/`
25. `/portable-ac/14000-btu-portable-ac-room-size/`
26. `/bathroom-fan/what-size-fan-for-small-bathroom/`
27. `/templates/room-ac-sizing-worksheet/`
28. `/templates/basement-humidity-checklist/`

### 7.3 MVP 必做能力

- 所有计算在浏览器端即时完成。
- 无登录、无地址、无健康数据输入。
- 支持 ft/in 和 metric 输入。
- 输出结果以范围呈现，不给单一“保证正确”的数字。
- 每页显示公式、假设、限制、来源和更新时间。
- 用户可复制结果、分享 URL、导出 CSV。
- 所有专业边界处显示 disclaimer。

---

## 8. 第一版不做的功能

1. 不做 Manual J 替代
   - 原因：真实负荷计算需要气候、建筑围护结构、窗户、渗透、朝向、内部负荷等详细参数。

2. 不做 whole-home central AC sizing
   - 原因：整屋系统涉及 duct、设备匹配、static pressure、zone、return air、contractor verification。

3. 不做 duct design
   - 原因：duct size 不是只靠 CFM；还需要 friction rate、static pressure、duct material、length、fittings、blower capacity。

4. 不做 refrigerant / furnace / combustion safety
   - 原因：高风险，需要专业资质。

5. 不做 mold diagnosis
   - 原因：除湿机 sizing 不能替代 moisture source repair 或 mold remediation。

6. 不做健康承诺
   - 原因：不能声称改善哮喘、过敏、呼吸疾病。

7. 不做强 lead capture
   - 原因：第一版应先建立工具可信度，不要一上来让用户填地址找 contractor。

8. 不做产品自动推荐
   - 原因：先做 sizing 和教育，再用 affiliate 自然承接。

---

## 9. 信息架构

推荐 URL 结构：

```text
/
/room-ac-btu-calculator/
/window-ac-size-calculator/
/portable-ac-size-calculator/
/ac-tonnage-calculator/
/dehumidifier-size-calculator/
/basement-dehumidifier-size-calculator/
/cfm-by-ach-calculator/
/ach-calculator/
/bathroom-fan-cfm-calculator/
/garage-ventilation-calculator/
/room-ventilation-calculator/
/btu-to-tons-calculator/
/btu-to-kw-calculator/
/pints-to-liters-calculator/
/guides/how-many-btu-per-square-foot/
/guides/why-oversized-ac-does-not-dehumidify/
/guides/portable-ac-sacc-vs-btu/
/guides/30-pint-vs-50-pint-dehumidifier/
/guides/cfm-vs-ach/
/guides/bathroom-fan-cfm-guide/
/room-size/what-size-ac-for-150-sq-ft/
/room-size/what-size-ac-for-300-sq-ft/
/room-size/what-size-ac-for-500-sq-ft/
/dehumidifier/what-size-dehumidifier-for-1000-sq-ft-basement/
/portable-ac/14000-btu-portable-ac-room-size/
/bathroom-fan/what-size-fan-for-small-bathroom/
/templates/room-ac-sizing-worksheet/
/templates/basement-humidity-checklist/
```

导航结构：

- Calculators
  - AC BTU
  - Portable AC
  - Dehumidifier
  - CFM & ACH
  - Bathroom Fan
  - Unit Converters
- Guides
  - BTU and room size
  - Portable AC ratings
  - Humidity and dehumidifiers
  - Ventilation basics
  - Bathroom fans
- Room Size
  - 150 sq ft
  - 300 sq ft
  - 500 sq ft
  - Bedroom
  - Basement
  - Garage
- Templates
  - AC sizing worksheet
  - Humidity checklist
  - Contractor questions

关键原则：

- 首页是工具目录和主工具入口，不做营销 landing。
- 每个工具页第一屏直接可用。
- 每个长尾页用预填参数连接到主工具。
- Guide 页必须链接回工具。
- 工具页必须链接到官方来源和边界说明。

---

## 10. SEO 内容矩阵

### 10.1 核心词

- BTU calculator
- room AC size calculator
- window air conditioner room size calculator
- portable AC size calculator
- AC tonnage calculator
- dehumidifier size calculator
- basement dehumidifier size calculator
- CFM calculator
- ACH calculator
- bathroom fan CFM calculator
- garage ventilation calculator

### 10.2 第一批长尾词 70 个

1. `btu calculator for room`
2. `btu calculator ac`
3. `btu calculator air conditioner`
4. `how many btu per square foot`
5. `what size ac for 150 sq ft room`
6. `what size ac for 200 sq ft room`
7. `what size ac for 300 sq ft room`
8. `what size ac for 400 sq ft room`
9. `what size ac for 500 sq ft room`
10. `5000 btu air conditioner room size`
11. `8000 btu air conditioner room size`
12. `10000 btu air conditioner room size`
13. `12000 btu air conditioner room size`
14. `14000 btu air conditioner room size`
15. `window air conditioner room size calculator`
16. `portable ac size calculator`
17. `portable air conditioner room size calculator`
18. `what size portable air conditioner for 1000 square feet`
19. `14000 btu portable air conditioner room size`
20. `6000 btu portable air conditioner room size`
21. `portable ac sacc vs btu`
22. `room ac tonnage calculator`
23. `ac tonnage calculator formula`
24. `btu to tons calculator`
25. `tons to btu calculator`
26. `btu to kw calculator`
27. `dehumidifier size calculator`
28. `dehumidifier room size calculator`
29. `dehumidifier size chart`
30. `dehumidifier size chart litres`
31. `basement dehumidifier size chart`
32. `what size dehumidifier for 1000 sq ft basement`
33. `what size dehumidifier for 1500 sq ft basement`
34. `how to size a dehumidifier for a basement`
35. `30 pint vs 50 pint dehumidifier`
36. `dehumidifier pint size calculator`
37. `dehumidifier running cost calculator`
38. `cfm calculator hvac`
39. `cfm calculator formula`
40. `cfm calculator for exhaust fan`
41. `cfm calculator for fan`
42. `ach calculator`
43. `ach calculator cfm`
44. `ach calculator metric`
45. `cfm to ach calculator`
46. `ach to cfm calculator`
47. `room ventilation calculator`
48. `bathroom fan cfm calculator`
49. `bathroom fan size calculator`
50. `bathroom exhaust fan cfm calculator`
51. `bathroom exhaust fan size calculator`
52. `bathroom fan minimum cfm calculator`
53. `shower fan size calculator`
54. `bathroom extractor fan size calculator`
55. `garage ventilation calculator`
56. `garage exhaust fan cfm calculator`
57. `laundry room exhaust fan size calculator`
58. `duct size calculator by cfm`
59. `duct size calculator chart`
60. `duct cfm calculator`
61. `duct velocity calculator`
62. `hvac airflow calculator`
63. `mini split btu calculator`
64. `bedroom ac size calculator`
65. `basement ac size calculator`
66. `garage ac size calculator`
67. `sunny room btu calculator`
68. `high ceiling btu calculator`
69. `kitchen btu calculator`
70. `room cooling calculator`

### 10.3 第一批内容标题

1. Room AC BTU Calculator: Estimate the Right Air Conditioner Size
2. Window Air Conditioner Size Calculator by Room Size
3. Portable AC Size Calculator: SACC, BTU, and Room Size
4. AC Tonnage Calculator: Convert BTU to Tons
5. Dehumidifier Size Calculator: Pints per Day by Room Size and Dampness
6. Basement Dehumidifier Size Calculator
7. CFM by ACH Calculator
8. ACH Calculator: Air Changes per Hour from CFM
9. Bathroom Fan CFM Calculator
10. Garage Ventilation Calculator
11. How Many BTU per Square Foot for a Room AC?
12. Why an Oversized AC Can Leave a Room Humid
13. Portable AC SACC vs BTU: What the Label Means
14. 30 Pint vs 50 Pint Dehumidifier: Which Size Do You Need?
15. CFM vs ACH: Ventilation Terms Explained
16. Bathroom Fan Sizing Guide
17. What Size AC for a 300 Sq Ft Room?
18. What Size Dehumidifier for a 1000 Sq Ft Basement?
19. 14,000 BTU Portable AC Room Size Guide
20. Room AC Sizing Worksheet

### 10.4 可批量生成的页面类型

- 面积页：150、200、250、300、400、500、700、1000 sq ft。
- 设备尺寸页：5,000、6,000、8,000、10,000、12,000、14,000 BTU。
- 房间类型页：bedroom、living room、office、garage、basement、kitchen、sunroom。
- 除湿机页：30 pint、50 pint、70 pint、basement、crawl space、finished basement。
- 通风页：bathroom fan、garage fan、laundry room exhaust、ACH、CFM。
- 转换页：BTU to tons、tons to BTU、BTU to kW、pints to liters、CFM to ACH。
- 解释页：oversizing、SACC、CEER、humidity、ACH、CFM、sone、duct length。

### 10.5 中文/英文是否都做

第一版只做英文。

原因：

- HVAC/AC/dehumidifier 的英语搜索词非常直接，广告主和 affiliate 价值高。
- 官方来源和产品标签主要用英文，引用和维护更清晰。
- 中文页面可以后续做，但不要一开始维护两套单位、产品标准和关键词矩阵。

---

## 11. 功能需求

### 11.1 通用输入组件

| 字段 | 类型 | 默认 | 说明 |
|---|---|---|---|
| Room length | number | 12 ft | 房间长度 |
| Room width | number | 10 ft | 房间宽度 |
| Room area | number | auto | 可直接输入面积 |
| Ceiling height | number | 8 ft | 层高 |
| Room type | select | Bedroom | 卧室、客厅、厨房、地下室、车库等 |
| Sun exposure | select | Average | Shaded / average / sunny |
| Occupants | number | 2 | 常驻人数 |
| Kitchen | boolean | false | 是否厨房或高热源空间 |
| Insulation | select | Average | Poor / average / good |
| Dampness level | select | Moderate | Slightly damp / damp / very damp / wet |
| Current humidity | number | optional | 当前 RH |
| Target humidity | number | 50% | 目标 RH |
| Fan CFM | number | optional | 风扇 CFM |
| Target ACH | number | optional | 目标换气次数 |
| Fixtures | count | optional | 浴室 fixtures |
| Duct length | number | optional | 排风 duct 长度，用于提示而非精确设计 |

### 11.2 通用输出组件

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

### 11.3 结果表达原则

结果应以范围呈现：

```text
Estimated room AC size: 8,000-10,000 BTU/h
```

不要只给：

```text
You need exactly 9,214 BTU/h
```

原因：

- 家用 HVAC sizing 本身有大量现场变量。
- 用户需要的是购买前范围，不是工程设计数值。

### 11.4 结果拆解

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

### 11.5 分享和导出

MVP 必做：

- Copy result summary
- Copy assumptions
- Share URL with query params
- Download CSV
- Print/save as PDF

后续可做：

- Room comparison worksheet
- Product shortlist
- Local contractor questions
- Saved rooms in localStorage

---

## 12. 非功能需求

### 12.1 性能

- 首屏工具 2 秒内可交互。
- 公式本地计算，不依赖 API。
- 页面可静态生成。
- 移动端表单要可用。

### 12.2 隐私

- 不需要登录。
- 不收集地址。
- 不收集健康症状。
- 不上传房屋图纸。
- 分享 URL 只包含低敏感尺寸和选项。

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

### 12.4 AdSense 合规

- 广告不得放在 Calculate、Copy、Download 按钮旁。
- 广告不得伪装成产品推荐或结果卡。
- 结果和广告区必须视觉分离。
- 每页不能只有表单和广告。
- 必须有 About、Contact、Privacy、Terms、Disclaimer。

### 12.5 SEO

- 每页唯一 title、meta description、H1。
- 工具页使用 WebApplication schema。
- Guide 页使用 Article / FAQ schema。
- FAQ 必须在页面可见。
- canonical 指向正式 URL。
- sitemap 包含工具页、guide 页、模板页。
- 页面正文可见公式、输入、输出和限制。

---

## 13. 数据与公式

### 13.1 房间面积

```text
room_area_sqft = length_ft × width_ft
```

复杂房间：

```text
total_area = area_section_1 + area_section_2 + ...
```

### 13.2 房间体积

```text
room_volume_cuft = length_ft × width_ft × ceiling_height_ft
```

Metric：

```text
room_volume_m3 = length_m × width_m × height_m
```

### 13.3 Room AC 基础 BTU 估算

DOE 简化规则：

```text
base_BTU_per_hour = room_area_sqft × 20
```

说明：

- 这是房间空调的初步经验规则。
- 不等于 Manual J。
- 对隔热、气候、窗户、朝向、渗风、层高只做粗略修正。

### 13.4 BTU 调整项

参考常见 ENERGY STAR / DOE 风格房间空调经验：

```text
adjusted_BTU = base_BTU
```

示例修正：

```text
if room_is_heavily_shaded:
  adjusted_BTU *= 0.90

if room_is_very_sunny:
  adjusted_BTU *= 1.10

if occupants > 2:
  adjusted_BTU += (occupants - 2) × 600

if room_is_kitchen:
  adjusted_BTU += 4000
```

层高修正：

```text
height_factor = ceiling_height_ft / 8
adjusted_BTU *= height_factor
```

注意：

- 层高修正不是 DOE 20 BTU/ft² 规则的官方精确扩展，只是体积影响提示。
- UI 应显示为 optional advanced adjustment。

### 13.5 BTU to Tons

```text
tons = BTU_per_hour ÷ 12000
```

说明：

- 1 ton cooling capacity 通常等于 12,000 BTU/h。
- 该转换可用于理解设备标签，不用于整屋系统最终选型。

### 13.6 BTU to kW

```text
kW_thermal = BTU_per_hour × 0.000293071
```

说明：

- 这是热量/冷量单位转换，不是电力输入功率。
- 空调耗电还取决于 EER、CEER、SEER2、COP 等效率。

### 13.7 EER / watts 估算

```text
input_watts = BTU_per_hour ÷ EER
```

说明：

- 仅在用户输入 EER/CEER 时用于估算用电。
- 不要默认把 BTU/h 直接等同电功率。

### 13.8 Dehumidifier size

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

注意：

- 不同测试标准和产品标签会使 30/50/70 pint 的含义变化。
- 不能承诺解决 mold 或 structural moisture。

### 13.9 ACH to CFM

```text
CFM = room_volume_cuft × target_ACH ÷ 60
```

### 13.10 CFM to ACH

```text
ACH = CFM × 60 ÷ room_volume_cuft
```

### 13.11 Bathroom fan CFM

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

说明：

- 这些是通用 sizing rules，实际还要看 duct length、bend、roof/wall cap、fan rating、noise、local code。

### 13.12 Garage ventilation

教育性估算：

```text
required_CFM = garage_volume_cuft × target_ACH ÷ 60
```

限制：

- 不用于燃烧设备、CO 控制、商业车库或 code compliance。
- 必须提醒安装 CO detector，并咨询专业人士处理燃气设备和尾气风险。

### 13.13 Duct velocity converter

如果后期做教育性 duct airflow converter：

```text
velocity_fpm = CFM ÷ duct_area_sqft
```

圆形 duct area：

```text
duct_area_sqft = π × (diameter_ft / 2)^2
```

矩形 duct area：

```text
duct_area_sqft = width_ft × height_ft
```

限制：

- 只做 airflow/velocity 教育转换。
- 不叫 `Duct Design Calculator`。
- 页面必须说明不替代 Manual D。

---

## 14. 数据配置

### 14.1 AC sizing assumptions

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

### 14.2 Common AC sizes

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

### 14.3 Dehumidifier assumptions

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

### 14.4 Ventilation assumptions

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

---

## 15. AdSense 与变现策略

### 15.1 是否适合 AdSense

适合。

原因：

- 用户搜索量和购买前意图都强。
- HVAC/home comfort 广告主多。
- 页面有足够内容深度，不必做薄页。
- 工具交互可以拉长停留时间。

可能 RPM 较高的页面：

- portable AC size
- dehumidifier size
- basement dehumidifier
- bathroom fan CFM
- AC BTU calculator
- AC running cost

风险：

- 如果页面只是“面积 × 20”，很容易变低价值。
- 如果过度产品推荐，可信度下降。
- 如果承诺健康/霉菌/施工合规，风险上升。

### 15.2 广告位置建议

工具页：

- 结果区下方一个广告。
- 公式解释后一个广告。
- FAQ 前一个广告。
- 移动端不要把广告插在输入和结果之间。
- 不要把广告放在 Calculate、Copy、Download 旁边。

Guide 页：

- 首屏正文后一个广告。
- worked example 后一个广告。
- FAQ 前一个广告。

模板页：

- 下载按钮附近不放广告。
- checklist 和 worksheet 内容保持清晰。

### 15.3 Affiliate / 模板 / 导流路径

优先级：

1. 房间空调 / window AC / portable AC
   - Home Depot、Lowes、Amazon、Walmart、Best Buy。

2. 除湿机
   - basement dehumidifier、crawl space dehumidifier、ENERGY STAR dehumidifier、drain hose、condensate pump。

3. 浴室排风扇
   - bath fan、humidity sensor fan、quiet fan、duct kit、wall cap、timer switch。

4. 温湿度计 / air quality monitor
   - hygrometer、thermometer、smart sensor、CO detector。

5. 滤网 / 风扇 / 空气净化
   - AC filter、box fan、air purifier、MERV filter。

6. 本地 HVAC lead
   - 只在 guide 页面作为“需要专业计算时问 contractor 什么问题”，不要在工具结果中强推。

7. 模板
   - room AC sizing worksheet
   - basement humidity checklist
   - contractor questions checklist
   - dehumidifier comparison spreadsheet

### 15.4 不要依赖的变现

- 一开始强制用户填地址获取 contractor quote。
- 恐吓式 mold/health lead。
- “best portable AC” 薄 affiliate 榜单。
- 用不透明评分推荐产品。
- 将专业 HVAC 服务包装成免费计算结果。

---

## 16. 风险与硬停止条件

### 16.1 主要风险

1. 专业边界风险
   - 用户可能把 room calculator 当作 whole-home HVAC sizing。
   - 应对：每页明确 not Manual J；整屋系统建议找专业人士。

2. 准确性风险
   - 简化规则无法覆盖 insulation、climate、windows、orientation、air leakage。
   - 应对：结果给范围，并显示 assumptions。

3. 除湿/霉菌风险
   - 用户可能认为买除湿机即可解决所有 mold/moisture。
   - 应对：如果有 water intrusion 或 visible mold，提示修复水源和咨询专业人士。

4. Portable AC rating 混乱
   - ASHRAE BTU、SACC、CEER 容易让用户困惑。
   - 应对：单独做 guide，工具结果提醒看标签。

5. CFM/duct 越界风险
   - `duct size calculator` 搜索多，但容易进入 Manual D。
   - 应对：MVP 不做施工级 duct design，只做 ACH/CFM 和 bathroom fan。

6. 竞争风险
   - BTU 头词有大站。
   - 应对：先做 room-size、portable AC、dehumidifier、bathroom fan 长尾。

7. 健康声明风险
   - 不能声称解决 asthma/allergy。
   - 应对：用 comfort/moisture/ventilation 语言，不做医疗承诺。

### 16.2 硬停止条件

满足任意条件应暂停：

- 上线 60 天后 Search Console 几乎没有 impressions。
- 工具交互率低于 5%。
- 用户反馈集中在“结果无法用于真实购买”，且无法通过增加参数解决。
- 长尾页变成重复面积表，没有独立解释和工具预填。
- 为了增长不得不进入 Manual J / Manual D / mold remediation / health advice。
- AdSense 或 Search Console 提示低价值内容且无法补充实质内容。
- affiliate 内容淹没工具，导致页面像产品榜单。

---

## 17. 成功指标

### 17.1 上线后 30 天

- Search Console 出现 500+ impressions。
- 至少 5 个页面有 impressions。
- 工具交互率 > 10%。
- 至少 50 次计算事件。
- 至少 10 次 copy/share/export。

### 17.2 上线后 90 天

- 月自然点击 > 300。
- 月计算次数 > 1,500。
- 至少 15 个长尾词有 impressions。
- room AC 或 dehumidifier 方向至少一个页面有稳定点击。
- affiliate 点击率有早期信号。

### 17.3 上线后 180 天

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

---

## 18. 推荐实施路线

### 第 0 阶段：公式和边界

任务：

- 建立 BTU、tons、CFM、ACH、pints 单位库。
- 建立 AC sizing assumptions 配置。
- 建立 dehumidifier sizing assumptions 配置。
- 建立 disclaimer 组件。
- 建立结果范围输出组件。

验收：

- 所有结果显示假设。
- 所有专业边界有提示。
- 公式有单元测试。

### 第 1 阶段：AC / BTU 入口

先做：

1. Room AC BTU Calculator
2. Window AC Size Calculator
3. Portable AC Size Calculator
4. AC Tonnage Calculator
5. How Many BTU per Square Foot guide

原因：

- 搜索最大。
- 工具最直观。
- 可快速验证 SEO 和交互。

### 第 2 阶段：除湿机入口

再做：

1. Dehumidifier Size Calculator
2. Basement Dehumidifier Size Calculator
3. 30 Pint vs 50 Pint Dehumidifier guide
4. Basement humidity checklist

原因：

- 购买意图强。
- affiliate 空间好。
- 长尾清晰。

### 第 3 阶段：CFM / ACH / bathroom fan

再做：

1. CFM by ACH Calculator
2. ACH Calculator
3. Bathroom Fan CFM Calculator
4. Garage Ventilation Calculator
5. CFM vs ACH guide

原因：

- 公式稳定。
- 可扩展 bathroom fan affiliate。
- 但要控制 duct/code 边界。

### 第 4 阶段：长尾扩张

按 Search Console query 添加：

- specific room sizes
- specific BTU sizes
- basement sizes
- portable AC BTU pages
- bathroom fan room sizes
- metric/UK/Australia variants
- contractor question templates

---

## 19. 第一版页面清单

### 19.1 工具页

1. `/room-ac-btu-calculator/`
   - H1: Room AC BTU Calculator
   - 目标：按房间面积和条件估算 BTU。

2. `/window-ac-size-calculator/`
   - H1: Window Air Conditioner Size Calculator
   - 目标：窗口空调购买前估算。

3. `/portable-ac-size-calculator/`
   - H1: Portable AC Size Calculator
   - 目标：解释 portable AC BTU/SACC 和房间大小。

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

### 19.2 Guide 页

1. `/guides/how-many-btu-per-square-foot/`
2. `/guides/why-oversized-ac-does-not-dehumidify/`
3. `/guides/portable-ac-sacc-vs-btu/`
4. `/guides/30-pint-vs-50-pint-dehumidifier/`
5. `/guides/cfm-vs-ach/`
6. `/guides/bathroom-fan-cfm-guide/`
7. `/guides/what-is-ac-tonnage/`
8. `/guides/dehumidifier-pints-explained/`

### 19.3 长尾页

1. `/room-size/what-size-ac-for-150-sq-ft/`
2. `/room-size/what-size-ac-for-300-sq-ft/`
3. `/room-size/what-size-ac-for-500-sq-ft/`
4. `/portable-ac/14000-btu-portable-ac-room-size/`
5. `/dehumidifier/what-size-dehumidifier-for-1000-sq-ft-basement/`
6. `/bathroom-fan/what-size-fan-for-small-bathroom/`

### 19.4 模板页

1. `/templates/room-ac-sizing-worksheet/`
2. `/templates/basement-humidity-checklist/`
3. `/templates/hvac-contractor-questions/`

---

## 20. MVP 验收标准

### 20.1 工具可用性

- 用户进入页面 5 秒内知道输入什么。
- 输入变化后结果即时更新。
- 结果给范围，不给伪精确。
- 负数、空值、极端值有错误提示。
- 可复制、分享、下载 CSV。
- 移动端可用。

### 20.2 内容质量

每个工具页必须包含：

- 工具本体
- 公式
- worked example
- assumptions
- what is included
- what is not included
- safety/professional boundary disclaimer
- official sources
- FAQ
- related calculators

每个长尾页必须包含：

- 具体场景
- 预填工具
- 公式解释
- 示例计算
- 购买前 checklist
- 风险边界
- CTA 回主工具

### 20.3 可信度

- 所有结果标注 preliminary estimate。
- 所有 assumptions 可见。
- 所有来源可点击。
- 所有 AC 页面说明 not Manual J。
- 所有 CFM/duct 页面说明 not Manual D。
- 所有 dehumidifier 页面说明 not mold remediation。

### 20.4 SEO 技术

- robots.txt 正常。
- sitemap.xml 正常。
- canonical 正常。
- 页面 200。
- WebApplication / FAQ / Article schema 正常。
- Core Web Vitals 不被大型脚本拖垮。

### 20.5 AdSense 准备

- About、Contact、Privacy、Terms、Disclaimer 完成。
- 页面不是薄工具。
- 广告位不靠近按钮。
- 无广告状态下页面依然有独立价值。

---

## 21. 最终建议

这个方向值得做，但要严格收窄：

> 做“房间级舒适度 sizing 工具站”，不要做“专业 HVAC 设计站”。

最推荐第一版组合：

1. Room AC BTU Calculator
2. Portable AC Size Calculator
3. Dehumidifier Size Calculator
4. Basement Dehumidifier Size Calculator
5. CFM by ACH Calculator
6. Bathroom Fan CFM Calculator
7. AC Tonnage Calculator
8. Portable AC SACC vs BTU guide
9. 30 Pint vs 50 Pint Dehumidifier guide
10. Room AC sizing worksheet

内容策略：

- 用 `room AC size` 和 `BTU calculator` 拿大众入口。
- 用 `portable AC` 和 `dehumidifier basement` 拿购买前商业意图。
- 用 `CFM / ACH / bathroom fan` 建立工具矩阵和内部链接。
- 暂缓 `duct size calculator`，只做 ACH/CFM 和 airflow 解释，避免进入 Manual D。
- 每页必须工具 + 公式 + 示例 + 假设 + 来源 + FAQ，不做薄面积表。

一句话方案：

> 用户在搜索房间空调要多少 BTU、便携空调适合多大房间、地下室需要多大除湿机、浴室风扇要多少 CFM 或 ACH/CFM 怎么换算时，用这个免费工具站即时得到房间级估算、公式解释和购买前检查清单，不同点是把 AC、dehumidifier、CFM/ACH 和 bathroom fan 做成一个有边界、有来源、可分享的 home comfort calculator hub。

