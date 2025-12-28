import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { 
  Plus, LogOut, Car, Gem, Heart, Loader2, Trash2, Edit2, 
  Package, Mail, Calendar, X, Save, Upload, Image as ImageIcon
} from "lucide-react";
import logo from "@/assets/logo.png";
import type { User } from "@supabase/supabase-js";

type ProductCategory = "car" | "jewellery" | "wedding";

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  category: ProductCategory;
  image_url: string | null;
  features: string[] | null;
  is_available: boolean;
  created_at: string;
}

interface Booking {
  id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  pickup_location: string | null;
  dropoff_location: string | null;
  pickup_date: string | null;
  dropoff_date: string | null;
  status: string | null;
  notes: string | null;
  created_at: string;
}

interface ContactSubmission {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  subject: string | null;
  message: string;
  created_at: string;
}

const Admin = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"products" | "bookings" | "contacts">("products");
  const [activeCategory, setActiveCategory] = useState<ProductCategory>("car");
  const [products, setProducts] = useState<Product[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [contacts, setContacts] = useState<ContactSubmission[]>([]);
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [saving, setSaving] = useState(false);
  const [productForm, setProductForm] = useState({
    name: "",
    description: "",
    price: "",
    category: "car" as ProductCategory,
    image_url: "",
    features: "",
    is_available: true,
  });
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
        return;
      }
      setUser(session.user);
      setLoading(false);
      fetchData();
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session) {
        navigate("/auth");
      } else {
        setUser(session.user);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const fetchData = async () => {
    // Fetch products
    const { data: productsData } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });
    if (productsData) setProducts(productsData as Product[]);

    // Fetch bookings
    const { data: bookingsData } = await supabase
      .from("bookings")
      .select("*")
      .order("created_at", { ascending: false });
    if (bookingsData) setBookings(bookingsData as Booking[]);

    // Fetch contacts
    const { data: contactsData } = await supabase
      .from("contact_submissions")
      .select("*")
      .order("created_at", { ascending: false });
    if (contactsData) setContacts(contactsData as ContactSubmission[]);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const openProductModal = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      setProductForm({
        name: product.name,
        description: product.description || "",
        price: product.price.toString(),
        category: product.category,
        image_url: product.image_url || "",
        features: product.features?.join(", ") || "",
        is_available: product.is_available,
      });
      setImagePreview(product.image_url || null);
    } else {
      setEditingProduct(null);
      setProductForm({
        name: "",
        description: "",
        price: "",
        category: activeCategory,
        image_url: "",
        features: "",
        is_available: true,
      });
      setImagePreview(null);
    }
    setShowProductModal(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast({ title: "Error", description: "Please select an image file", variant: "destructive" });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({ title: "Error", description: "Image must be less than 5MB", variant: "destructive" });
      return;
    }

    setUploadingImage(true);
    
    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
      const filePath = `${productForm.category}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("products")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("products")
        .getPublicUrl(filePath);

      setProductForm({ ...productForm, image_url: publicUrl });
      setImagePreview(publicUrl);
      toast({ title: "Success", description: "Image uploaded!" });
    } catch (error: any) {
      toast({ title: "Upload failed", description: error.message, variant: "destructive" });
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSaveProduct = async () => {
    if (!productForm.name || !productForm.price) {
      toast({ title: "Error", description: "Name and price are required", variant: "destructive" });
      return;
    }

    setSaving(true);
    const productData = {
      name: productForm.name,
      description: productForm.description || null,
      price: parseFloat(productForm.price),
      category: productForm.category,
      image_url: productForm.image_url || null,
      features: productForm.features ? productForm.features.split(",").map((f) => f.trim()) : null,
      is_available: productForm.is_available,
    };

    try {
      if (editingProduct) {
        const { error } = await supabase
          .from("products")
          .update(productData)
          .eq("id", editingProduct.id);
        if (error) throw error;
        toast({ title: "Success", description: "Product updated!" });
      } else {
        const { error } = await supabase.from("products").insert(productData);
        if (error) throw error;
        toast({ title: "Success", description: "Product added!" });
      }
      setShowProductModal(false);
      fetchData();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;
    
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Deleted", description: "Product removed" });
      fetchData();
    }
  };

  const filteredProducts = products.filter((p) => p.category === activeCategory);

  const getCategoryIcon = (cat: ProductCategory) => {
    switch (cat) {
      case "car": return <Car size={18} />;
      case "jewellery": return <Gem size={18} />;
      case "wedding": return <Heart size={18} />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <img src={logo} alt="Queenstop" className="h-8" />
            <span className="text-sm text-muted-foreground">Admin Panel</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground hidden md:block">{user?.email}</span>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut size={16} className="mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Tabs */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
          <Button
            variant={activeTab === "products" ? "default" : "outline"}
            onClick={() => setActiveTab("products")}
          >
            <Package size={18} className="mr-2" />
            Products
          </Button>
          <Button
            variant={activeTab === "bookings" ? "default" : "outline"}
            onClick={() => setActiveTab("bookings")}
          >
            <Calendar size={18} className="mr-2" />
            Bookings ({bookings.length})
          </Button>
          <Button
            variant={activeTab === "contacts" ? "default" : "outline"}
            onClick={() => setActiveTab("contacts")}
          >
            <Mail size={18} className="mr-2" />
            Messages ({contacts.length})
          </Button>
        </div>

        {/* Products Tab */}
        {activeTab === "products" && (
          <>
            {/* Category Filter */}
            <div className="flex flex-wrap gap-2 mb-6">
              {(["car", "jewellery", "wedding"] as ProductCategory[]).map((cat) => (
                <Button
                  key={cat}
                  variant={activeCategory === cat ? "default" : "outline"}
                  size="sm"
                  onClick={() => setActiveCategory(cat)}
                >
                  {getCategoryIcon(cat)}
                  <span className="ml-2 capitalize">{cat === "car" ? "Car Hire" : cat}</span>
                </Button>
              ))}
              <Button size="sm" onClick={() => openProductModal()} className="ml-auto">
                <Plus size={18} className="mr-2" />
                Add Product
              </Button>
            </div>

            {/* Products Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map((product) => (
                <div key={product.id} className="bg-card rounded-xl shadow-card overflow-hidden">
                  {product.image_url && (
                    <img
                      src={product.image_url}
                      alt={product.name}
                      className="w-full h-48 object-cover"
                    />
                  )}
                  {!product.image_url && (
                    <div className="w-full h-48 bg-muted flex items-center justify-center">
                      {getCategoryIcon(product.category)}
                    </div>
                  )}
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-foreground">{product.name}</h3>
                      <span className="text-primary font-bold">${product.price}</span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                      {product.description}
                    </p>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs px-2 py-1 rounded-full ${product.is_available ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                        {product.is_available ? "Available" : "Unavailable"}
                      </span>
                    </div>
                    <div className="flex gap-2 mt-4">
                      <Button size="sm" variant="outline" onClick={() => openProductModal(product)}>
                        <Edit2 size={14} className="mr-1" />
                        Edit
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleDeleteProduct(product.id)}>
                        <Trash2 size={14} className="mr-1" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
              {filteredProducts.length === 0 && (
                <div className="col-span-full text-center py-12 text-muted-foreground">
                  No products in this category yet. Click "Add Product" to create one.
                </div>
              )}
            </div>
          </>
        )}

        {/* Bookings Tab */}
        {activeTab === "bookings" && (
          <div className="bg-card rounded-xl shadow-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="text-left p-4 text-sm font-medium text-foreground">Customer</th>
                    <th className="text-left p-4 text-sm font-medium text-foreground">Contact</th>
                    <th className="text-left p-4 text-sm font-medium text-foreground">Dates</th>
                    <th className="text-left p-4 text-sm font-medium text-foreground">Status</th>
                    <th className="text-left p-4 text-sm font-medium text-foreground">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map((booking) => (
                    <tr key={booking.id} className="border-t border-border">
                      <td className="p-4">
                        <p className="font-medium text-foreground">{booking.customer_name}</p>
                        <p className="text-sm text-muted-foreground">{booking.pickup_location}</p>
                      </td>
                      <td className="p-4">
                        <p className="text-sm text-foreground">{booking.customer_email}</p>
                        <p className="text-sm text-muted-foreground">{booking.customer_phone}</p>
                      </td>
                      <td className="p-4 text-sm text-foreground">
                        {booking.pickup_date} → {booking.dropoff_date}
                      </td>
                      <td className="p-4">
                        <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary capitalize">
                          {booking.status}
                        </span>
                      </td>
                      <td className="p-4 text-sm text-muted-foreground">
                        {new Date(booking.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                  {bookings.length === 0 && (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-muted-foreground">
                        No bookings yet
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Contacts Tab */}
        {activeTab === "contacts" && (
          <div className="space-y-4">
            {contacts.map((contact) => (
              <div key={contact.id} className="bg-card rounded-xl shadow-card p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-foreground">{contact.name}</h3>
                    <p className="text-sm text-muted-foreground">{contact.email} • {contact.phone}</p>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {new Date(contact.created_at).toLocaleDateString()}
                  </span>
                </div>
                {contact.subject && (
                  <p className="text-sm font-medium text-foreground mb-2">{contact.subject}</p>
                )}
                <p className="text-muted-foreground">{contact.message}</p>
              </div>
            ))}
            {contacts.length === 0 && (
              <div className="text-center py-12 text-muted-foreground bg-card rounded-xl">
                No messages yet
              </div>
            )}
          </div>
        )}
      </div>

      {/* Product Modal */}
      {showProductModal && (
        <div className="fixed inset-0 bg-charcoal/50 z-50 flex items-center justify-center p-4">
          <div className="bg-card rounded-2xl shadow-elevated w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-border flex items-center justify-between">
              <h2 className="text-xl font-display font-bold text-foreground">
                {editingProduct ? "Edit Product" : "Add New Product"}
              </h2>
              <button onClick={() => setShowProductModal(false)} className="text-muted-foreground hover:text-foreground">
                <X size={24} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Product Name *</label>
                <Input
                  value={productForm.name}
                  onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                  placeholder="e.g., Mercedes S-Class"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Description</label>
                <textarea
                  value={productForm.description}
                  onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                  placeholder="Describe the product..."
                  rows={3}
                  className="w-full p-3 border border-border rounded-lg bg-background text-foreground focus:border-primary outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Price *</label>
                  <Input
                    type="number"
                    value={productForm.price}
                    onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                    placeholder="0.00"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Category</label>
                  <select
                    value={productForm.category}
                    onChange={(e) => setProductForm({ ...productForm, category: e.target.value as ProductCategory })}
                    className="w-full p-3 border border-border rounded-lg bg-background text-foreground"
                  >
                    <option value="car">Car Hire</option>
                    <option value="jewellery">Jewellery</option>
                    <option value="wedding">Wedding Accessories</option>
                  </select>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Product Image</label>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageUpload}
                  accept="image/*"
                  className="hidden"
                />
                <div className="flex flex-col gap-3">
                  {imagePreview ? (
                    <div className="relative w-full h-40 rounded-lg overflow-hidden bg-muted">
                      <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => {
                          setImagePreview(null);
                          setProductForm({ ...productForm, image_url: "" });
                        }}
                        className="absolute top-2 right-2 p-1 bg-destructive text-destructive-foreground rounded-full hover:bg-destructive/90"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ) : (
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full h-40 border-2 border-dashed border-border rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-primary/50 transition-colors"
                    >
                      {uploadingImage ? (
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                      ) : (
                        <>
                          <ImageIcon size={32} className="text-muted-foreground mb-2" />
                          <span className="text-sm text-muted-foreground">Click to upload image</span>
                          <span className="text-xs text-muted-foreground mt-1">Max 5MB</span>
                        </>
                      )}
                    </div>
                  )}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingImage}
                  >
                    {uploadingImage ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : (
                      <Upload size={16} className="mr-2" />
                    )}
                    {imagePreview ? "Change Image" : "Upload Image"}
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Features (comma separated)</label>
                <Input
                  value={productForm.features}
                  onChange={(e) => setProductForm({ ...productForm, features: e.target.value })}
                  placeholder="Leather seats, GPS, Bluetooth"
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="available"
                  checked={productForm.is_available}
                  onChange={(e) => setProductForm({ ...productForm, is_available: e.target.checked })}
                  className="rounded"
                />
                <label htmlFor="available" className="text-sm text-foreground">Available for purchase/booking</label>
              </div>
            </div>
            <div className="p-6 border-t border-border flex gap-3">
              <Button variant="outline" onClick={() => setShowProductModal(false)} className="flex-1">
                Cancel
              </Button>
              <Button onClick={handleSaveProduct} disabled={saving} className="flex-1">
                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                <Save size={16} className="mr-2" />
                {editingProduct ? "Update" : "Create"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Admin;
