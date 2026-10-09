# Fable 設計元件目錄

## 可優先重建的結構元件

| HQ Design 角色 | Framer source | Read-back 證據 | 建議用途 | 風險 |
|---|---|---|---|---|
| Navigation | `ClWUvICnj` / Navigation | 首頁與多個 detail page instance 可讀回 | responsive header、navigation state、project link | 個人 portfolio copy 必須移除 |
| ProjectCard | `RMWQkGShv` / Card-Portfolio-Vertical | 首頁 instance 可讀回，含 variant 與 card props | 作品索引卡、project metadata | image/text/link props 需改由 HQ content 提供 |
| ProjectGallery | `AGUPnwAVB` / Gallery Section | component XML 成功讀回 | 真實照片 gallery、caption、responsive image grid | CMS/image binding 尚未被確認 |
| ProcessTimeline | `HAziGIbgH` / Timeline | component XML 成功讀回，存在 variant | design process / service process | `Timeline Copy` 仍需語意比較 |
| ClientCard | `Tz4ObI3jO` / Card/Clients Card | component XML 成功讀回，存在 variants 與 componentRef | client/project metadata | 既有文案與 logo 不可直接沿用 |

## 待確認 reference

| Framer source | Node ID | 原因 |
|---|---|---|
| Hero | `kwZpx_ioN` | project XML 確認存在；本次未取得足夠的 component child XML |
| Footer | `nMFCaAwuJ` | `getNodeXml` 回讀限制 |
| FAQ Accordion List | `jrVQbI3y0` | `getNodeXml` 回讀限制；需確認 open/closed state |
| Card-Project Portfolio-1/2/3 | `vlnlkDMGi`, `IyJyNIWWK`, `N4mviUwSt` | 可能是 card variants，但 XML/props 尚未完整 read-back |
| Image card 系列 | `soo14upM5`, `izBmMc2fz`, `eAUBqBY9D` | XML/props 尚未完整 read-back |

## Code Components

| 用途 | Canonical candidate | 其他版本 | 結論 |
|---|---|---|---|
| number counter | `K4D4TwM` / `Counter.tsx` | `mIDdHOA`, `BhpyRnd` | 三份 source byte-identical；Fable 只保留一個邏輯實作 |
| retro grid | `WM9aLzM` / `RetroGrid.tsx` | `yPOzKKp` | near-duplicate；控制項命名不同，先不合併 |
| typewriter | `JvhxjSC` / `TypewriterEffect.tsx` | `mm6IlTO` | near-duplicate；完整版本控制項更多，需做 accessibility review |
| blur effect | `FWC3U5u` / `Blur_Essence_v3.tsx` | `f8c0ddB`, `O2Ca9Kr` | near-duplicate/expanded candidate；高效能與品牌風險，不列入預設 |

## 不可直接搬移

Framer project 的個人 copy、姓名、履歷、聯絡資訊、外部 CDN 圖片、runtime bundle 與未核准的 visual effect 不屬於 HQ Design component authority。Fable 應只取結構與可驗證的 interaction pattern，並使用 HQ Design 的 content/data/assets。
