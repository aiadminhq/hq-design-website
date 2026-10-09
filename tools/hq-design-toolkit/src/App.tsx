import { framer, CanvasNode } from "@framer/plugin"
import { useState, useEffect } from "react"
import "./App.css"

framer.showUI({
  position: "top right",
  width: 320,
  height: 260,
})

function useSelection() {
  const [selection, setSelection] = useState<CanvasNode[]>([])

  useEffect(() => {
    return framer.subscribeToSelection(setSelection)
  }, [])

  return selection
}

export function App() {
  const selection = useSelection()
  const selectionLabel =
    selection.length === 0
      ? "尚未選取圖層"
      : `已選取 ${selection.length} 個圖層`

  return (
    <main>
      <header>
        <span className="brand-mark" aria-hidden="true" />
        <div>
          <p className="eyebrow">HQ DESIGN</p>
          <h1>Website Toolkit</h1>
        </div>
      </header>

      <section aria-live="polite">
        <p className="status">{selectionLabel}</p>
        <p className="description">
          Canvas 連線正常。第一階段僅提供選取狀態與網站檢查入口，不會自動修改或發佈頁面。
        </p>
      </section>

      <footer>
        <span>Mode</span>
        <code>{framer.mode}</code>
      </footer>
    </main>
  )
}
