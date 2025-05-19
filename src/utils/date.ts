// utils/date.ts
export const toDate = (date: Date | string): Date => {
    return date instanceof Date ? date : new Date(date);
  };
  
  export const toOptionalDate = (date: Date | string | null | undefined): Date | null => {
    return date ? toDate(date) : null;
  };