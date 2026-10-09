# HQ Design 官網 repo 歸屬盤點

盤點日期：2026-09-03

## 已確認事實

- 本機 checkout remote：`https://github.com/chr1st1anw0w/hq-design-website.git`。
- `https://github.com/aiadminhq/hq-design-website` 與 `https://github.com/chr1st1anw0w/hq-design-website` 目前皆為 public repo，且皆顯示 forked from `ormachang-git/hq-design-website`。
- 兩個 repo 的 `HEAD` 與 `refs/heads/main` 目前都指向同一 commit：`94e8e2552f1d934457e344958b8c2284e0b671fb`。
- 本機 `HEAD` 亦為同一 commit。
- 公開頁面皆顯示 33 commits 與相同的網站檔案結構。

## 尚無法由唯讀證據判定

- 哪個 GitHub account／organization 是本次重建的正式 ownership authority。
- Vercel、Framer、domain 與 deployment secrets 實際綁定哪個 repo。
- 使用者對兩個 repo 的 admin／push 權限是否等同。

## 需要使用者裁決

建議將 `aiadminhq/hq-design-website` 指定為公司／AI 事業群的正式 repo，`chr1st1anw0w/hq-design-website` 保留個人工作副本；但在使用者確認與部署綁定 read-back 前，不修改 remote、不轉移、不建立 repo、不推送。
