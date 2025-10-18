export function Table({ children, className }) {
  return <table className={`min-w-full  ${className || ""}`}>{children}</table>;
}

export function TableHeader({ children, className }) {
  return <thead className={className}>{children}</thead>;
}

export function TableBody({ children, className }) {
  return <tbody className={className}>{children}</tbody>;
}

export function TableRow({ children, className }) {
  return <tr className={className}>{children}</tr>;
}

export function TableCell({ children, isHeader = false, className }) {
  const CellTag = isHeader ? "th" : "td";
  return <CellTag className={` ${className || ""}`}>{children}</CellTag>;
}