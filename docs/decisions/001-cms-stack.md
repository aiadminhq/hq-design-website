# ADR-001: Use Notion as authoring CMS, Framer Notion Plugin as bridge

- **Status**: Proposed
- **Date**: 2026-05-25
- **Driver**: Christian (christian.wu@hqdesign.tw)
- **Plan**: [2026-05-25-hq-design-website-framer-migration.md](../migration-plan/2026-05-25-hq-design-website-framer-migration.md)

## Context

惠強室內裝修官網目前為 6 個靜態 HTML + 21 個案例 detail page，所有內容硬編碼在 HTML 內。目標是讓非工程師團隊可以維護內容、設計師可以在 Framer 內做版面，工程師不再是內容更新的瓶頸。

使用者要求：「先在本地端整理完內容，再透過 Framer 的 Notion 插件匯入 CMS」。

## Considered Options

1. **Notion + Framer 官方 Notion plugin**（決定採用）
2. Sanity + 第三方 Framer Sanity plugin
3. Airtable + Framer 官方 Airtable plugin
4. 直接寫進 Framer CMS（無外部 CMS）
5. Hygraph / Contentful / Storyblok（headless CMS）

## Decision

採用 **(1) Notion + 官方 Framer Notion plugin**，並在 git repo 內保留 `cms/schemas/*.json` (結構定義) 與 `cms/data/*.json` (內容快照) 作為 single source of truth。

## Rationale

| 標準               | Notion ✅                     | Sanity               | Airtable        | Framer 內建 |
| ------------------ | ----------------------------- | -------------------- | --------------- | ----------- |
| 本地預先整理       | Notion app + API 可程式化匯入 | 需 Studio            | 可 CSV import   | 不能        |
| 官方 Framer plugin | ✅ 官方維護                   | ❌ 第三方            | ✅ 官方         | N/A         |
| 非工程師編輯體驗   | ⭐⭐⭐⭐⭐                    | ⭐⭐⭐               | ⭐⭐⭐⭐        | ⭐⭐        |
| 雙語欄位           | 自由建 property               | Schema-as-code，較煩 | 50 欄位上限     | 受限        |
| 圖片管理           | Files & Media 上傳            | 強                   | 弱              | 弱          |
| 費用               | 免費 plan 已夠                | 免費 plan 已夠       | 免費 1k records | 含在 Framer |
| Git 友善           | 需自建 export script          | 內建 export          | CSV             | 無法        |

## Consequences

### Positive

- 內容團隊使用熟悉的 Notion 介面
- 官方 plugin 維護穩定
- `cms/data/*.json` 在 git 提供 PR review 與 disaster recovery
- 未來改用其他 CMS 時，data 已 schema 化容易遷移

### Negative

- Notion property 上限對極複雜 schema（如 gallery sections）需要拆 relation DB
- Notion API rate limit (3 req/s) — bulk import 21 個 project 需要 throttle
- Framer 訂閱費另計（預估 Framer Basic plan US$15/mo）

### Mitigations

- 為 gallery sections 額外建一個 sub-DB（HQ — Gallery Sections），透過 relation 連結到 Projects
- Importer script 加 retry + 200ms delay
- Framer Basic plan 含 CMS 1000 items，足夠承載 21 個 case + 10 個 service + 4 個 position
