// 所有權：Fable 5.1（見 repo 根 COORDINATION.md §2）
// 這是讓 Next 建得起來的最小骨架，設計時可整份取代。
// 唯一的約束：<html lang> 必須交給 app/[locale]/layout.tsx 決定。
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return children;
}
