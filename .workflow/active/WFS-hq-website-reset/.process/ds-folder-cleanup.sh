#!/usr/bin/env bash
# =============================================================================
# ds-folder-cleanup.sh — HQ Design System 資料夾垃圾清理
# =============================================================================
#
# 用途
# ----
# 刪除 HQ Design System 資料夾內「明確無資訊價值」的作業系統與 Office 暫存檔。
# 只處理三類，每一類都經過實證驗證（見 ds-folder-inventory.md §7）：
#
#   1. .DS_Store       33 個｜  268,420 bytes｜macOS Finder 檢視狀態快取
#   2. Thumbs.db       54 個｜12,307,968 bytes｜Windows 縮圖快取
#   3. ~$*.pptx         4 個｜      660 bytes｜Office 鎖定殘留（每檔 165 bytes）
#   ------------------------------------------------------------
#      合計            91 個｜12,577,048 bytes ≒ 11.99 MiB
#
# 這三類都會由作業系統／Office 自行重建，刪除不影響任何檔案內容，
# 且經 grep 驗證：全資料夾 220 條相對路徑引用中，沒有任何一條指向這三類檔案。
#
# 影響範圍
# --------
# 目標資料夾：/Users/christianwu/Library/CloudStorage/Dropbox/HQdesign/HQ Design - Design System
# 本腳本只在此路徑下遞迴作用，且只刪除符合上述三種檔名模式的「檔案」。
# 不刪除任何目錄、不刪除任何其他檔案、不搬移、不改名、不修改內容。
#
# 【已刻意排除，不得自動刪除】
# 以下項目雖有「垃圾外觀」，但可能含唯一內容，本腳本 MUST NOT 處理，
# 僅列於 ds-folder-inventory.md §7.1 供人工判斷：
#   - Untitled.pptx (8.7 MB) / Untitled.pdf (7.6 MB)  ← 檔名無語意但體積可觀
#   - "Copy of Copy of Copy of OB Minimized ....pdf" (3.2 MB) ← 資料夾內無同名檔可比對
#   - 作品集-更新版/新增資料夾/ (101 MB, 14 檔)        ← 內含攝影素材
#   - 新增包含項目的檔案夾/ ×2                          ← 內含服務建議書、標案簡報等重要文件
#   - .thumbnail (根層, 8,836 bytes)                    ← 非標準 macOS 垃圾，來源不明
#   - Claude Design/uploads/pasted-*.png (8.5 MB)       ← 可能為 shader/pattern 來源圖
#   - LOGO.zip / HQ-logo/export/*-bk-bk0-1.*            ← 雖為位元相同重複，但屬「重組」而非
#                                                          「清理」，見 ds-folder-restructure-plan.md
#                                                          變更 #2、#3
#
# 如何回復
# --------
# 1) Dropbox 版本歷史（主要手段）
#    此資料夾位於 Dropbox CloudStorage 同步路徑，刪除的檔案會進入 Dropbox
#    的「已刪除的檔案」，保留期間依方案而定：
#      - Dropbox Plus         : 30 天
#      - Professional/Business: 180 天
#    還原方式：dropbox.com → 「已刪除的檔案」→ 選取 → 還原
#
# 2) 自動重建（更簡單）
#    .DS_Store  : 在 Finder 開啟該目錄並調整檢視方式即重建
#    Thumbs.db  : 在 Windows 檔案總管以縮圖檢視開啟該目錄即重建
#    ~$*.pptx   : 開啟並關閉對應 .pptx 即重建（且通常不需要）
#    三者皆無使用者資料，重建成本為零。
#
# 3) 本腳本在 --execute 模式下會將完整刪除清單寫入 log 檔（路徑見執行輸出），
#    可據以核對哪些檔案被刪。
#
# 用法
# ----
#   bash ds-folder-cleanup.sh              # dry-run（預設）：只列出，不刪除
#   bash ds-folder-cleanup.sh --execute    # 實際刪除
#   bash ds-folder-cleanup.sh --help
#
# 產出日期: 2026-09-03  ｜  Session: WFS-hq-website-reset
# =============================================================================

set -uo pipefail

TARGET="/Users/christianwu/Library/CloudStorage/Dropbox/HQdesign/HQ Design - Design System"
LOG_DIR="/Users/christianwu/Library/CloudStorage/Dropbox/HQdesign/hq-design-website/.workflow/active/WFS-hq-website-reset/.process"
EXECUTE=0

