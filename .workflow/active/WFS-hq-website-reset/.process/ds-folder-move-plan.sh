#!/usr/bin/env bash
# =============================================================================
# ds-folder-move-plan.sh — HQ Design System 資料夾重組搬移腳本
# =============================================================================
#
# 用途
# ----
# 依 ds-folder-restructure-plan.md 執行資料夾重組。分五個階段，可個別執行。
#
# 【預設為 DRY-RUN】只印出將執行的指令，不實際搬移任何檔案。
# 要實際執行必須明確傳入 --execute。
#
# 影響範圍
# --------
# /Users/christianwu/Library/CloudStorage/Dropbox/HQdesign/HQ Design - Design System
# 此路徑位於 Dropbox CloudStorage 同步區。搬移會觸發同步流量。
#
# 用法
# ----
#   bash ds-folder-move-plan.sh                      # dry-run 全部階段
#   bash ds-folder-move-plan.sh --stage 1             # dry-run 只看階段 1
#   bash ds-folder-move-plan.sh --stage 1 --execute   # 實際執行階段 1
#   bash ds-folder-move-plan.sh --preflight           # 只跑前置檢查
#   bash ds-folder-move-plan.sh --help
#
# 階段
# ----
#   1  零風險修復    colors_and_type.css 移回 + 刪 3 個位元相同重複檔
#                    → 修復 8 條斷鏈，回收 178 KB。強烈建議先只做這個
#   2  低風險搬移    建立六層目錄 + 搬移 15 個小型項目（約 700 MiB）
#                    → 打斷程式碼引用 0 條，須手動更新 CLAUDE.md 4 行
#   3  中風險改名    Claude Design/ → 30-design-system/
#                    → 打斷程式碼引用 0 條，但須先更新 19 處文件引用
#   4  高容量搬移    作品集-更新版 7.3 GB
#                    → 同步風險高，腳本會強制先試搬小目錄
#   5  收尾          uploads 去重、移除空目錄、產生 README 索引
#
# 【本腳本不做的事】
#   - 不修改任何檔案內容（程式碼修復請見 ds-folder-restructure-plan.md 變更 #4、#5）
#   - 不刪除 Danelec/PDF/（518 MiB，屬「可重生」需人工拍板，見變更 #13）
#   - 不刪除 Untitled.* / 副本 / 新增資料夾（可能含唯一內容）
#   - 不自動更新文件層的路徑引用（會列出清單供人工修改）
#
# 如何回復
# --------
#   1) 反向 mv：本腳本在 --execute 時會產生 rollback 腳本，路徑見執行輸出
#   2) Dropbox 版本歷史：Plus 30 天／Professional・Business 180 天
#
# 產出日期: 2026-09-03  ｜  Session: WFS-hq-website-reset
# =============================================================================

set -uo pipefail

DS="/Users/christianwu/Library/CloudStorage/Dropbox/HQdesign/HQ Design - Design System"
WEB="/Users/christianwu/Library/CloudStorage/Dropbox/HQdesign/hq-design-website"
PROC="$WEB/.workflow/active/WFS-hq-website-reset/.process"

EXECUTE=0
STAGE="all"
PREFLIGHT_ONLY=0
ROLLBACK=""

while [[ $# -gt 0 ]]; do
  case "$1" in
    --execute)    EXECUTE=1; shift ;;
    --stage)      STAGE="${2:-}"; shift 2 ;;
    --preflight)  PREFLIGHT_ONLY=1; shift ;;
    --help|-h)    sed -n '2,60p' "$0" | sed 's/^# \{0,1\}//'; exit 0 ;;
    *) echo "未知參數: $1" >&2; exit 2 ;;
  esac
done

# =============================================================================
# 工具函式
# =============================================================================
C_OK=$'\033[32m'; C_WARN=$'\033[33m'; C_ERR=$'\033[31m'; C_DIM=$'\033[2m'; C_OFF=$'\033[0m'
[[ -t 1 ]] || { C_OK=""; C_WARN=""; C_ERR=""; C_DIM=""; C_OFF=""; }

hdr() { echo; echo "============================================================"; echo " $*"; echo "============================================================"; }
note(){ echo "${C_DIM}   $*${C_OFF}"; }
warn(){ echo "${C_WARN}⚠  $*${C_OFF}"; }
err() { echo "${C_ERR}✗  $*${C_OFF}" >&2; }

# do_mkdir <path>
do_mkdir() {
  local d="$1"
  if [[ -d "$d" ]]; then
    note "已存在，略過 mkdir: ${d#$DS/}"
    return 0
  fi
  echo "   mkdir -p \"${d#$DS/}\""
  if [[ $EXECUTE -eq 1 ]]; then
    mkdir -p "$d" || { err "mkdir 失敗: $d"; return 1; }
  fi
}

