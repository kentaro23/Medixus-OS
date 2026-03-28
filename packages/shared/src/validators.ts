import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("有効なメールアドレスを入力してください"),
  password: z.string().min(8, "パスワードは8文字以上です"),
});

export const registerSchema = z
  .object({
    lastName: z.string().min(1, "姓を入力してください"),
    firstName: z.string().min(1, "名を入力してください"),
    email: z.string().email("有効なメールアドレスを入力してください"),
    password: z.string().min(8, "パスワードは8文字以上です"),
    confirmPassword: z.string(),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "パスワードが一致しません",
    path: ["confirmPassword"],
  });

export const vitalRecordSchema = z.object({
  systolicBP: z.number().int().min(50).max(300).optional(),
  diastolicBP: z.number().int().min(20).max(200).optional(),
  heartRate: z.number().int().min(20).max(300).optional(),
  bodyTemperature: z.number().min(30).max(45).optional(),
  spo2: z.number().int().min(50).max(100).optional(),
  bloodGlucose: z.number().int().min(10).max(900).optional(),
  weight: z.number().min(1).max(500).optional(),
});

export const prescriptionItemSchema = z.object({
  medicationName: z.string().min(1),
  dosage: z.string().min(1),
  unit: z.string().min(1),
  frequency: z.string().min(1),
  route: z.string().default("経口"),
  daysSupply: z.number().int().min(1).max(90),
  noGenericSubstitution: z.boolean().default(false),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type VitalRecordInput = z.infer<typeof vitalRecordSchema>;
export type PrescriptionItemInput = z.infer<typeof prescriptionItemSchema>;
