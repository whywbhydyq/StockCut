import { z } from 'zod';

const positive = z.coerce.number().positive();
const nonNegative = z.coerce.number().nonnegative();

export const acInputSchema = z.object({
  lengthFt: positive.default(12),
  widthFt: positive.default(10),
  areaSqft: nonNegative.default(0),
  ceilingHeightFt: positive.default(8),
  sunExposure: z.enum(['average', 'shaded', 'sunny']).default('average'),
  occupants: nonNegative.default(2),
  kitchen: z.coerce.boolean().default(false),
  insulation: z.enum(['poor', 'average', 'good']).default('average')
});

export const dehumidifierInputSchema = z.object({
  areaSqft: positive.default(1000),
  dampness: z.enum(['slightly-damp', 'damp', 'very-damp', 'wet']).default('damp'),
  basement: z.coerce.boolean().default(false),
  temperatureF: z.coerce.number().min(40).max(100).default(70),
  waterIntrusion: z.coerce.boolean().default(false),
  continuousDrain: z.coerce.boolean().default(false)
});

export const ventilationInputSchema = z.object({
  lengthFt: positive.default(12),
  widthFt: positive.default(10),
  ceilingHeightFt: positive.default(8),
  targetAch: positive.default(6),
  cfm: positive.default(100)
});
