export const unitOptions = {
  weight: ['g', 'kg'],
  volume: ['mL', 'L'],
  count: ['unit']
};

export const baseUnitByDimension = {
  weight: 'g',
  volume: 'mL',
  count: 'unit'
};

export const unitToBaseFactor = {
  g: '1',
  kg: '1000',
  mL: '1',
  L: '1000',
  unit: '1'
};

export function getAllowedUnits(dimension) {
  return unitOptions[dimension] || [];
}

export function toBaseQuantity(quantity, unit) {
  const numericQuantity = Number(quantity);
  const factor = Number(unitToBaseFactor[unit]);
  if (!Number.isFinite(numericQuantity) || numericQuantity <= 0 || !Number.isFinite(factor)) {
    throw new Error('Invalid quantity or unit');
  }
  return numericQuantity * factor;
}

export function fromBaseQuantity(quantity, unit) {
  return Number(quantity) / Number(unitToBaseFactor[unit]);
}

export function formatQuantity(quantity, unit) {
  return `${Number(quantity).toLocaleString('en-IN', { maximumFractionDigits: 6 })} ${unit}`;
}

export function formatInr(value) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2
  }).format(Number(value || 0));
}

export function calculateLineTotal(pricePerBaseUnitInr, quantity, unit) {
  return Number(pricePerBaseUnitInr) * toBaseQuantity(quantity, unit);
}
