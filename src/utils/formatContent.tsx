import React from "react";

export const COMMON_ABBREVIATIONS = [
  "Mr.",
  "Mrs.",
  "Ms.",
  "Miss.",
  "Mx.",
  "Dr.",
  "Prof.",
  "Rev.",
  "Fr.",
  "Sr.",
  "Jr.",
  "Capt.",
  "Lt.",
  "Col.",
  "Gen.",
  "St.",
  "Adm.",
  "Maj.",
  "Sgt.",
  "Cpl.",
  "Pvt.",
  "Ave.",
  "Rd.",
  "Mt.",
  "Hon.",
  "Messrs.",
  "Mmes.",
  "Esq.",
  "Mstr.",
  "Sra.",
  "Srs.",
  "e.g.",
  "i.e.",
  "etc.",
  "vs.",
  "viz.",
  "cf.",
  "al.",
  "Jan.",
  "Feb.",
  "Mar.",
  "Apr.",
  "Jun.",
  "Jul.",
  "Aug.",
  "Sep.",
  "Sept.",
  "Oct.",
  "Nov.",
  "Dec.",
  "a.m.",
  "p.m.",
  "ca.",
  "c.",
  "B.C.",
  "A.D.",
  "No.",
  "p.",
  "pp.",
  "Ed.",
  "eds.",
  "vol.",
  "Vol.",
  "Op.",
  "cit.",
  "Co.",
  "Corp.",
  "Inc.",
  "Ltd.",
  "Dept.",
  "Univ.",
  "Assn.",
  "Bros.",
  "Intl.",
  "Natl.",
  "Ed.",
  "Rd.",
  "Ln.",
  "Blvd.",
  "Pl.",
  "Sq.",
  "Ste.",
  "Ave.",
  "Blvd.",
  "Rd.",
  "St.",
  "Sq.",
  "Ste.",
  "Rm.",
  "Fl.",
  "Bldg.",
  "Apt.",
  "Mt.",
];

const MULTILINE_THRESHOLD = 16; // Only spread to multiple lines if content length > 16
const MAX_LINE_LENGTH = 35; // Target max characters per line

export function formatTooltipContent(content: React.ReactNode): React.ReactNode {
  if (typeof content !== "string") return content;

  const normalizedForThreshold = content.replace(/\s+/g, " ").trim();
  if (normalizedForThreshold.length <= MULTILINE_THRESHOLD) {
    return <span className="whitespace-nowrap">{content}</span>;
  }

  let tempContent = content;
  const abbrPlaceholders: Record<string, string> = {};
  COMMON_ABBREVIATIONS.forEach((abbr, idx) => {
    const key = `__ABBR${idx}__`;
    tempContent = tempContent.replaceAll(abbr, key);
    abbrPlaceholders[key] = abbr;
  });

  let fragments = tempContent.split(/(?<=[.?!])\s+/g);

  fragments = fragments.map((s) => {
    Object.entries(abbrPlaceholders).forEach(([key, abbr]) => {
      s = s.replaceAll(key, abbr);
    });
    return s;
  });

  const lines: string[] = [];
  let currentLine = "";

  for (let frag of fragments) {
    frag = frag.trim();
    if (!frag) continue;

    while (frag.length > MAX_LINE_LENGTH) {
      let idx = frag.slice(0, MAX_LINE_LENGTH).lastIndexOf(" ");
      if (idx === -1) idx = MAX_LINE_LENGTH;
      if (currentLine) {
        lines.push(currentLine);
        currentLine = "";
      }
      lines.push(frag.slice(0, idx));
      frag = frag.slice(idx).trim();
    }

    const candidate = (currentLine + " " + frag).trim();
    if (candidate.length <= MAX_LINE_LENGTH) {
      currentLine = candidate;
    } else {
      if (currentLine) lines.push(currentLine);
      currentLine = frag;
    }
  }

  if (currentLine) lines.push(currentLine);

  return (
    <span>
      {lines.map((line, idx) => (
        <span key={idx}>
          {line}
          {idx < lines.length - 1 && <br />}
        </span>
      ))}
    </span>
  );
}
