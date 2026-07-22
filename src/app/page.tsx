import { redirect } from "next/navigation";

/** Bare `/` → default locale home (needed on Vercel when middleware edge redirect is skipped). */
export default function RootPage() {
  redirect("/en");
}
