import type { ReactNode } from "react";

type PageProps = {
  title: string;
  children?: ReactNode;
};

export default function Page({ title, children }: PageProps) {
  return (
    <section className="page">
      <header className="page-header">
        <h1>{title}</h1>
      </header>
      <div className="page-content">{children}</div>
    </section>
  );
}
