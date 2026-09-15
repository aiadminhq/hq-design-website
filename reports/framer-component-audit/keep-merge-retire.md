# Keep / merge / retire 建議

## 安全決策

目前所有 candidate members 採「暫時保留、不得刪除」處理。這不是認定它們都應長期保留，而是 live XML／code evidence 尚未取得時的可回復安全狀態。`retire` 僅能在後續 evidence review 與人工確認後提出，不能因 export 成功或名稱相似而執行。

| 群組 | 暫時保留 | 合併候選 | 淘汰建議 | 理由與人工確認 |
|---|---|---|---|---|
| Footer / Footer Copy | 全部 | 若 XML、props、頁面引用一致，收斂為一個 shared footer | 暫無 | 需確認頁尾內容、responsive 與 page-specific links |
| Timeline / Timeline Copy | 全部 | 若只是 content/spacing variant，改為 controlled variant | 暫無 | 需確認 motion、process steps 與 accessibility |
| Project Portfolio cards | 全部 | 優先抽出 image/title/link/data props | 暫無 | HQ Design 可重用 card structure，但不得複製個人 portfolio data |
| Image cards | 全部 | 只有在 image ratio、overlay、interaction 可由 props 表達時合併 | 暫無 | 需確認 gallery 及 responsive layout |
| Client cards | 全部 | 依 logo/name/link schema 收斂 | 暫無 | 需確認 client identity 與授權素材 |
| Gallery Section | 全部 | 若 Copy 只有 spacing/content 差異，併為 variant | 暫無 | 需確認 CMS/image binding 與 lightbox/hover behavior |
| FAQ question-item | 全部 | 若 open/closed 由 state 控制，保留一個 accordion item | 暫無 | 需驗證 keyboard、ARIA、expanded state |
| Counter / RetroGrid / TypewriterEffect / Blur_Essence | 全部 | 僅在 `readCodeFile` 的 exports/props 與 runtime 行為可證明相容時合併 | 暫無 | Code Component 後綴不代表 duplicate；需比較 source hash 與 controls |

## HQ Design reuse notes

可優先研究 navigation、hero、project cards、gallery、timeline/process、FAQ/accordion、theme toggle 與 motion/interactions 的結構。`WebGL`、glass 或 experimental layers 只作 gated visual/reference layer；不可當作 HQ Design 的 geometry、content、brand 或 CMS authority。個人履歷、聯絡資訊與未授權素材維持排除。

## 完成人工確認前的禁止事項

- 不刪除、rename、duplicate、detach 或 merge Framer node。
- 不移除本機 exact copy 或 export asset。
- 不把 `queued`、runtime bundle、static HTML 或 DOM name 寫成 editable component source。
- 不把 candidate group 直接寫入正式 HQ Design component library。