# do_mv <src> <dst>   dst 為完整目標路徑（含檔名／目錄名）
do_mv() {
  local src="$1" dst="$2"
  if [[ ! -e "$src" ]]; then
    note "來源不存在，略過: ${src#$DS/}"
    return 0
  fi
  # 目標同名衝突檢查
  if [[ -e "$dst" ]]; then
    err "目標已存在同名項目，拒絕搬移以避免覆蓋："
    err "    來源: ${src#$DS/}"
    err "    目標: ${dst#$DS/}"
    err "  請人工確認兩者關係後再處理（可先比對 shasum -a 256）。"
    return 1
  fi
  do_mkdir "$(dirname "$dst")" || return 1
  echo "   mv \"${src#$DS/}\"  →  \"${dst#$DS/}\""
  if [[ $EXECUTE -eq 1 ]]; then
    mv -n -- "$src" "$dst" || { err "mv 失敗: $src"; return 1; }
    [[ -n "$ROLLBACK" ]] && printf 'mv -n -- %q %q\n' "$dst" "$src" >> "$ROLLBACK"
  fi
}

# do_rm <path> <reason>
do_rm() {
  local f="$1" reason="${2:-}"
  if [[ ! -e "$f" ]]; then note "已不存在，略過: ${f#$DS/}"; return 0; fi
  echo "   rm \"${f#$DS/}\"   ${C_DIM}# $reason${C_OFF}"
  if [[ $EXECUTE -eq 1 ]]; then
    rm -f -- "$f" || { err "rm 失敗: $f"; return 1; }
  fi
}

# =============================================================================
# 前置檢查
# =============================================================================
preflight() {
  hdr "前置檢查"
  local fail=0

  # 1. 目標資料夾存在
  if [[ -d "$DS" ]]; then
    echo "${C_OK}✓${C_OFF} 目標資料夾存在"
    note "$DS"
  else
    err "目標資料夾不存在: $DS"; return 1
  fi

  # 2. 規模基準（與盤點時的實測值對照，偏差過大代表資料夾已被改動）
  local n_files n_dirs sz
  n_files=$(find "$DS" -type f | wc -l | tr -d ' ')
  n_dirs=$(find "$DS" -type d | wc -l | tr -d ' ')
  sz=$(du -sh "$DS" 2>/dev/null | awk '{print $1}')
  echo "${C_OK}✓${C_OFF} 目前規模：$sz ／ $n_files 檔 ／ $n_dirs 目錄"
  note "盤點基準（2026-09-03）：8.1G ／ 1368 檔 ／ 110 目錄"
  if [[ "$n_files" -gt 1500 || "$n_files" -lt 1200 ]]; then
    warn "檔案數與盤點基準差異較大（$n_files vs 1368）。"
    warn "資料夾可能已被改動，建議重新執行盤點再搬移。"
  fi

  # 3. Dropbox 同步狀態
  echo
  echo "── Dropbox 同步狀態 ──"
  if pgrep -qx "Dropbox"; then
    echo "${C_OK}✓${C_OFF} Dropbox 程序執行中"
  else
    warn "偵測不到 Dropbox 程序。若 Dropbox 未執行，搬移不會立即同步"
    warn "（本身無害，但下次啟動時會一次產生大量同步作業）。"
  fi
  # 尋找同步中的暫存檔（Dropbox 下載／上傳中會留下這類檔案）
  local partial
  partial=$(find "$DS" -maxdepth 4 \( -name "*.dropbox.attr" -o -name ".dropbox.cache" -o -name "*.partial" -o -name "*~dropbox*" \) 2>/dev/null | wc -l | tr -d ' ')
  if [[ "$partial" -eq 0 ]]; then
    echo "${C_OK}✓${C_OFF} 未發現 Dropbox 同步暫存檔"
  else
    warn "發現 $partial 個 Dropbox 暫存檔，可能仍在同步中。"
    fail=1
  fi
  echo
  warn "本機無 dropbox CLI，無法程式化確認「已是最新狀態」。"
  warn "執行前 MUST 由人工確認：Dropbox 選單列圖示顯示綠色勾／「已是最新狀態」。"

  # 4. 目標路徑衝突
  echo
  echo "── 目標路徑衝突檢查 ──"
  local conflicts=0
  for d in 10-brand-authority 20-assets 30-design-system 40-reference 50-deliverables 90-inbox; do
    if [[ -e "$DS/$d" ]]; then
      warn "已存在: $d（將沿用，不會覆蓋既有內容）"
      conflicts=$(( conflicts + 1 ))
    fi
  done
  [[ $conflicts -eq 0 ]] && echo "${C_OK}✓${C_OFF} 六個分層目錄皆不存在，無衝突"

  # 5. 磁碟空間（mv 同分割區不需額外空間，但檢查以防跨分割）
  echo
  echo "── 磁碟空間 ──"
  df -h "$DS" | tail -1 | awk '{printf "   可用: %s ／ 總計: %s ／ 使用率: %s\n", $4, $2, $5}'
  note "同一分割區內的 mv 不需額外空間；本腳本所有搬移皆在資料夾內"
  local avail_k
  avail_k=$(df -k "$DS" | tail -1 | awk '{print $4}')
  if [[ "${avail_k:-0}" -lt 10485760 ]]; then
    warn "可用空間低於 10 GiB。"
    warn "階段 4 的 7.3 GB 作品集搬移若被 Dropbox 判定為新增而重新上傳，"
    warn "本機可能因空間不足而同步失敗。建議先釋出空間，或改採「作品集不搬」的替代方案。"
  fi

  # 6. 待人工處理的程式碼修復提醒
  echo
  echo "── 提醒：本腳本不處理的程式碼修復 ──"
  note "變更 #4  Claude Design/ui_kits/website/components/TopNav.jsx:41"
  note "         Claude Design/ui_kits/website/components/FooterAndCTA.jsx:56"
  note "         ../../assets/HQ-logo.png → ../../../assets/HQ-logo.png"
  note "變更 #5  Claude Design/_ds_bundle.js:340  deck-stage.js → brand-guide/deck-stage.js"

  echo
  if [[ $fail -ne 0 ]]; then
    err "前置檢查有未通過項目。建議解決後再執行搬移。"
    return 1
  fi
  echo "${C_OK}✓ 前置檢查完成${C_OFF}"
  return 0
}

