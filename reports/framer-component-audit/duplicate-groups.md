# Duplicate groups

下列 11 組來自 live Framer project 的唯讀盤點。分類只在已取得 XML 或 Code Component source 的範圍內成立；名稱相同或帶有 `Copy`、`_1`、`_2` 後綴，不能單獨證明 duplicate。

| Candidate group | 目前分類 | 必要 evidence |
|---|---|---|
| `Footer` / `Footer Copy` | readback_limited | normalized XML、variants/props、頁面引用、code content |
| `Timeline` / `Timeline Copy` | near_duplicate / variant candidate | 已取得兩份 XML；normalized tree 不同且觀察到相同 variant ID，仍需頁面與 interaction 比較 |
| `Card-Project Portfolio-1/2/3` | pending | XML、image/text/link props、responsive variants |
| `Image card` / `Image card 2/3` | pending | XML、image/layout props、頁面引用 |
| `Card` / `Clients Card` / copies | near_duplicate / variant candidate | 兩份 Client Card XML 已讀回；shared variants/componentRef 但 normalized tree 不同 |
| `Gallery Section` / `Gallery Section Copy` | near_duplicate / variant candidate | 兩份 XML 已讀回；Copy 另有 variant/componentRef |
| `FAQ question-item` / `Copy` | pending | XML、accordion behavior、open/closed variants |
| `Counter.tsx` / `_1` / `_2` | exact duplicate | 三份 source byte-identical；raw SHA-256 `8a0b46…a366` |
| `RetroGrid` / `_1` | near duplicate | core controls 相近，但 element/text control surface 不同 |
| `TypewriterEffect` / `_1` | near duplicate | 完整版與 lightweight control surface 不同 |
| `Blur_Essence_v3/v3_1/v4` | near duplicate / expanded candidate | source size、controls 與 effect scope 不同 |

## 分類規則

- **exact duplicate**：normalized XML tree 相同，且 variants/props 相容。
- **near duplicate**：大部分 XML tree 相同，但存在可記錄的 visual、responsive 或 interaction 差異。
- **variant candidate**：共用明確 source intent，差異可由受控 variant/prop 表達。
- **unique**：沒有足夠 evidence 找到可安全收斂的對等物。

仍未完成的 page-reference 與 interaction evidence 必須在 Fable 實作前補讀。即使 Counter 已確認完全相同，也只提供一個 canonical implementation 建議，不對 Framer source 執行 merge 或 retire；本批沒有任何 Framer mutation。
