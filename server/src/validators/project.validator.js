import { z } from "zod";

const optionalText = z.string().trim().max(1500).default("");

const stringList = z
  .array(z.string().trim().min(1).max(100))
  .max(30)
  .default([]);

const answersSchema = z.object({
  // Common requirements
  projectStage: z.enum([
    "new-project",
    "existing-project",
    "improvement",
    "exploring",
  ]),

  projectDescription: z.string().trim().min(20).max(1500),

  // Software development
  projectType: optionalText,
  targetUsers: optionalText,
  features: stringList,

  // AI and automation
  automationType: optionalText,
  currentWorkflow: optionalText,
  integrations: optionalText,

  // Cloud and DevOps
  infrastructureStage: optionalText,
  cloudNeeds: stringList,

  // Digital marketing
  marketingGoal: optionalText,
  marketingChannels: stringList,
  targetAudience: optionalText,

  // Not sure
  unsureGoal: optionalText,

  // Technical requirements
  preferredTechnologies: stringList,
  additionalIntegrations: optionalText,
  expectedScale: optionalText,
  timeline: optionalText,
  budgetRange: optionalText,
  securityNeeds: stringList,
}).strict();

export const createProjectSchema = z.object({
  serviceCategory: z.enum([
    "software-development",
    "ai-automation",
    "cloud-devops",
    "digital-marketing",
    "not-sure",
  ]),

  contact: z.object({
    name: z.string().trim().min(2).max(100),
    email: z.string().trim().email().max(254),
  }).strict(),

  answers: answersSchema,
}).strict();