# =============================================================================
# 階段 1 — 零風險修復
# =============================================================================
stage1() {
  hdr "階段 1｜零風險修復"
  echo
  echo "◆ 變更 #1 — colors_and_type.css 移回 Claude Design/"
  echo "  ${C_OK}修復 8 條引用${C_OFF}：styles.css:12、index.html:9、preview/card.css:4、"
  echo "  brand-guide/hq-pattern-shader-preview.html:8、ui_kits/website/kit.css:1、"
  echo "  colors_and_type.css:17、colors_and_type.css:24、_ds_manifest.json（globalCssPaths + 136 條 tokens[].definedIn）"
  echo "  打斷程式碼引用：0"
  # ⚠ 需同步修正引用：HQ Design - Design System/CLAUDE.md:14
  do_mv "$DS/colors_and_type.css" "$DS/Claude Design/colors_and_type.css"

  echo
  echo "◆ 變更 #2 — 刪除 LOGO.zip"
  echo "  實證：20/20 檔案 shasum -a 256 與 LOGO/ 完全一致，雙向無多餘檔案"
  do_rm "$DS/LOGO.zip" "LOGO/ 的位元相同壓縮備份，158014 bytes"

  echo
  echo "◆ 變更 #3 — 刪除 HQ-logo/export/ 內 2 個 Figma 重複匯出"
  echo "  實證：hash 與 HQ-logo-bk-bk0.png / .svg 完全一致"
  do_rm "$DS/HQ-logo/export/HQ-logo-bk-bk0-1.png" "== HQ-logo-bk-bk0.png，18751 bytes"
  do_rm "$DS/HQ-logo/export/HQ-logo-bk-bk0-1.svg" "== HQ-logo-bk-bk0.svg，929 bytes"

  echo
  echo "── 階段 1 完成後必做的驗證 ──"
  note "open \"\$DS/Claude Design/index.html\""
  note "open \"\$DS/Claude Design/preview/color-brand.html\"   # 應顯示 #D64518 色塊"
  note "open \"\$DS/Claude Design/ui_kits/website/index.html\""
  echo
  echo "── 階段 1 須人工修正的引用（1 處）──"
  warn "HQ Design - Design System/CLAUDE.md:14"
  note "  現況: | Design Tokens | \`colors_and_type.css\` | CSS 變數：色彩、字型、間距 |"
  note "  改為: | Design Tokens | \`Claude Design/colors_and_type.css\` | CSS 變數：色彩、字型、間距 |"
}

