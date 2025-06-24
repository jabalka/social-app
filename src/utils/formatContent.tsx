import React from "react";

export const COMMON_ABBREVIATIONS = [
    "Mr.", "Mrs.", "Ms.", "Miss.", "Mx.", "Dr.", "Prof.", "Rev.", "Fr.", "Sr.", "Jr.",
    "Capt.", "Lt.", "Col.", "Gen.", "St.", "Adm.", "Maj.", "Sgt.", "Cpl.", "Pvt.",
    "Ave.", "Rd.", "Mt.", "Hon.", "Messrs.", "Mmes.", "Esq.", "Mstr.", "Sra.", "Srs.",
    "e.g.", "i.e.", "etc.", "vs.", "viz.", "cf.", "al.", "Jan.", "Feb.", "Mar.", "Apr.", "Jun.", "Jul.", "Aug.", "Sep.", "Sept.", "Oct.", "Nov.", "Dec.",
    "a.m.", "p.m.", "ca.", "c.", "B.C.", "A.D.", "No.", "p.", "pp.", "Ed.", "eds.", "vol.", "Vol.", "Op.", "cit.",
    "Co.", "Corp.", "Inc.", "Ltd.", "Dept.", "Univ.", "Assn.", "Bros.", "Intl.", "Natl.", "Ed.", "Rd.", "Ln.", "Blvd.", "Pl.", "Sq.", "Ste.",
    "Ave.", "Blvd.", "Rd.", "St.", "Sq.", "Ste.", "Rm.", "Fl.", "Bldg.", "Apt.", "Mt."
  ];

export function formatTooltipContent(content: React.ReactNode): React.ReactNode {
  if (typeof content !== "string") return content;

  // Replace abbreviations with placeholders
  let tempContent = content;
  const abbrPlaceholders: Record<string, string> = {};
  COMMON_ABBREVIATIONS.forEach((abbr, idx) => {
    const key = `__ABBR${idx}__`;
    tempContent = tempContent.replaceAll(abbr, key);
    abbrPlaceholders[key] = abbr;
  });

  // Split on real sentence ends
  let fragments = tempContent.split(/(?<=[.?!])\s+/g);

  // Restore abbreviations
  fragments = fragments.map(s => {
    Object.entries(abbrPlaceholders).forEach(([key, abbr]) => {
      s = s.replaceAll(key, abbr);
    });
    return s;
  });

  // Now combine into lines up to 35 chars each (try to fill lines)
  const lines: string[] = [];
  let currentLine = "";

  for (let frag of fragments) {
    frag = frag.trim();
    // If the fragment itself is too long, split it
    while (frag.length > 35) {
      let idx = frag.slice(0, 35).lastIndexOf(" ");
      if (idx === -1) idx = 35;
      if (currentLine) {
        lines.push(currentLine);
        currentLine = "";
      }
      lines.push(frag.slice(0, idx));
      frag = frag.slice(idx).trim();
    }
    // Try to append the fragment to current line if fits
    if ((currentLine + " " + frag).trim().length <= 35) {
      currentLine = (currentLine + " " + frag).trim();
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
          <br />
        </span>
      ))}
    </span>

  );
}