export type WidthOptions = "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "5xl" | "6xl" | "7xl" | "full";
export type HeightOptions = "screen" | "50vh" | "90vh" | "80vh" | "70vh" | "auto";

export interface ResponsiveWidth {
  default: WidthOptions;
  sm?: WidthOptions;
  md?: WidthOptions;
  lg?: WidthOptions;
  xl?: WidthOptions;
  "2xl"?: WidthOptions;
}

export interface ResponsiveHeight {
  default: HeightOptions;
  sm?: HeightOptions;
  md?: HeightOptions;
  lg?: HeightOptions;
  xl?: HeightOptions;
  "2xl"?: HeightOptions;
}

export const getMaxWidthClass = (maxWidth: WidthOptions): string => {
  return `max-w-${maxWidth}`;
};

export const getMaxHeightClass = (maxHeight: HeightOptions): string => {
  if (maxHeight === "auto") return "max-h-full";
  if (maxHeight === "screen") return "max-h-screen";
  return `max-h-[${maxHeight}]`;
};

export const getResponsiveWidthClasses = (config: ResponsiveWidth): string => {
  if (!config || typeof config !== "object") {
    return "max-w-xl";
  }

  const classes = [];

  if (config.default) {
    classes.push(`max-w-${config.default}`);
  }

  if (config.sm) classes.push(`sm:max-w-${config.sm}`);
  if (config.md) classes.push(`md:max-w-${config.md}`);
  if (config.lg) classes.push(`lg:max-w-${config.lg}`);
  if (config.xl) classes.push(`xl:max-w-${config.xl}`);
  if (config["2xl"]) classes.push(`2xl:max-w-${config["2xl"]}`);

  return classes.join(" ");
};

export const getResponsiveHeightClasses = (config: ResponsiveHeight): string => {
  if (!config || typeof config !== "object") {
    return "max-h-full";
  }

  const classes = [];

  const formatHeightClass = (size: HeightOptions) => {
    if (size === "auto") return "max-h-full";
    if (size === "screen") return "max-h-screen";
    return `max-h-[${size}]`;
  };

  if (config.default) {
    classes.push(formatHeightClass(config.default));
  }

  if (config.sm) classes.push(`sm:${formatHeightClass(config.sm)}`);
  if (config.md) classes.push(`md:${formatHeightClass(config.md)}`);
  if (config.lg) classes.push(`lg:${formatHeightClass(config.lg)}`);
  if (config.xl) classes.push(`xl:${formatHeightClass(config.xl)}`);
  if (config["2xl"]) classes.push(`2xl:${formatHeightClass(config["2xl"])}`);

  return classes.join(" ");
};
