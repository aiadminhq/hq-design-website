# CLAUDE.md

## Awwwards MCP（設計參考）

- 用途：Awwwards MCP（MIT 授權，https://github.com/INSANE0777/Awwwards-mcp）用來查找得獎網站，作為設計參考。
- 設定：已寫在根目錄 `.mcp.json`，以 `npx -y awwwards-mcp` 啟動，不需要 API key。
- 截圖與頁面結構分析需要 Playwright Chromium：`npx playwright install chromium`。在 Claude Code 雲端 session，請把這行放進環境的 setup script。
- 動態錄製（捲動、hover）需要 ffmpeg。
