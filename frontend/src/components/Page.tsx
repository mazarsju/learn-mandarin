import type { ReactNode } from "react";

type PageProps = {
  title: string;
  children?: ReactNode;
  headerAction?: ReactNode;
  fullWidth?: boolean;
};

export default function Page({
  title,
  children,
  headerAction,
  fullWidth = false,
}: PageProps) {
  return (
    <section className={fullWidth ? "page page--full-width" : "page"}>
      <header className="page-header">
        <h1>{title}</h1>
        {headerAction}
      </header>
      <div className="page-content">{children}</div>
    </section>
  );
}
