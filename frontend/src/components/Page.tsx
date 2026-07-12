import type { ReactNode } from "react";

type PageProps = {
  title: string;
  children?: ReactNode;
  headerAction?: ReactNode;
};

export default function Page({ title, children, headerAction }: PageProps) {
  return (
    <section className="page">
      <header className="page-header">
        <h1>{title}</h1>
        {headerAction}
      </header>
      <div className="page-content">{children}</div>
    </section>
  );
}
