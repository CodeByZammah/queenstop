import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Star, Send, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { testimonialSchema } from "@/lib/validation";
import { getSafeErrorMessage } from "@/lib/error-handler";
import { z } from "zod";

const TestimonialSubmit = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [formData, setFormData] = useState({
    name: "",
    role: "",
    content: "",
    email: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate input using Zod schema
    const testimonialData = {
      name: formData.name,
      role: formData.role || undefined,
      content: formData.content,
      rating,
      email: formData.email || undefined,
    };

    try {
      testimonialSchema.parse(testimonialData);
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast({
          title: "Validation Error",
          description: error.errors[0].message,
          variant: "destructive",
        });
        return;
      }
    }

    setLoading(true);
    try {
      const { error } = await supabase.from("testimonials").insert({
        name: formData.name.trim(),
        role: formData.role.trim() || null,
        content: formData.content.trim(),
        rating,
        email: formData.email.trim() || null,
      });

      if (error) throw error;

      toast({
        title: "Thank You!",
        description: "Your testimonial has been submitted for review.",
      });

      setFormData({ name: "", role: "", content: "", email: "" });
      setRating(5);
    } catch (error: unknown) {
      toast({
        title: "Error",
        description: getSafeErrorMessage(error),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <span className="text-primary font-semibold text-sm uppercase tracking-wider mb-3 block">
              Share Your Experience
            </span>
            <h2 className="text-2xl md:text-3xl font-display font-bold text-foreground mb-4">
              Leave a <span className="text-primary">Testimonial</span>
            </h2>
            <p className="text-muted-foreground">
              We'd love to hear about your experience with our services.
            </p>
          </div>

          <div className="bg-card rounded-2xl shadow-card p-6 sm:p-8">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Your Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    placeholder="John Doe"
                    className="w-full p-3 border border-border rounded-lg bg-background text-foreground focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-smooth"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Your Role</label>
                  <input
                    type="text"
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    placeholder="e.g., Bride, Business Owner"
                    className="w-full p-3 border border-border rounded-lg bg-background text-foreground focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-smooth"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Email (optional)</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="john@example.com"
                  className="w-full p-3 border border-border rounded-lg bg-background text-foreground focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-smooth"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Your Rating *</label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      className="p-1 transition-transform hover:scale-110"
                    >
                      <Star
                        className={`w-7 h-7 transition-colors ${
                          star <= (hoverRating || rating)
                            ? "fill-primary text-primary"
                            : "text-muted-foreground"
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Your Testimonial *</label>
                <textarea
                  name="content"
                  value={formData.content}
                  onChange={handleChange}
                  required
                  rows={4}
                  placeholder="Share your experience with our services..."
                  className="w-full p-3 border border-border rounded-lg bg-background text-foreground focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-smooth resize-none"
                />
              </div>

              <Button size="lg" className="w-full" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                <Send size={18} className="mr-2" />
                Submit Testimonial
              </Button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TestimonialSubmit;
