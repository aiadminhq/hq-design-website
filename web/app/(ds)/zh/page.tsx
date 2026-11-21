import { HomePage, homeMetadata } from "../../../components/ds/home-page";
export const metadata = homeMetadata("zh");
export default function Page() {
  return <HomePage locale="zh" />;
}
