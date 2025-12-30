import { z } from 'zod';

// Shared validation schemas
export const nameSchema = z.string()
  .trim()
  .min(1, "Name is required")
  .max(100, "Name must be less than 100 characters");

export const emailSchema = z.string()
  .trim()
  .email("Invalid email address")
  .max(255, "Email must be less than 255 characters");

export const phoneSchema = z.string()
  .trim()
  .min(1, "Phone is required")
  .max(20, "Phone must be less than 20 characters");

export const optionalPhoneSchema = z.string()
  .trim()
  .max(20, "Phone must be less than 20 characters")
  .optional()
  .or(z.literal(""));

export const messageSchema = z.string()
  .trim()
  .min(10, "Message must be at least 10 characters")
  .max(2000, "Message must be less than 2000 characters");

export const locationSchema = z.string()
  .trim()
  .max(200, "Location must be less than 200 characters")
  .optional()
  .or(z.literal(""));

// Booking validation schema
export const bookingSchema = z.object({
  customer_name: nameSchema,
  customer_email: emailSchema,
  customer_phone: phoneSchema,
  pickup_location: locationSchema,
  dropoff_location: locationSchema,
  notes: z.string().max(1000, "Notes must be less than 1000 characters").optional(),
});

// Contact form validation schema
export const contactSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  phone: optionalPhoneSchema,
  subject: z.string().max(200, "Subject must be less than 200 characters").optional().or(z.literal("")),
  message: messageSchema,
});

// Testimonial validation schema
export const testimonialSchema = z.object({
  name: nameSchema,
  role: z.string().trim().max(100, "Role must be less than 100 characters").optional().or(z.literal("")),
  content: z.string().trim().min(20, "Content must be at least 20 characters").max(1000, "Content must be less than 1000 characters"),
  rating: z.number().int().min(1, "Rating must be at least 1").max(5, "Rating must be at most 5"),
  email: z.string().trim().email("Invalid email address").max(255).optional().or(z.literal("")),
});

// Product validation schema (admin)
export const productSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(200, "Name must be less than 200 characters"),
  description: z.string().max(1000, "Description must be less than 1000 characters").optional().nullable(),
  price: z.number().positive("Price must be positive").max(999999999, "Price is too large"),
  category: z.enum(['car', 'jewellery', 'wedding']),
  image_url: z.string().max(500).optional().nullable(),
  features: z.array(z.string().max(100)).max(20).optional().nullable(),
  is_available: z.boolean(),
});

// Type exports
export type BookingInput = z.infer<typeof bookingSchema>;
export type ContactInput = z.infer<typeof contactSchema>;
export type TestimonialInput = z.infer<typeof testimonialSchema>;
export type ProductInput = z.infer<typeof productSchema>;
