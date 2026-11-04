import Link from "next/link";

export default function StaffNotFound() {
  return (
    <main style={{ padding: "3rem 1.5rem", maxWidth: 520 }}>
      <h1>That page is not in the staff console.</h1>
      <p>
        <Link href="/">Back to the staff hub</Link>
      </p>
    </main>
  );
}
