import { z } from 'zod';

export const loginSchema = z.object({
  id_token: z.string().min(1, 'Le token est requis'),
});

export type LoginSchemaType = z.infer<typeof loginSchema>;

export const registerTeacherSchema = z.object({
  nom: z
    .string()
    .min(2, 'Le nom doit contenir au moins 2 caracteres')
    .max(100, 'Le nom ne doit pas depasser 100 caracteres'),
  prenom: z
    .string()
    .min(2, 'Le prenom doit contenir au moins 2 caracteres')
    .max(100, 'Le prenom ne doit pas depasser 100 caracteres'),
  telephone: z
    .string()
    .min(8, 'Le telephone doit contenir au moins 8 chiffres')
    .regex(/^[0-9+\s]+$/, 'Le telephone ne doit contenir que des chiffres'),
  ecole: z
    .string()
    .min(2, 'Le nom de l'ecole est requis')
    .max(200, 'Le nom de l'ecole est trop long'),
  classe: z
    .string()
    .min(1, 'La classe est requise')
    .max(100, 'La classe est trop longue'),
  matiere: z
    .string()
    .min(2, 'La matiere est requise')
    .max(100, 'La matiere est trop longue'),
});

export type RegisterTeacherSchemaType = z.infer<typeof registerTeacherSchema>;