# =============================================================================
# 階段 2 — 低風險搬移
# =============================================================================
stage2() {
  hdr "階段 2｜低風險搬移（約 700 MiB）"

  echo
  echo "◆ 建立六層目錄骨架"
  do_mkdir "$DS/10-brand-authority/archive"
  # 注意：不預先建立 20-assets/logo/master —— HQ-logo/ → master 是「改名」，
  # 預先建立目標會觸發下方 do_mv 的「目標已存在」保護而拒絕搬移。
  do_mkdir "$DS/20-assets/logo/figma-icons"
  do_mkdir "$DS/20-assets/fonts"
  do_mkdir "$DS/20-assets/patterns/webp-v1"
  do_mkdir "$DS/20-assets/patterns/ref"
  do_mkdir "$DS/20-assets/photography"
  do_mkdir "$DS/40-reference/inspiration"
  do_mkdir "$DS/50-deliverables/company-profile"
  do_mkdir "$DS/50-deliverables/business-cards"
  do_mkdir "$DS/50-deliverables/proposals"
  do_mkdir "$DS/90-inbox/untitled-decks"

  echo
  echo "◆ Logo 資產（打斷程式碼引用：0）"
  # 注意：HQ-logo/ 與 LOGO/ 經 46 檔交叉 shasum 比對「零個位元相同」，互補而非重複，兩者皆保留
  # ⚠ 需同步修正引用：HQ Design - Design System/CLAUDE.md:15, :66, :67（LOGO/ 相關 3 行）
  do_mv "$DS/HQ-logo" "$DS/20-assets/logo/master"
  do_mv "$DS/LOGO"    "$DS/20-assets/logo/figma-icons/LOGO"
  # 歸還誤置於外部參考目錄的 HQ 自家資產
  do_mv "$DS/Danelec/HQ-logo-w.png" "$DS/20-assets/logo/master/HQ-logo-w.png"

  echo
  echo "◆ 字體（Satoshi_Complete 整包搬移；36 條引用全在 Fonts/WEB/ 子樹內，隨包移動）"
  do_mv "$DS/Satoshi_Complete" "$DS/20-assets/fonts/Satoshi_Complete"

  echo
  echo "◆ 紋理"
  # ⚠ 需同步修正引用：HQ Design - Design System/CLAUDE.md:16（Pattern/ 1 行）
  do_mv "$DS/Pattern"          "$DS/20-assets/patterns/webp-v1/Pattern"
  do_mv "$DS/pattern-ref.png"  "$DS/20-assets/patterns/ref/pattern-ref.png"

  echo
  echo "◆ 外部參考（Danelec 571 MiB — 容量較大，Dropbox 需重新同步）"
  do_mv "$DS/Danelec"          "$DS/40-reference/danelec"
  do_mv "$DS/Danelec-17.pdf"   "$DS/40-reference/danelec/Danelec-17.pdf"
  do_mv "$DS/Danelec-18.pdf"   "$DS/40-reference/danelec/Danelec-18.pdf"
  # 改名以標明這是「外部（Firecrawl）設計系統」而非 HQ 自家規範，避免誤取
  do_mv "$DS/DESIGN-firecrawl.md" "$DS/40-reference/firecrawl-design-system.md"
  do_mv "$DS/pinterest-office-rendering" "$DS/40-reference/inspiration/office-rendering"

  echo
  echo "◆ 歷史交付"
  do_mv "$DS/名片"     "$DS/50-deliverables/business-cards/名片"
  do_mv "$DS/名片.ai"  "$DS/50-deliverables/business-cards/名片.ai"
  do_mv "$DS/drive-download-20260629T081556Z-3-001" "$DS/50-deliverables/company-profile/archive-2020"
  # 目錄名為 Finder 自動命名但內容重要（服務建議書、標案簡報、MasterDeck 骨架、優勢盤點）
  do_mv "$DS/HQ Design Company Profile/新增包含項目的檔案夾" "$DS/50-deliverables/proposals/2026-proposals"

  echo
  echo "◆ 被取代的舊版規範文件（歸檔而非刪除）"
  do_mv "$DS/20-assets/logo/master/HQ DESIGN — 品牌視覺規範與 CIS 系統.md" \
        "$DS/10-brand-authority/archive/HQ DESIGN — 品牌視覺規範與 CIS 系統.md"
  do_mv "$DS/20-assets/logo/master/HQ-線條與標誌幾何標準-v2.md" \
        "$DS/10-brand-authority/archive/HQ-線條與標誌幾何標準-v2.md"
  do_mv "$DS/Claude Design/DESIGN-260628-ChatGPT.md" \
        "$DS/10-brand-authority/archive/DESIGN-260628-ChatGPT.md"

  echo
  echo "◆ 待人工判斷（移入 90-inbox/，不刪除）"
  do_mv "$DS/CleanShot 2026-07-14 at 15.43.55@2x.png" "$DS/90-inbox/CleanShot 2026-07-14 at 15.43.55@2x.png"
  # HQ-design-system.html：自包含單檔頁，grep 確認 0 條相對引用，但含第 3 套 token 定義（4 條）
  do_mv "$DS/HQ-design-system.html" "$DS/90-inbox/HQ-design-system.html"
  # Untitled.pptx (Jul 24 18:23) 與 Untitled.pdf (18:26) 疑為同一份的 PPTX 與 PDF 匯出，須人工確認後才可刪其一
  do_mv "$DS/HQ Design Company Profile/Untitled.pptx" "$DS/90-inbox/untitled-decks/Untitled.pptx"
  do_mv "$DS/HQ Design Company Profile/Untitled.pdf"  "$DS/90-inbox/untitled-decks/Untitled.pdf"

  echo
  echo "── 階段 2 須人工修正的引用（4 處，全在 CLAUDE.md）──"
  warn "HQ Design - Design System/CLAUDE.md:15  \`LOGO/\` → \`20-assets/logo/figma-icons/LOGO/\`"
  warn "HQ Design - Design System/CLAUDE.md:16  \`Pattern/\` → \`20-assets/patterns/webp-v1/Pattern/\`"
  warn "HQ Design - Design System/CLAUDE.md:66  註解中的 LOGO/ 路徑"
  warn "HQ Design - Design System/CLAUDE.md:67  \`ls LOGO/\` → \`ls 20-assets/logo/figma-icons/LOGO/\`"
  echo
  echo "── 階段 2 完成後必做的驗證 ──"
  note "open \"\$DS/Claude Design/brand-guide/EN.html\"    # 58 條引用，應完整渲染"
  note "open \"\$DS/Claude Design/brand-guide/ZH.html\"    # 56 條引用"
  note "open \"\$DS/20-assets/fonts/Satoshi_Complete/Fonts/WEB/README.md\""
}

