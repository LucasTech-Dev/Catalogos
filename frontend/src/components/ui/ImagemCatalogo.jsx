import React, {useState} from "react";

// Preserva a referência original; uma falha nunca vira foto de outro produto.
export default function ImagemCatalogo({src, alt, style, ...props}) {
  const [falhou, setFalhou] = useState(null);
  const fallback = !src?.trim() || falhou === src;
  return <img
    {...props}
    src={fallback ? "/demo-produto.svg" : src}
    alt={fallback ? `${alt || "Produto"} — foto indisponível` : alt}
    data-image-fallback={fallback ? "true" : undefined}
    style={fallback ? {...style, objectFit: "contain", backgroundColor: "#fff4e8"} : style}
    onError={fallback ? undefined : () => setFalhou(src)}
  />;
}
