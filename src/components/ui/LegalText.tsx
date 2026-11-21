import { Fragment } from 'react';

/**
 * Destaca em fonte monoespaçada referências normativas e técnicas no texto:
 * artigos (art. 144, arts. 158-A a 158-F), leis (Lei 12.737/2012, LC 129/2004),
 * normas (ISO/IEC 27001:2022), RFCs e protocolos 802.1X.
 */
const PATTERN =
  /(arts?\.\s*\d+[º°]?(?:-[A-Z])?(?:\s*(?:a|e)\s*\d+[º°]?(?:-[A-Z])?)?|(?:LC(?:\s+Estadual)?|Lei(?:\s+(?:Federal|Estadual))?|Decreto)\s+(?:nº\s*)?\d[\d.]*\/\d{4}|ISO\/IEC\s*\d+:\d{4}|RFC\s*\d+|802\.1X)/g;

export function LegalText({ text }: { text: string }) {
  const parts = text.split(PATTERN);
  return (
    <>
      {parts.map((part, i) =>
        i % 2 === 1 ? (
          <code key={i} className="rounded-sm border border-line bg-canvas px-1 py-px font-mono text-[0.86em] text-ink">
            {part}
          </code>
        ) : (
          <Fragment key={i}>{part}</Fragment>
        ),
      )}
    </>
  );
}
