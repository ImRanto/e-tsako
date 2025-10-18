import { useEffect, useState } from "react";
import Loader from "./Loader";
import ScrollToTop from "./ScrollToTop";

interface PageWrapperProps {
  children: React.ReactNode;
  delay?: number; // temps de simulation du loader en ms
}

export default function PageWrapper({
  children,
  delay = 800,
}: PageWrapperProps) {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  if (isLoading) return <Loader />;
  return (
    <>
      {children}
      <ScrollToTop />
    </>
  );
}
