"use client";

import { useEffect, useState } from "react";
import { SohamLoader } from "./soham-loader";

export default function LoadingManager() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 180);

    return () => {
      clearTimeout(timer);
    };
  }, []);

  if (!loading) return null;

  return <SohamLoader variant="overlay" label="Starting SOHAM" />;
}
