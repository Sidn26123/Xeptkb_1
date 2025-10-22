import { useEffect } from "react";

export default function PageMeta({ title, description }) {
  useEffect(() => {
    if (title) document.title = title;
    // Nếu cần, có thể cập nhật meta description ở đây
    if (description) {
      let meta = document.querySelector('meta[name="description"]');
      if (!meta) {
        meta = document.createElement('meta');
        meta.name = "description";
        document.head.appendChild(meta);
      }
      meta.content = description;
    }
  }, [title, description]);
  return null;
}

export function AppWrapper({ children }) {
  return <>{children}</>;
}