# =============================================================================
# 階段 3 — Claude Design/ 改名（中風險）
# =============================================================================
stage3() {
  hdr "階段 3｜Claude Design/ → 30-design-system/（中風險）"
  echo
  warn "此階段沒有任何功能修復價值，純為命名體系一致性。"
  warn "若對 19 處文件引用同步更新沒把握，${C_OFF}${C_WARN}建議跳過本階段${C_OFF}。"
  echo
  echo "打斷程式碼引用：${C_OK}0 條${C_OFF}"
  note "實測：210 條有效引用 100% 為 Claude Design/ 子樹內部相對路徑，隨子樹一起移動"
  echo

  # ⚠ 需同步修正引用：19 處，分佈 7 個檔案
  #   HQ Design - Design System/CLAUDE.md:13, :19, :56, :72
  #   hq-design-website/.workflow/active/WFS-hq-website-reset/.brainstorming/ui-designer/analysis.md (4 處)
  #   hq-design-website/.workflow/active/WFS-hq-website-reset/.brainstorming/guidance-specification.md (3 處)
  #   hq-design-website/.workflow/active/WFS-hq-website-reset/CODEX-HANDOFF.md (2 處)
  #   hq-design-website/.workflow/active/WFS-hq-website-reset/.process/context-package.json (2 處)
  #   hq-design-website/.workflow/active/WFS-hq-website-reset/.brainstorming/system-architect/analysis.md (1 處)
  #   hq-design-website/.workflow/active/WFS-hq-website-reset/.process/nas-portfolio-inventory.md (1 處)
  echo "◆ 前置條件檢查：guidance-specification.md 是否已更新？"
  if grep -q "30-design-system" "$PROC/../.brainstorming/guidance-specification.md" 2>/dev/null; then
    echo "${C_OK}✓${C_OFF} guidance-specification.md 已含新路徑"
  else
    err "guidance-specification.md 尚未更新為新路徑。"
    err "它被明定為「下游所有階段的單一事實來源」，MUST 先更新再改名，"
    err "否則會產生權威文件與檔案系統不一致的狀態。"
    echo
    echo "  請先修改以下 7 個檔案共 19 處引用，再重新執行本階段："
    echo "    HQ Design - Design System/CLAUDE.md                      4 處（:13 :19 :56 :72）"
    echo "    .brainstorming/ui-designer/analysis.md                   4 處"
    echo "    .brainstorming/guidance-specification.md                 3 處"
    echo "    CODEX-HANDOFF.md                                         2 處"
    echo "    .process/context-package.json                            2 處"
    echo "    .brainstorming/system-architect/analysis.md              1 處"
    echo "    .process/nas-portfolio-inventory.md                      1 處"
    echo
    echo "  可用此指令找出全部引用："
    echo "    grep -rn 'Claude Design' \"$WEB/.workflow/active/WFS-hq-website-reset\" \"$DS/CLAUDE.md\""
    [[ $EXECUTE -eq 1 ]] && return 1
  fi

  echo
  echo "◆ 變更 #8 — 改名"
  do_mv "$DS/Claude Design" "$DS/30-design-system"

  echo
  echo "◆ 變更 #9 — 權威文件擺放（採方案 A：只放索引，不複製、不用 symlink）"
  note "方案 B（symlink）已否決：Dropbox 對 symlink 同步行為不可靠"
  note "方案 C（實體複製）已否決：會產生兩份會分歧的權威文件"
  note "→ 10-brand-authority/README.md 只寫指路說明，DESIGN.md 留在 30-design-system/"
  echo "   （README 內容由階段 5 產生）"
}