# ---------- 參數 ----------
for arg in "$@"; do
  case "$arg" in
    --execute) EXECUTE=1 ;;
    --help|-h)
      sed -n '2,80p' "$0" | sed 's/^# \{0,1\}//'
      exit 0 ;;
    *) echo "未知參數: $arg（可用: --execute, --help）" >&2; exit 2 ;;
  esac
done

# ---------- 前置檢查 ----------
if [[ ! -d "$TARGET" ]]; then
  echo "錯誤：目標資料夾不存在" >&2
  echo "  $TARGET" >&2
  exit 1
fi

echo "============================================================"
echo " HQ Design System — 垃圾清理"
echo "============================================================"
echo " 目標資料夾 : $TARGET"
if [[ $EXECUTE -eq 1 ]]; then
  echo " 模式       : ⚠ EXECUTE（將實際刪除檔案）"
else
  echo " 模式       : DRY-RUN（只列出，不刪除）"
  echo "              要實際刪除請加上 --execute"
fi
echo "============================================================"
echo

# ---------- 掃描 ----------
# 使用 NUL 分隔以正確處理含空白與中日文的路徑
SCAN_FILE="$(mktemp -t ds-cleanup-scan)"
trap 'rm -f "$SCAN_FILE"' EXIT

find "$TARGET" -type f \( -name ".DS_Store" -o -name "Thumbs.db" -o -name '~$*' \) -print0 > "$SCAN_FILE"

# ---------- 分類統計 ----------
count_of() { # $1 = find 條件名稱
  find "$TARGET" -type f -name "$1" -print0 2>/dev/null | tr -cd '\0' | wc -c | tr -d ' '
}
bytes_of() {
  find "$TARGET" -type f -name "$1" -exec stat -f "%z" {} \; 2>/dev/null | awk '{s+=$1} END {print s+0}'
}

DS_N=$(count_of ".DS_Store");   DS_B=$(bytes_of ".DS_Store")
TH_N=$(count_of "Thumbs.db");   TH_B=$(bytes_of "Thumbs.db")
OF_N=$(count_of '~$*');         OF_B=$(bytes_of '~$*')

TOTAL_N=$(( DS_N + TH_N + OF_N ))
TOTAL_B=$(( DS_B + TH_B + OF_B ))

# ---------- 安全檢查：確認沒有非 Thumbs.db 的 .db 被誤納 ----------
STRAY_DB=$(find "$TARGET" -type f -name "*.db" ! -name "Thumbs.db" | wc -l | tr -d ' ')
if [[ "$STRAY_DB" -ne 0 ]]; then
  echo "⚠ 注意：發現 $STRAY_DB 個非 Thumbs.db 的 .db 檔案。"
  echo "  本腳本不會刪除它們（只比對確切檔名 Thumbs.db），但請確認其性質："
  find "$TARGET" -type f -name "*.db" ! -name "Thumbs.db" | sed "s|$TARGET/|    |"
  echo
fi

# ---------- 安全檢查：~$ 檔應為小型 lock stub ----------
BIG_LOCK=$(find "$TARGET" -type f -name '~$*' -size +10k | wc -l | tr -d ' ')
if [[ "$BIG_LOCK" -ne 0 ]]; then
  echo "⚠ 警告：發現 $BIG_LOCK 個大於 10 KB 的 ~\$ 檔案。"
  echo "  正常的 Office lock stub 只有約 165 bytes。大檔可能是被誤命名的真實文件。"
  echo "  已中止，請人工確認後再執行："
  find "$TARGET" -type f -name '~$*' -size +10k -exec stat -f "    %z bytes  %N" {} \;
  exit 1
fi

# ---------- 列出清單 ----------
echo "── 將處理的檔案清單 ──"
echo
if [[ $DS_N -gt 0 ]]; then
  echo "【.DS_Store】$DS_N 個（macOS Finder 檢視快取）"
  find "$TARGET" -type f -name ".DS_Store" -exec stat -f "%8z  %N" {} \; | sed "s|$TARGET/|  |" | sort -k2
  echo
fi
if [[ $TH_N -gt 0 ]]; then
  echo "【Thumbs.db】$TH_N 個（Windows 縮圖快取）"
  find "$TARGET" -type f -name "Thumbs.db" -exec stat -f "%8z  %N" {} \; | sed "s|$TARGET/|  |" | sort -rn
  echo
