import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Database } from "@/integrations/supabase/types";

type Product = Database["public"]["Tables"]["products"]["Row"];
type ProductCategory = Database["public"]["Enums"]["product_category"];

export const useProducts = (category?: ProductCategory) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        let query = supabase
          .from("products")
          .select("*")
          .eq("is_available", true)
          .order("created_at", { ascending: false });

        if (category) {
          query = query.eq("category", category);
        }

        const { data, error } = await query;

        if (error) throw error;
        setProducts(data || []);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [category]);

  return { products, loading, error };
};
