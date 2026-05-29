import { Link } from "@/i18n/navigation";
export default function NotFound() {
  return (
    <section className="mx-auto flex max-w-xl flex-col items-center gap-6 px-6 py-32 text-center">
      <h1 className="text-display-xl font-bold text-navy-900">404</h1>
      <Link href="/" className="text-teal-600 hover:text-teal-700">← Geodot</Link>
    </section>
  );
}
