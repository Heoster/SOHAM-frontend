"use client";

import React from "react";
import { usePathname } from "next/navigation";

export default function PageTransition({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="page-transition" data-path={pathname}>
      {children}
    </div>
  );
}