fi
if [[ $OF_N -gt 0 ]]; then
  echo "【~\$*  Office 暫存】$OF_N 個"
  find "$TARGET" -type f -name '~$*' -exec stat -f "%8z  %N" {} \; | sed "s|$TARGET/|  |" | sort -k2
  echo
fi

# ---------- 容量估算 ----------
mib() { awk -v b="$1" 'BEGIN{printf "%.2f", b/1048576}'; }
kib() { awk -v b="$1" 'BEGIN{printf "%.1f", b/1024}'; }

echo "============================================================"
echo " 回收容量估算（實測 stat -f %z 加總）"
echo "------------------------------------------------------------"
printf " %-22s %4d 個  %12d bytes  %8s KiB\n" ".DS_Store"        "$DS_N" "$DS_B" "$(kib "$DS_B")"
printf " %-22s %4d 個  %12d bytes  %8s MiB\n" "Thumbs.db"        "$TH_N" "$TH_B" "$(mib "$TH_B")"
printf " %-22s %4d 個  %12d bytes\n"          "~\$* Office 暫存" "$OF_N" "$OF_B"
echo "------------------------------------------------------------"
printf " %-22s %4d 個  %12d bytes  %8s MiB\n" "合計"             "$TOTAL_N" "$TOTAL_B" "$(mib "$TOTAL_B")"
echo "============================================================"
echo

if [[ $TOTAL_N -eq 0 ]]; then
  echo "沒有符合條件的檔案，無需清理。"
  exit 0
fi

# ---------- 執行 ----------
if [[ $EXECUTE -eq 0 ]]; then
  echo "這是 DRY-RUN，未刪除任何檔案。"
  echo
  echo "確認清單無誤後，執行："
  echo "  bash \"$0\" --execute"
  echo
  echo "回復方式：Dropbox 版本歷史（dropbox.com → 已刪除的檔案 → 還原），"
  echo "或直接讓作業系統／Office 自行重建（三類皆無使用者資料）。"
  exit 0
fi

# --execute 分支
echo "⚠ 即將刪除 $TOTAL_N 個檔案（$(mib "$TOTAL_B") MiB）。"
echo "  回復方式：Dropbox 版本歷史（Plus 30 天／Professional・Business 180 天）。"
echo
printf "  輸入 DELETE 確認執行，其他任何輸入皆會取消： "
read -r CONFIRM
if [[ "$CONFIRM" != "DELETE" ]]; then
  echo "已取消，未刪除任何檔案。"
  exit 0
fi
echo

LOG="$LOG_DIR/ds-folder-cleanup-$(date +%Y%m%d-%H%M%S).log"
{
  echo "# ds-folder-cleanup.sh 執行紀錄"
  echo "# 時間: $(date '+%Y-%m-%d %H:%M:%S')"
  echo "# 目標: $TARGET"
  echo "# 檔數: $TOTAL_N   位元組: $TOTAL_B"
  echo "#"
} > "$LOG"

DELETED=0
FAILED=0
while IFS= read -r -d '' f; do
  SZ=$(stat -f "%z" "$f" 2>/dev/null || echo 0)
  if rm -f -- "$f" 2>/dev/null; then
    echo "DELETED  $SZ  $f" >> "$LOG"
    DELETED=$(( DELETED + 1 ))
  else
    echo "FAILED   $SZ  $f" >> "$LOG"
    echo "  ✗ 刪除失敗: ${f#$TARGET/}" >&2
    FAILED=$(( FAILED + 1 ))
  fi
done < "$SCAN_FILE"

echo "============================================================"
echo " 完成"
echo "------------------------------------------------------------"
echo " 已刪除 : $DELETED 個檔案"
[[ $FAILED -gt 0 ]] && echo " 失敗   : $FAILED 個檔案（見 log）"
echo " 回收   : 約 $(mib "$TOTAL_B") MiB"
echo " 紀錄   : $LOG"
echo "============================================================"
echo
echo "後續："
echo "  1. Dropbox 會同步這些刪除。若需還原，30/180 天內可從"
echo "     dropbox.com →「已刪除的檔案」取回。"
echo "  2. .DS_Store 與 Thumbs.db 會在下次瀏覽對應目錄時自動重建，"
echo "     這是正常的，不代表清理失敗。"
echo "  3. 下一步請參考 ds-folder-restructure-plan.md 階段 1 的變更 #1"
echo "     （把 colors_and_type.css 移回 Claude Design/，一次修好 8 條斷鏈）。"