# =============================================================================
# 階段 4 — 7.3 GB 作品集搬移（高容量）
# =============================================================================
stage4() {
  hdr "階段 4｜作品集 7.3 GB 搬移（高容量）"
  echo
  warn "這是本計畫容量最大的操作（7.3 GB／33 個案件目錄／1000+ 檔）。"
  warn "Dropbox 的 mv 在 CloudStorage／File Provider 實作下不保證是 server-side move。"
  warn "若被判定為新增，會觸發 7.3 GB 完整重新上傳。"
  echo
  echo "打斷程式碼引用：${C_OK}0 條${C_OFF}"
  echo "photo-index.json 影響：${C_OK}無${C_OFF}"
  note "已實測該 191 KB 索引以案件名為 key，"
  note "「作品集-更新版」出現 0 次、「HQ Design - Design System」出現 0 次"
  note "→ 只要內部結構不變即安全"
  echo

  local SRC="$DS/HQ Design Company Profile/作品集-更新版"
  local DST="$DS/20-assets/photography/portfolio"
  local PROBE_SRC="$SRC/照片"
  local PROBE_DST="$DST/照片"

  echo "◆ 步驟 4a — 強制先試搬小目錄，觀察 Dropbox 是否重新上傳"
  note "試搬對象：作品集-更新版/照片/（544 KiB／2 檔）"
  do_mkdir "$DST"
  do_mv "$PROBE_SRC" "$PROBE_DST"
  echo
  if [[ $EXECUTE -eq 1 ]]; then
    warn "請現在觀察 Dropbox 選單列："
    warn "  - 若立即顯示「已是最新狀態」→ 為 server-side move，可安全繼續"
    warn "  - 若開始顯示上傳進度      → 會重新上傳 7.3 GB，建議改採替代方案"
    echo
    printf "  觀察結果如何？輸入 CONTINUE 繼續搬全部，輸入其他任何值則停止： "
    read -r ANS
    if [[ "$ANS" != "CONTINUE" ]]; then
      echo
      echo "已停止。已試搬的「照片/」可用以下指令搬回："
      echo "  mv -n -- \"$PROBE_DST\" \"$PROBE_SRC\""
      echo
      echo "替代方案（ds-folder-restructure-plan.md 變更 #10）："
      echo "  作品集不搬，維持在 HQ Design Company Profile/作品集-更新版/，"
      echo "  僅在 20-assets/photography/README.md 記錄其實際位置。"
      echo "  理由：它已有專責索引（photo-index.json + nas-portfolio-inventory.md），"
      echo "        語意收益低於 7.3 GB 的同步風險。"
      return 0
    fi
  else
    note "（dry-run：--execute 時此處會暫停並要求人工確認 Dropbox 行為）"
  fi

  echo
  echo "◆ 步驟 4b — 搬移剩餘 32 個案件目錄"
  echo "   mv \"HQ Design Company Profile/作品集-更新版/\"* → \"20-assets/photography/portfolio/\""
  if [[ $EXECUTE -eq 1 ]]; then
    local moved=0
    for item in "$SRC"/*; do
      [[ -e "$item" ]] || continue
      local base; base="$(basename "$item")"
      if [[ -e "$DST/$base" ]]; then
        err "目標已存在，略過: $base"
        continue
      fi
      mv -n -- "$item" "$DST/$base" && {
        moved=$(( moved + 1 ))
        [[ -n "$ROLLBACK" ]] && printf 'mv -n -- %q %q\n' "$DST/$base" "$item" >> "$ROLLBACK"
      }
    done
    echo "   已搬移 $moved 個項目"
    # 來源目錄應只剩 .DS_Store，不自動移除空目錄
    if [[ -d "$SRC" ]]; then
      local left; left=$(find "$SRC" -mindepth 1 | wc -l | tr -d ' ')
      note "來源目錄剩餘 $left 個項目（.DS_Store 等）。空目錄不自動移除。"
    fi
  fi

  echo
  echo "◆ 變更 #11 — HQ Design Company Profile/ → 50-deliverables/company-profile/"
  note "前置：作品集與 新增包含項目的檔案夾／Untitled.* 皆已移出，剩餘約 34 MiB"
  # ⚠ 需同步修正引用：HQ Design - Design System/CLAUDE.md:17, :57
  if [[ -d "$DS/HQ Design Company Profile" ]]; then
    if [[ $EXECUTE -eq 1 ]]; then
      for item in "$DS/HQ Design Company Profile"/*; do
        [[ -e "$item" ]] || continue
        do_mv "$item" "$DS/50-deliverables/company-profile/$(basename "$item")"
      done
    else
      echo "   mv \"HQ Design Company Profile/\"* → \"50-deliverables/company-profile/\""
    fi
  fi

  echo
  echo "── 階段 4 須人工修正的引用（3 處）──"
  warn "HQ Design - Design System/CLAUDE.md:17  \`HQ Design Company Profile/\` → \`50-deliverables/company-profile/\`"
  warn "HQ Design - Design System/CLAUDE.md:57  同上"
  warn ".process/nas-portfolio-inventory.md     作品集路徑 1 處"
}

# =============================================================================
# 階段 5 — 收尾
# =============================================================================
stage5() {
  hdr "階段 5｜收尾與索引"

  local CD="$DS/30-design-system"
  [[ -d "$CD" ]] || CD="$DS/Claude Design"

  echo
  echo "◆ 變更 #12 — uploads/ 去重（已 grep 驗證：uploads/ 內無任何檔案被引用）"
  echo "  可安全刪除（位元相同副本）："
  do_rm "$CD/uploads/fonnts.com-Aeonik-Regular.ttf" "== fonts/Aeonik-Regular.ttf，98228 bytes"
  do_rm "$CD/uploads/fonnts.com-Aeonik-Bold.ttf"    "== fonts/Aeonik-Bold.ttf，100200 bytes"
  do_rm "$CD/uploads/HQ-logo.png"                   "== assets/HQ-logo.png，17708 bytes"
  echo
  warn "以下 3 檔【不自動刪除】，須人工開啟確認："
  note "uploads/HQ-logo-wordmark.svg (7541 bytes)  與 assets/ 版位元相同，但先留著待確認"
  note "uploads/HQ-logo.svg (1041 bytes)           與 HQ-logo/export/ 版 hash 不同，可能是唯一版本"
  note "uploads/pasted-1779429627208-0.png (8.5 MiB)  可能為某 shader/pattern 的來源圖"
  note "uploads/beams-1779632486770.png (735 KiB)     疑為 beams-shader.js 的參考輸出"
  echo
  echo "  建議將 uploads/ 改名為 _scratch/ 以標明性質（暫存區，非資產）："
  do_mv "$CD/uploads" "$CD/_scratch"

  echo
  echo "◆ 變更 #14 — 移除清理後產生的空目錄"
  for d in "$DS/50-deliverables/business-cards/名片/PDF" \
           "$DS/HQ Design Company Profile/作品集-更新版" \
           "$DS/HQ Design Company Profile"; do
    if [[ -d "$d" ]]; then
      local n; n=$(find "$d" -mindepth 1 | wc -l | tr -d ' ')
      if [[ "$n" -eq 0 ]]; then
        echo "   rmdir \"${d#$DS/}\"   ${C_DIM}# 空目錄${C_OFF}"
        [[ $EXECUTE -eq 1 ]] && rmdir "$d" 2>/dev/null
      else
        note "非空（$n 項），保留: ${d#$DS/}"
      fi
    fi
  done

  echo
  echo "◆ 變更 #14 — 產生頂層 README.md 索引"
  warn "【重組能否維持的關鍵】沒有索引，三個月後會回到 19 個混雜的頂層項目。"
  echo "   建立 \"README.md\"（六層結構說明 + 各層修改權限 + AI 必讀路徑）"
  echo "   建立 \"90-inbox/README.md\"（暫存區規則：一個月內歸位或刪除）"
  if [[ $EXECUTE -eq 1 ]]; then
    if [[ -e "$DS/README.md" ]]; then
      err "README.md 已存在，拒絕覆寫。請人工合併。"
    else
      cat > "$DS/README.md" <<'MD'
# HQ Design System

惠強室內裝修品牌設計資源庫。目錄依「誰在什麼時機讀它」分六層，數字前綴代表優先級。

| 層 | 目錄 | 誰讀它 | 可否修改 |
|---|---|---|---|
| 1 | `10-brand-authority/` | AI 代理人、設計師（每次產出前必讀） | 僅品牌負責人 |
| 2 | `20-assets/` | 設計師、前端、簡報製作 | 唯讀取用 |
| 3 | `30-design-system/` | 前端、Framer 實作 | 開發中會改 |
| 4 | `40-reference/` | 設計師（找靈感、追溯決策） | 只讀不改 |
| 5 | `50-deliverables/` | 業務、行政 | 凍結 |
| 6 | `90-inbox/` | 當事人（暫存，每月清空） | 隨意 |

## AI 代理人必讀

1. `30-design-system/DESIGN.md` — 品牌 CIS 規範，單一事實來源
2. `30-design-system/colors_and_type.css` — Design Tokens
3. `30-design-system/README.md` — 品牌語調、視覺規範、icon 規則
4. `CLAUDE.md` — 本資料夾操作說明與 Brand Rules

## 注意

- `40-reference/` 內為**外部品牌**參考（Danelec、Firecrawl、Pinterest）。
  **不得**從此處取用色票、字體或圖形語彙。
- `30-design-system/` 內部有 210 條相對路徑引用。
  **搬動其子目錄（尤其 `assets/`、`fonts/`、`preview/card.css`）會打斷引用。**
- 重組決策與實證記錄見
  `hq-design-website/.workflow/active/WFS-hq-website-reset/.process/ds-folder-restructure-plan.md`
MD
      echo "${C_OK}✓${C_OFF} 已建立 README.md"
    fi
    if [[ ! -e "$DS/90-inbox/README.md" ]] && [[ -d "$DS/90-inbox" ]]; then
      cat > "$DS/90-inbox/README.md" <<'MD'
# 90-inbox — 暫存區

放進來的東西**必須在一個月內歸位或刪除**。

此處不是資產區，不得從此處引用檔案。

## 目前待處理

- `CleanShot ....png` — 用途不明的截圖，需確認內容後歸位或刪除
- `HQ-design-system.html` — 自包含單檔頁，含第 3 套 token 定義（4 條）。
  Token 3.0 收斂後應刪除
- `untitled-decks/Untitled.pptx` + `Untitled.pdf` — 時間戳相隔 3 分鐘，
  疑為同一份的 PPTX 與其 PDF 匯出。**需人工開啟確認**，若確認則可只留 PPTX
MD
      echo "${C_OK}✓${C_OFF} 已建立 90-inbox/README.md"
    fi
  fi

  echo
  echo "◆ 不在本腳本範圍（需人工拍板）"
  warn "變更 #13  40-reference/danelec/PDF/ — 518 MiB，73 張逐頁 PNG"
  note "  為同目錄 50 MiB PDF 的轉檔，屬「可重生」非「垃圾」，故不自動刪除。"
  note "  拍板前請先驗證可重生同等品質："
  note "    pdftoppm -png -r 150 -f 1 -l 1 \\"
  note "      \"40-reference/danelec/Danelec_BrandGuide_V1_2024.pdf\" /tmp/probe"
  note "    然後與 40-reference/danelec/PDF/Danelec_BrandGuide_V1_2024_1.png 比對解析度"
  note "  這是本資料夾單筆最大的可回收容量（垃圾清理只有 12 MiB）。"
}

# =============================================================================
# 主流程
# =============================================================================
hdr "HQ Design System — 資料夾重組搬移"
echo " 目標   : $DS"
if [[ $EXECUTE -eq 1 ]]; then
  echo " 模式   : ${C_ERR}⚠ EXECUTE（將實際搬移／刪除）${C_OFF}"
else
  echo " 模式   : ${C_OK}DRY-RUN（只印出指令，不動任何檔案）${C_OFF}"
  echo "          要實際執行請加上 --execute"
fi
echo " 階段   : $STAGE"
echo " 依據   : ds-folder-restructure-plan.md"

preflight || { [[ $EXECUTE -eq 1 ]] && { err "前置檢查未通過，已中止。"; exit 1; }; }

if [[ $PREFLIGHT_ONLY -eq 1 ]]; then
  echo; echo "（--preflight：只做前置檢查，結束）"; exit 0
fi

# 建立 rollback 腳本
if [[ $EXECUTE -eq 1 ]]; then
  echo
  warn "即將實際搬移檔案。此路徑在 Dropbox 同步區內。"
  warn "請先確認 Dropbox 選單列顯示「已是最新狀態」。"
  echo
  printf "  輸入 MOVE 確認執行階段 [$STAGE]，其他任何輸入皆會取消： "
  read -r CONFIRM
  if [[ "$CONFIRM" != "MOVE" ]]; then
    echo "已取消，未搬移任何檔案。"
    exit 0
  fi
  ROLLBACK="$PROC/ds-folder-move-rollback-$(date +%Y%m%d-%H%M%S).sh"
  {
    echo "#!/usr/bin/env bash"
    echo "# 自動產生的 rollback 腳本 — $(date '+%Y-%m-%d %H:%M:%S')"
    echo "# 反向執行本次搬移。注意：只還原 mv，不還原 rm（rm 請用 Dropbox 版本歷史）。"
    echo "set -uo pipefail"
  } > "$ROLLBACK"
  chmod +x "$ROLLBACK"
  echo
  echo "rollback 腳本: $ROLLBACK"
fi

case "$STAGE" in
  1)   stage1 ;;
  2)   stage2 ;;
  3)   stage3 ;;
  4)   stage4 ;;
  5)   stage5 ;;
  all) stage1; stage2; stage3; stage4; stage5 ;;
  *)   err "未知階段: $STAGE（可用: 1 2 3 4 5 all）"; exit 2 ;;
esac

hdr "結束"
if [[ $EXECUTE -eq 0 ]]; then
  echo " 這是 DRY-RUN，未搬移或刪除任何檔案。"
  echo
  echo " 建議執行順序："
  echo "   bash \"$0\" --preflight"
  echo "   bash \"$0\" --stage 1              # 先看階段 1 會做什麼"
  echo "   bash \"$0\" --stage 1 --execute    # 只執行零風險的階段 1"
  echo "   （驗證 + 觀察一週後）"
  echo "   bash \"$0\" --stage 2 --execute"
  echo
  echo " 階段 3 與 4 為可選；若對文件同步更新或 7.3 GB 同步風險沒把握，可略過。"
else
  echo " 已執行階段 [$STAGE]。"
  echo " rollback : $ROLLBACK"
  echo
  echo " 下一步："
  echo "   1. 依上方 ⚠ 標記手動修正文件層引用"
  echo "   2. 開啟 HTML 檔驗證渲染正常"
  echo "   3. 重跑引用檢查確認斷鏈為 0"
fi
