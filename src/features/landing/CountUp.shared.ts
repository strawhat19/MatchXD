const numberFormatter = new Intl.NumberFormat(`en-US`);

export const formatCount = (value: number) => numberFormatter.format(value);
