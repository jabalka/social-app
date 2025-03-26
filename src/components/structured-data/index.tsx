import Script from "next/script";
import { Thing } from "schema-dts";

interface StructuredDataProps<T extends Thing> {
  id: string;
  data: T | T[];
}

const StructuredData = <T extends Thing>({ id, data }: StructuredDataProps<T>) => {
  return (
    <Script id={id} type="application/ld+json" strategy="afterInteractive">
      {JSON.stringify(data)}
    </Script>
  );
};

export default StructuredData;
