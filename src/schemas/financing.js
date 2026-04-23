import { z } from 'zod';

export const paymentFrequencySchema = z.enum(['weekly', 'biweekly', 'monthly']);
export const transactionTypeSchema = z.enum(['financement', 'location', 'comptant']);

export const financingSchema = z
  .object({
    transactionType: transactionTypeSchema,
    /** Capital à financer / capital loué (dollars). Pour « comptant », correspond au prix total. */
    capitalDollars: z.number().min(0).max(1_000_000).optional(),
    termMonths: z.number().int().min(0).max(120).optional(),
    /** Taux annuel (%) — taux d’intérêt pour un prêt, taux de location pour un bail. */
    interestRate: z.number().min(0).max(30).optional(),
    paymentFrequency: paymentFrequencySchema.optional(),
    /** Valeur résiduelle en dollars (location uniquement). */
    residualDollars: z.number().min(0).max(1_000_000).optional(),
    /** Paiement dû en début de période (location — convention nord-américaine). */
    annuityDue: z.boolean().optional(),
  })
  .superRefine((val, ctx) => {
    if (val.transactionType === 'comptant') {
      if (val.capitalDollars == null) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['capitalDollars'], message: 'Prix total requis' });
      }
      return;
    }
    if (val.capitalDollars == null) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['capitalDollars'], message: 'Requis' });
    }
    if (val.termMonths == null) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['termMonths'], message: 'Requis' });
    }
    if (val.interestRate == null) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['interestRate'], message: 'Requis' });
    }
    if (val.paymentFrequency == null) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['paymentFrequency'], message: 'Requis' });
    }
    if (val.transactionType === 'location') {
      if (val.residualDollars == null) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['residualDollars'], message: 'Valeur résiduelle requise' });
      } else if (val.capitalDollars != null && val.residualDollars >= val.capitalDollars) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['residualDollars'],
          message: 'La valeur résiduelle doit être inférieure au capital loué',
        });
      }
    }
  });

export const interestLevelSchema = z.enum(['no', 'maybe', 'yes']);

export const productResponseV2Schema = z.object({
  interest: interestLevelSchema,
  tierId: z.string().optional(),
  priceCents: z.number().int().optional(),
  notes: z.string().max(2000).optional(),
});

export const productResponsesV2Schema = z.record(z.string(), productResponseV2Schema);
