import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { 
  Plus, LogOut, Car, Gem, Heart, Loader2, Trash2, Edit2, 
  Package, Mail, Calendar, X, Save, Upload, Image as ImageIcon,
  Check, XCircle, Clock, Eye, EyeOff, MessageSquare, BarChart3, Star,
  Settings, Key, Globe, Phone, MapPin, ExternalLink
} from "lucide-react";
import logo from "@/assets/logo.png";
import type { User } from "@supabase/supabase-js";
import { getSafeErrorMessage } from "@/lib/error-handler";
import { formatKwacha, generateWhatsAppLink, useSiteConfig, type SiteContacts, type SiteAddress, type SiteSocial, type HeroImage } from "@/hooks/useSiteConfig";

type ProductCategory = "car" | "jewellery" | "wedding";
type BookingStatus = "pending" | "completed" | "cancelled";

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  category: ProductCategory;
  image_url: string | null;
  images: string[] | null;
  route_tags: string[] | null;
  features: string[] | null;
  is_available: boolean;
  created_at: string;
}

interface Booking {
  id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  country_code: string | null;
  route_type: string | null;
  booking_time: string | null;
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
  is_read: boolean;
  admin_reply: string | null;
  replied_at: string | null;
}

interface Testimonial {
  id: string;
  name: string;
  role: string | null;
  content: string;
  rating: number;
  email: string | null;
  image_url: string | null;
  is_approved: boolean;
  created_at: string;
}

const Admin = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { config, updateConfig, refetch: refetchConfig } = useSiteConfig();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"products" | "bookings" | "contacts" | "testimonials" | "analytics" | "settings">("products");
  const [activeCategory, setActiveCategory] = useState<ProductCategory>("car");
  const [products, setProducts] = useState<Product[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [contacts, setContacts] = useState<ContactSubmission[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [saving, setSaving] = useState(false);
  const [productForm, setProductForm] = useState({
    name: "",
    description: "",
    price: "",
    category: "car" as ProductCategory,
    image_url: "",
    images: [] as string[],
    route_tags: [] as string[],
    features: "",
    is_available: true,
  });
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const multiImageInputRef = useRef<HTMLInputElement>(null);
  
  // Reply modal state
  const [replyModalOpen, setReplyModalOpen] = useState(false);
  const [replyingTo, setReplyingTo] = useState<ContactSubmission | null>(null);
  const [replyText, setReplyText] = useState("");
  const [sendingReply, setSendingReply] = useState(false);

  // Testimonial modal state
  const [showTestimonialModal, setShowTestimonialModal] = useState(false);
  const [editingTestimonial, setEditingTestimonial] = useState<Testimonial | null>(null);
  const [testimonialForm, setTestimonialForm] = useState({
    name: "",
    role: "",
    content: "",
    rating: 5,
    image_url: "",
    is_approved: true,
  });

  // Password change state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [changingPassword, setChangingPassword] = useState(false);

  // Site config editing state
  const [settingsTab, setSettingsTab] = useState<"account" | "contacts" | "social" | "hero">("account");
  const [contactsForm, setContactsForm] = useState<SiteContacts>({
    phone: "",
    phoneSecondary: "",
    email: "",
    whatsappNumber: "",
    whatsappRaw: "",
  });
  const [addressForm, setAddressForm] = useState<SiteAddress>({
    street: "",
    city: "",
    zip: "",
    country: "",
    mapUrl: "",
  });
  const [socialForm, setSocialForm] = useState<SiteSocial>({
    facebook: "",
    instagram: "",
    twitter: "",
    youtube: "",
  });
  const [heroImages, setHeroImages] = useState<HeroImage[]>([]);
  const [savingConfig, setSavingConfig] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/auth");
        return;
      }

      const { data: roleData, error: roleError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', session.user.id)
        .single();
      
      if (roleError || roleData?.role !== 'admin') {
        toast({
          title: "Access Denied",
          description: "You don't have permission to access this area.",
          variant: "destructive"
        });
        await supabase.auth.signOut();
        navigate('/');
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
  }, [navigate, toast]);

  // Load site config into forms
  useEffect(() => {
    setContactsForm(config.contacts);
    setAddressForm(config.address);
    setSocialForm(config.social);
    setHeroImages(config.hero_images || []);
  }, [config]);

  const fetchData = async () => {
    const { data: productsData } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });
    if (productsData) setProducts(productsData as Product[]);

    const { data: bookingsData } = await supabase
      .from("bookings")
      .select("*")
      .order("created_at", { ascending: false });
    if (bookingsData) setBookings(bookingsData as Booking[]);

    const { data: contactsData } = await supabase
      .from("contact_submissions")
      .select("*")
      .order("created_at", { ascending: false });
    if (contactsData) setContacts(contactsData as ContactSubmission[]);

    const { data: testimonialsData } = await supabase
      .from("testimonials")
      .select("*")
      .order("created_at", { ascending: false });
    if (testimonialsData) setTestimonials(testimonialsData as Testimonial[]);
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
        images: product.images || [],
        route_tags: product.route_tags || [],
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
        images: [],
        route_tags: [],
        features: "",
        is_available: true,
      });
      setImagePreview(null);
    }
    setShowProductModal(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, isMain = true) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast({ title: "Error", description: "Please select an image file", variant: "destructive" });
      return;
    }

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

      if (isMain) {
        setProductForm({ ...productForm, image_url: publicUrl });
        setImagePreview(publicUrl);
      } else {
        setProductForm({ ...productForm, images: [...productForm.images, publicUrl] });
      }
      toast({ title: "Success", description: "Image uploaded!" });
    } catch (error: any) {
      toast({ title: "Upload failed", description: error.message, variant: "destructive" });
    } finally {
      setUploadingImage(false);
    }
  };

  const removeAdditionalImage = (index: number) => {
    const newImages = productForm.images.filter((_, i) => i !== index);
    setProductForm({ ...productForm, images: newImages });
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
      images: productForm.images.length > 0 ? productForm.images : null,
      route_tags: productForm.route_tags.length > 0 ? productForm.route_tags : null,
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
    } catch (error: unknown) {
      toast({ title: "Error", description: getSafeErrorMessage(error), variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;
    
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) {
      toast({ title: "Error", description: getSafeErrorMessage(error), variant: "destructive" });
    } else {
      toast({ title: "Deleted", description: "Product removed" });
      fetchData();
    }
  };

  const handleUpdateBookingStatus = async (id: string, status: BookingStatus) => {
    const { error } = await supabase
      .from("bookings")
      .update({ status })
      .eq("id", id);
    
    if (error) {
      toast({ title: "Error", description: getSafeErrorMessage(error), variant: "destructive" });
    } else {
      toast({ title: "Updated", description: `Booking marked as ${status}` });
      fetchData();
    }
  };

  const handleDeleteBooking = async (id: string) => {
    if (!confirm("Are you sure you want to delete this booking?")) return;
    
    const { error } = await supabase.from("bookings").delete().eq("id", id);
    if (error) {
      toast({ title: "Error", description: getSafeErrorMessage(error), variant: "destructive" });
    } else {
      toast({ title: "Deleted", description: "Booking removed" });
      fetchData();
    }
  };

  const handleToggleMessageRead = async (id: string, currentStatus: boolean) => {
    const { error } = await supabase
      .from("contact_submissions")
      .update({ is_read: !currentStatus })
      .eq("id", id);
    
    if (error) {
      toast({ title: "Error", description: getSafeErrorMessage(error), variant: "destructive" });
    } else {
      fetchData();
    }
  };

  const handleDeleteMessage = async (id: string) => {
    if (!confirm("Are you sure you want to delete this message?")) return;
    
    const { error } = await supabase.from("contact_submissions").delete().eq("id", id);
    if (error) {
      toast({ title: "Error", description: getSafeErrorMessage(error), variant: "destructive" });
    } else {
      toast({ title: "Deleted", description: "Message removed" });
      fetchData();
    }
  };

  const openReplyModal = (contact: ContactSubmission) => {
    setReplyingTo(contact);
    setReplyText(contact.admin_reply || "");
    setReplyModalOpen(true);
  };

  const handleSendReply = async () => {
    if (!replyingTo || !replyText.trim()) return;
    
    setSendingReply(true);
    const { error } = await supabase
      .from("contact_submissions")
      .update({ 
        admin_reply: replyText,
        replied_at: new Date().toISOString(),
        is_read: true,
      })
      .eq("id", replyingTo.id);
    
    if (error) {
      toast({ title: "Error", description: getSafeErrorMessage(error), variant: "destructive" });
    } else {
      toast({ title: "Reply Saved", description: "Your reply has been saved" });
      setReplyModalOpen(false);
      setReplyingTo(null);
      setReplyText("");
      fetchData();
    }
    setSendingReply(false);
  };

  // Testimonial handlers
  const openTestimonialModal = (testimonial?: Testimonial) => {
    if (testimonial) {
      setEditingTestimonial(testimonial);
      setTestimonialForm({
        name: testimonial.name,
        role: testimonial.role || "",
        content: testimonial.content,
        rating: testimonial.rating || 5,
        image_url: testimonial.image_url || "",
        is_approved: testimonial.is_approved,
      });
    } else {
      setEditingTestimonial(null);
      setTestimonialForm({
        name: "",
        role: "",
        content: "",
        rating: 5,
        image_url: "",
        is_approved: true,
      });
    }
    setShowTestimonialModal(true);
  };

  const handleSaveTestimonial = async () => {
    if (!testimonialForm.name || !testimonialForm.content) {
      toast({ title: "Error", description: "Name and content are required", variant: "destructive" });
      return;
    }

    setSaving(true);
    const testimonialData = {
      name: testimonialForm.name,
      role: testimonialForm.role || null,
      content: testimonialForm.content,
      rating: testimonialForm.rating,
      image_url: testimonialForm.image_url || null,
      is_approved: testimonialForm.is_approved,
    };

    try {
      if (editingTestimonial) {
        const { error } = await supabase
          .from("testimonials")
          .update(testimonialData)
          .eq("id", editingTestimonial.id);
        if (error) throw error;
        toast({ title: "Success", description: "Testimonial updated!" });
      } else {
        const { error } = await supabase.from("testimonials").insert(testimonialData);
        if (error) throw error;
        toast({ title: "Success", description: "Testimonial added!" });
      }
      setShowTestimonialModal(false);
      fetchData();
    } catch (error: unknown) {
      toast({ title: "Error", description: getSafeErrorMessage(error), variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleApproveTestimonial = async (id: string, approve: boolean) => {
    const { error } = await supabase
      .from("testimonials")
      .update({ is_approved: approve })
      .eq("id", id);
    
    if (error) {
      toast({ title: "Error", description: getSafeErrorMessage(error), variant: "destructive" });
    } else {
      toast({ title: approve ? "Approved" : "Unapproved", description: `Testimonial ${approve ? "approved" : "unapproved"}` });
      fetchData();
    }
  };

  const handleDeleteTestimonial = async (id: string) => {
    if (!confirm("Are you sure you want to delete this testimonial?")) return;
    
    const { error } = await supabase.from("testimonials").delete().eq("id", id);
    if (error) {
      toast({ title: "Error", description: getSafeErrorMessage(error), variant: "destructive" });
    } else {
      toast({ title: "Deleted", description: "Testimonial removed" });
      fetchData();
    }
  };

  // Password change handler
  const handleChangePassword = async () => {
    if (!passwordForm.newPassword || !passwordForm.confirmPassword) {
      toast({ title: "Error", description: "Please fill in all password fields", variant: "destructive" });
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast({ title: "Error", description: "New passwords do not match", variant: "destructive" });
      return;
    }

    if (passwordForm.newPassword.length < 8) {
      toast({ title: "Error", description: "Password must be at least 8 characters", variant: "destructive" });
      return;
    }

    setChangingPassword(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: passwordForm.newPassword
      });

      if (error) throw error;

      toast({ title: "Success", description: "Password updated successfully!" });
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (error: unknown) {
      toast({ title: "Error", description: getSafeErrorMessage(error), variant: "destructive" });
    } finally {
      setChangingPassword(false);
    }
  };

  // Save site config handlers
  const handleSaveContacts = async () => {
    setSavingConfig(true);
    try {
      await updateConfig("contacts", contactsForm);
      await updateConfig("address", addressForm);
      toast({ title: "Success", description: "Contact information updated!" });
    } catch (error) {
      toast({ title: "Error", description: getSafeErrorMessage(error), variant: "destructive" });
    } finally {
      setSavingConfig(false);
    }
  };

  const handleSaveSocial = async () => {
    setSavingConfig(true);
    try {
      await updateConfig("social", socialForm);
      toast({ title: "Success", description: "Social links updated!" });
    } catch (error) {
      toast({ title: "Error", description: getSafeErrorMessage(error), variant: "destructive" });
    } finally {
      setSavingConfig(false);
    }
  };

  const handleSaveHeroImages = async () => {
    setSavingConfig(true);
    try {
      await updateConfig("hero_images", heroImages);
      toast({ title: "Success", description: "Hero images updated!" });
    } catch (error) {
      toast({ title: "Error", description: getSafeErrorMessage(error), variant: "destructive" });
    } finally {
      setSavingConfig(false);
    }
  };

  const filteredProducts = products.filter((p) => p.category === activeCategory);
  const unreadMessages = contacts.filter(c => !c.is_read).length;
  const pendingBookings = bookings.filter(b => b.status === "pending").length;
  const pendingTestimonials = testimonials.filter(t => !t.is_approved).length;

  const getCategoryIcon = (cat: ProductCategory) => {
    switch (cat) {
      case "car": return <Car size={18} />;
      case "jewellery": return <Gem size={18} />;
      case "wedding": return <Heart size={18} />;
    }
  };

  const getStatusColor = (status: string | null) => {
    switch (status) {
      case "completed": return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";
      case "cancelled": return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
      default: return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400";
    }
  };

  const getWhatsAppLink = (phone: string, countryCode: string | null) => {
    return generateWhatsAppLink(phone, countryCode || "+260");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/30 overflow-x-hidden">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-4">
            <img src={logo} alt="Queenstop" className="h-8" />
            <span className="text-sm text-muted-foreground">Admin Panel</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground hidden md:block">{user?.email}</span>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut size={16} className="mr-2" />
              <span className="hidden sm:inline">Logout</span>
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 max-w-full overflow-x-hidden">
        {/* Tabs */}
        <div className="flex flex-wrap gap-2 mb-6 overflow-x-auto pb-2">
          <Button variant={activeTab === "products" ? "default" : "outline"} onClick={() => setActiveTab("products")} size="sm" className="flex-shrink-0">
            <Package size={16} className="mr-1 sm:mr-2" />
            <span className="hidden sm:inline">Products</span>
          </Button>
          <Button variant={activeTab === "bookings" ? "default" : "outline"} onClick={() => setActiveTab("bookings")} size="sm" className="flex-shrink-0 relative">
            <Calendar size={16} className="mr-1 sm:mr-2" />
            <span className="hidden sm:inline">Bookings</span>
            {pendingBookings > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-primary-foreground text-xs rounded-full flex items-center justify-center">
                {pendingBookings}
              </span>
            )}
          </Button>
          <Button variant={activeTab === "contacts" ? "default" : "outline"} onClick={() => setActiveTab("contacts")} size="sm" className="flex-shrink-0 relative">
            <Mail size={16} className="mr-1 sm:mr-2" />
            <span className="hidden sm:inline">Messages</span>
            {unreadMessages > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-destructive text-destructive-foreground text-xs rounded-full flex items-center justify-center">
                {unreadMessages}
              </span>
            )}
          </Button>
          <Button variant={activeTab === "testimonials" ? "default" : "outline"} onClick={() => setActiveTab("testimonials")} size="sm" className="flex-shrink-0 relative">
            <Star size={16} className="mr-1 sm:mr-2" />
            <span className="hidden sm:inline">Testimonials</span>
            {pendingTestimonials > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-yellow-500 text-white text-xs rounded-full flex items-center justify-center">
                {pendingTestimonials}
              </span>
            )}
          </Button>
          <Button variant={activeTab === "analytics" ? "default" : "outline"} onClick={() => setActiveTab("analytics")} size="sm" className="flex-shrink-0">
            <BarChart3 size={16} className="mr-1 sm:mr-2" />
            <span className="hidden sm:inline">Analytics</span>
          </Button>
          <Button variant={activeTab === "settings" ? "default" : "outline"} onClick={() => setActiveTab("settings")} size="sm" className="flex-shrink-0">
            <Settings size={16} className="mr-1 sm:mr-2" />
            <span className="hidden sm:inline">Settings</span>
          </Button>
        </div>

        {/* Products Tab */}
        {activeTab === "products" && (
          <>
            <div className="flex flex-wrap gap-2 mb-6">
              {(["car", "jewellery", "wedding"] as ProductCategory[]).map((cat) => (
                <Button key={cat} variant={activeCategory === cat ? "default" : "outline"} size="sm" onClick={() => setActiveCategory(cat)}>
                  {getCategoryIcon(cat)}
                  <span className="ml-2 capitalize hidden sm:inline">{cat === "car" ? "Car Hire" : cat}</span>
                </Button>
              ))}
              <Button size="sm" onClick={() => openProductModal()} className="ml-auto">
                <Plus size={18} className="mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Add Product</span>
              </Button>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {filteredProducts.map((product) => (
                <div key={product.id} className="bg-card rounded-xl shadow-card overflow-hidden">
                  <div className="relative">
                    {product.image_url ? (
                      <img src={product.image_url} alt={product.name} className="w-full h-40 sm:h-48 object-cover aspect-square" />
                    ) : (
                      <div className="w-full h-40 sm:h-48 bg-muted flex items-center justify-center">
                        {getCategoryIcon(product.category)}
                      </div>
                    )}
                    {/* Route tags for cars */}
                    {product.category === "car" && product.route_tags && product.route_tags.length > 0 && (
                      <div className="absolute top-2 left-2 flex gap-1">
                        {product.route_tags.includes("local") && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-green-600 text-white">Local</span>
                        )}
                        {product.route_tags.includes("outside") && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-blue-600 text-white">Outside</span>
                        )}
                      </div>
                    )}
                    {/* Multiple images indicator */}
                    {product.images && product.images.length > 0 && (
                      <span className="absolute bottom-2 right-2 text-xs px-2 py-1 rounded bg-background/80 text-foreground">
                        +{product.images.length} photos
                      </span>
                    )}
                  </div>
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-foreground text-sm sm:text-base line-clamp-1">{product.name}</h3>
                      <span className="text-primary font-bold flex-shrink-0">{formatKwacha(product.price)}</span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{product.description}</p>
                    <span className={`text-xs px-2 py-1 rounded-full ${product.is_available ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                      {product.is_available ? "Available" : "Unavailable"}
                    </span>
                    <div className="flex gap-2 mt-4">
                      <Button size="sm" variant="outline" onClick={() => openProductModal(product)} className="flex-1">
                        <Edit2 size={14} className="mr-1" />Edit
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleDeleteProduct(product.id)} className="flex-1">
                        <Trash2 size={14} className="mr-1" />Delete
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
              {filteredProducts.length === 0 && (
                <div className="col-span-full text-center py-12 text-muted-foreground">
                  No products in this category yet.
                </div>
              )}
            </div>
          </>
        )}

        {/* Bookings Tab */}
        {activeTab === "bookings" && (
          <div className="space-y-4">
            {bookings.map((booking) => (
              <div key={booking.id} className="bg-card rounded-xl shadow-card p-4 sm:p-6 overflow-hidden">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
                  <div className="min-w-0">
                    <h3 className="font-semibold text-foreground truncate">{booking.customer_name}</h3>
                    <p className="text-sm text-muted-foreground truncate">{booking.customer_email}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <p className="text-sm text-muted-foreground">{booking.country_code || "+260"} {booking.customer_phone}</p>
                      <a 
                        href={getWhatsAppLink(booking.customer_phone, booking.country_code)} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-green-600 hover:text-green-700"
                      >
                        <ExternalLink size={14} />
                      </a>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 flex-shrink-0">
                    <span className={`text-xs px-3 py-1 rounded-full capitalize ${getStatusColor(booking.status)}`}>
                      {booking.status || "pending"}
                    </span>
                    {booking.route_type && (
                      <span className={`text-xs px-3 py-1 rounded-full ${booking.route_type === "local" ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700"}`}>
                        {booking.route_type === "local" ? "Local" : "Outside Lusaka"}
                      </span>
                    )}
                    <span className="text-xs text-muted-foreground">
                      {new Date(booking.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                
                {(booking.pickup_date || booking.booking_time) && (
                  <div className="text-sm text-muted-foreground mb-4 bg-muted/50 p-3 rounded-lg">
                    {booking.pickup_date && <p>📅 Date: {booking.pickup_date}</p>}
                    {booking.booking_time && <p>🕐 Time: {booking.booking_time}</p>}
                  </div>
                )}
                
                {booking.notes && (
                  <p className="text-sm text-muted-foreground mb-4 bg-muted/50 p-3 rounded-lg break-words">{booking.notes}</p>
                )}

                <div className="flex flex-wrap gap-2">
                  <Button size="sm" variant={booking.status === "pending" ? "default" : "outline"} onClick={() => handleUpdateBookingStatus(booking.id, "pending")}>
                    <Clock size={14} className="mr-1" />Pending
                  </Button>
                  <Button size="sm" variant={booking.status === "completed" ? "default" : "outline"} onClick={() => handleUpdateBookingStatus(booking.id, "completed")}>
                    <Check size={14} className="mr-1" />Completed
                  </Button>
                  <Button size="sm" variant={booking.status === "cancelled" ? "default" : "outline"} onClick={() => handleUpdateBookingStatus(booking.id, "cancelled")}>
                    <XCircle size={14} className="mr-1" />Cancelled
                  </Button>
                  <a 
                    href={getWhatsAppLink(booking.customer_phone, booking.country_code)} 
                    target="_blank" 
                    rel="noopener noreferrer"
                  >
                    <Button size="sm" variant="outline" className="bg-green-50 text-green-700 border-green-200 hover:bg-green-100">
                      <MessageSquare size={14} className="mr-1" />WhatsApp
                    </Button>
                  </a>
                  <Button size="sm" variant="outline" onClick={() => handleDeleteBooking(booking.id)} className="ml-auto text-destructive hover:bg-destructive hover:text-destructive-foreground">
                    <Trash2 size={14} className="mr-1" />Delete
                  </Button>
                </div>
              </div>
            ))}
            {bookings.length === 0 && (
              <div className="text-center py-12 text-muted-foreground bg-card rounded-xl">
                No bookings yet
              </div>
            )}
          </div>
        )}

        {/* Contacts Tab */}
        {activeTab === "contacts" && (
          <div className="space-y-4">
            {contacts.map((contact) => (
              <div key={contact.id} className={`bg-card rounded-xl shadow-card p-4 sm:p-6 overflow-hidden ${!contact.is_read ? "border-l-4 border-primary" : ""}`}>
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-foreground">{contact.name}</h3>
                      {!contact.is_read && (
                        <span className="text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded-full">New</span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground truncate">{contact.email} • {contact.phone}</p>
                  </div>
                  <span className="text-xs text-muted-foreground flex-shrink-0">
                    {new Date(contact.created_at).toLocaleDateString()}
                  </span>
                </div>
                
                {contact.subject && (
                  <p className="text-sm font-medium text-foreground mb-2 break-words">{contact.subject}</p>
                )}
                <p className="text-muted-foreground mb-4 break-words">{contact.message}</p>
                
                {contact.admin_reply && (
                  <div className="bg-muted/50 p-3 rounded-lg mb-4">
                    <p className="text-xs text-muted-foreground mb-1">Your reply ({contact.replied_at ? new Date(contact.replied_at).toLocaleDateString() : ""}):</p>
                    <p className="text-sm text-foreground break-words">{contact.admin_reply}</p>
                  </div>
                )}

                <div className="flex flex-wrap gap-2">
                  <Button size="sm" variant="outline" onClick={() => handleToggleMessageRead(contact.id, contact.is_read)}>
                    {contact.is_read ? <EyeOff size={14} className="mr-1" /> : <Eye size={14} className="mr-1" />}
                    {contact.is_read ? "Mark Unread" : "Mark Read"}
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => openReplyModal(contact)}>
                    <MessageSquare size={14} className="mr-1" />
                    {contact.admin_reply ? "Edit Reply" : "Reply"}
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleDeleteMessage(contact.id)} className="ml-auto text-destructive hover:bg-destructive hover:text-destructive-foreground">
                    <Trash2 size={14} className="mr-1" />Delete
                  </Button>
                </div>
              </div>
            ))}
            {contacts.length === 0 && (
              <div className="text-center py-12 text-muted-foreground bg-card rounded-xl">
                No messages yet
              </div>
            )}
          </div>
        )}

        {/* Testimonials Tab */}
        {activeTab === "testimonials" && (
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2 mb-4">
              <Button variant="outline" size="sm" className={pendingTestimonials > 0 ? "border-yellow-500 text-yellow-600" : ""}>
                Pending: {pendingTestimonials}
              </Button>
              <Button variant="outline" size="sm">
                Approved: {testimonials.filter(t => t.is_approved).length}
              </Button>
              <Button size="sm" onClick={() => openTestimonialModal()} className="ml-auto">
                <Plus size={18} className="mr-1 sm:mr-2" />
                <span className="hidden sm:inline">Add Testimonial</span>
              </Button>
            </div>
            
            {testimonials.map((testimonial) => (
              <div key={testimonial.id} className={`bg-card rounded-xl shadow-card p-4 sm:p-6 overflow-hidden ${!testimonial.is_approved ? "border-l-4 border-yellow-500" : "border-l-4 border-green-500"}`}>
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-4">
                  <div className="flex items-start gap-3 min-w-0">
                    {testimonial.image_url && (
                      <img src={testimonial.image_url} alt={testimonial.name} className="w-12 h-12 rounded-full object-cover flex-shrink-0" />
                    )}
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-foreground">{testimonial.name}</h3>
                        {testimonial.is_approved ? (
                          <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Approved</span>
                        ) : (
                          <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full">Pending</span>
                        )}
                      </div>
                      {testimonial.role && <p className="text-sm text-primary">{testimonial.role}</p>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <div className="flex">
                      {[...Array(testimonial.rating || 5)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-primary text-primary" />
                      ))}
                    </div>
                  </div>
                </div>
                
                <p className="text-muted-foreground mb-4 break-words">"{testimonial.content}"</p>

                <div className="flex flex-wrap gap-2">
                  <Button size="sm" variant="outline" onClick={() => openTestimonialModal(testimonial)}>
                    <Edit2 size={14} className="mr-1" />Edit
                  </Button>
                  {testimonial.is_approved ? (
                    <Button size="sm" variant="outline" onClick={() => handleApproveTestimonial(testimonial.id, false)}>
                      <XCircle size={14} className="mr-1" />Unapprove
                    </Button>
                  ) : (
                    <Button size="sm" variant="default" onClick={() => handleApproveTestimonial(testimonial.id, true)}>
                      <Check size={14} className="mr-1" />Approve
                    </Button>
                  )}
                  <Button size="sm" variant="outline" onClick={() => handleDeleteTestimonial(testimonial.id)} className="ml-auto text-destructive hover:bg-destructive hover:text-destructive-foreground">
                    <Trash2 size={14} className="mr-1" />Delete
                  </Button>
                </div>
              </div>
            ))}
            {testimonials.length === 0 && (
              <div className="text-center py-12 text-muted-foreground bg-card rounded-xl">
                No testimonials submitted yet
              </div>
            )}
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === "analytics" && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="bg-card rounded-xl shadow-card p-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Package className="text-primary" size={20} />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Products</p>
                  <p className="text-2xl font-bold text-foreground">{products.length}</p>
                </div>
              </div>
            </div>
            <div className="bg-card rounded-xl shadow-card p-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Calendar className="text-primary" size={20} />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Bookings</p>
                  <p className="text-2xl font-bold text-foreground">{bookings.length}</p>
                </div>
              </div>
            </div>
            <div className="bg-card rounded-xl shadow-card p-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-yellow-500/10 flex items-center justify-center">
                  <Clock className="text-yellow-500" size={20} />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Pending Bookings</p>
                  <p className="text-2xl font-bold text-foreground">{pendingBookings}</p>
                </div>
              </div>
            </div>
            <div className="bg-card rounded-xl shadow-card p-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-destructive/10 flex items-center justify-center">
                  <Mail className="text-destructive" size={20} />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Unread Messages</p>
                  <p className="text-2xl font-bold text-foreground">{unreadMessages}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === "settings" && (
          <div className="max-w-4xl">
            {/* Settings sub-tabs */}
            <div className="flex flex-wrap gap-2 mb-6">
              <Button variant={settingsTab === "account" ? "default" : "outline"} size="sm" onClick={() => setSettingsTab("account")}>
                <Key size={16} className="mr-2" />Account
              </Button>
              <Button variant={settingsTab === "contacts" ? "default" : "outline"} size="sm" onClick={() => setSettingsTab("contacts")}>
                <Phone size={16} className="mr-2" />Contacts
              </Button>
              <Button variant={settingsTab === "social" ? "default" : "outline"} size="sm" onClick={() => setSettingsTab("social")}>
                <Globe size={16} className="mr-2" />Social Links
              </Button>
              <Button variant={settingsTab === "hero" ? "default" : "outline"} size="sm" onClick={() => setSettingsTab("hero")}>
                <ImageIcon size={16} className="mr-2" />Hero Images
              </Button>
            </div>

            {/* Account Settings */}
            {settingsTab === "account" && (
              <div className="space-y-6">
                <div className="bg-card rounded-xl shadow-card p-6">
                  <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                    <Settings size={20} />Account Information
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm text-muted-foreground">Email</label>
                      <p className="text-foreground font-medium">{user?.email}</p>
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground">Last Sign In</label>
                      <p className="text-foreground">{user?.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleString() : 'N/A'}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-card rounded-xl shadow-card p-6">
                  <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                    <Key size={20} />Change Password
                  </h3>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">New Password</label>
                      <Input
                        type="password"
                        value={passwordForm.newPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                        placeholder="Enter new password (min 8 characters)"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">Confirm New Password</label>
                      <Input
                        type="password"
                        value={passwordForm.confirmPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                        placeholder="Confirm new password"
                      />
                    </div>
                    <Button onClick={handleChangePassword} disabled={changingPassword}>
                      {changingPassword && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Update Password
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Contacts Settings */}
            {settingsTab === "contacts" && (
              <div className="space-y-6">
                <div className="bg-card rounded-xl shadow-card p-6">
                  <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                    <Phone size={20} />Contact Numbers
                  </h3>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">Primary Phone</label>
                      <Input
                        value={contactsForm.phone}
                        onChange={(e) => setContactsForm({ ...contactsForm, phone: e.target.value })}
                        placeholder="+260 97 6700776"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">Secondary Phone</label>
                      <Input
                        value={contactsForm.phoneSecondary}
                        onChange={(e) => setContactsForm({ ...contactsForm, phoneSecondary: e.target.value })}
                        placeholder="+260 974366406"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">Email</label>
                      <Input
                        type="email"
                        value={contactsForm.email}
                        onChange={(e) => setContactsForm({ ...contactsForm, email: e.target.value })}
                        placeholder="queenstopdrive@gmail.com"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">WhatsApp Number (raw)</label>
                      <Input
                        value={contactsForm.whatsappRaw}
                        onChange={(e) => setContactsForm({ ...contactsForm, whatsappRaw: e.target.value })}
                        placeholder="260976700776"
                      />
                    </div>
                  </div>
                </div>

                <div className="bg-card rounded-xl shadow-card p-6">
                  <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                    <MapPin size={20} />Address
                  </h3>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2 sm:col-span-2">
                      <label className="text-sm font-medium text-foreground">Street Address</label>
                      <Input
                        value={addressForm.street}
                        onChange={(e) => setAddressForm({ ...addressForm, street: e.target.value })}
                        placeholder="A/35/2, Makeni Bonaventure, plot 50a"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">City</label>
                      <Input
                        value={addressForm.city}
                        onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                        placeholder="Lusaka"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">Postal Code</label>
                      <Input
                        value={addressForm.zip}
                        onChange={(e) => setAddressForm({ ...addressForm, zip: e.target.value })}
                        placeholder="10101"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">Country</label>
                      <Input
                        value={addressForm.country}
                        onChange={(e) => setAddressForm({ ...addressForm, country: e.target.value })}
                        placeholder="Zambia"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">Map URL</label>
                      <Input
                        value={addressForm.mapUrl}
                        onChange={(e) => setAddressForm({ ...addressForm, mapUrl: e.target.value })}
                        placeholder="https://maps.google.com/..."
                      />
                    </div>
                  </div>
                </div>

                <Button onClick={handleSaveContacts} disabled={savingConfig}>
                  {savingConfig && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  <Save size={16} className="mr-2" />Save Contact Info
                </Button>
              </div>
            )}

            {/* Social Settings */}
            {settingsTab === "social" && (
              <div className="space-y-6">
                <div className="bg-card rounded-xl shadow-card p-6">
                  <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                    <Globe size={20} />Social Media Links
                  </h3>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">Facebook</label>
                      <Input
                        value={socialForm.facebook}
                        onChange={(e) => setSocialForm({ ...socialForm, facebook: e.target.value })}
                        placeholder="https://facebook.com/queenstop"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">Instagram</label>
                      <Input
                        value={socialForm.instagram}
                        onChange={(e) => setSocialForm({ ...socialForm, instagram: e.target.value })}
                        placeholder="https://instagram.com/queenstop"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">Twitter/X</label>
                      <Input
                        value={socialForm.twitter}
                        onChange={(e) => setSocialForm({ ...socialForm, twitter: e.target.value })}
                        placeholder="https://twitter.com/queenstop"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">YouTube</label>
                      <Input
                        value={socialForm.youtube}
                        onChange={(e) => setSocialForm({ ...socialForm, youtube: e.target.value })}
                        placeholder="https://youtube.com/queenstop"
                      />
                    </div>
                  </div>
                </div>

                <Button onClick={handleSaveSocial} disabled={savingConfig}>
                  {savingConfig && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  <Save size={16} className="mr-2" />Save Social Links
                </Button>
              </div>
            )}

            {/* Hero Images Settings */}
            {settingsTab === "hero" && (
              <div className="space-y-6">
                <div className="bg-card rounded-xl shadow-card p-6">
                  <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                    <ImageIcon size={20} />Hero Carousel Images
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Add custom hero images for the homepage carousel. Leave empty to use default images.
                  </p>
                  
                  <div className="space-y-4">
                    {heroImages.map((image, idx) => (
                      <div key={idx} className="border border-border rounded-lg p-4">
                        <div className="flex gap-4 mb-4">
                          {image.url && (
                            <img src={image.url} alt={image.alt} className="w-24 h-24 object-cover rounded-lg" />
                          )}
                          <div className="flex-1 space-y-2">
                            <Input
                              value={image.url}
                              onChange={(e) => {
                                const newImages = [...heroImages];
                                newImages[idx].url = e.target.value;
                                setHeroImages(newImages);
                              }}
                              placeholder="Image URL"
                            />
                            <Input
                              value={image.alt}
                              onChange={(e) => {
                                const newImages = [...heroImages];
                                newImages[idx].alt = e.target.value;
                                setHeroImages(newImages);
                              }}
                              placeholder="Alt text"
                            />
                          </div>
                          <Button variant="outline" size="sm" onClick={() => setHeroImages(heroImages.filter((_, i) => i !== idx))}>
                            <Trash2 size={16} />
                          </Button>
                        </div>
                        <div className="grid sm:grid-cols-3 gap-2">
                          <Input
                            value={image.headline}
                            onChange={(e) => {
                              const newImages = [...heroImages];
                              newImages[idx].headline = e.target.value;
                              setHeroImages(newImages);
                            }}
                            placeholder="Headline (e.g., 'Enjoy Your')"
                          />
                          <Input
                            value={image.highlightText}
                            onChange={(e) => {
                              const newImages = [...heroImages];
                              newImages[idx].highlightText = e.target.value;
                              setHeroImages(newImages);
                            }}
                            placeholder="Highlight Text"
                          />
                          <Input
                            value={image.subtitle}
                            onChange={(e) => {
                              const newImages = [...heroImages];
                              newImages[idx].subtitle = e.target.value;
                              setHeroImages(newImages);
                            }}
                            placeholder="Subtitle"
                          />
                        </div>
                      </div>
                    ))}
                    
                    <Button 
                      variant="outline" 
                      onClick={() => setHeroImages([...heroImages, { url: "", alt: "", headline: "", highlightText: "", subtitle: "" }])}
                    >
                      <Plus size={16} className="mr-2" />Add Hero Image
                    </Button>
                  </div>
                </div>

                <Button onClick={handleSaveHeroImages} disabled={savingConfig}>
                  {savingConfig && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  <Save size={16} className="mr-2" />Save Hero Images
                </Button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Product Modal */}
      {showProductModal && (
        <div className="fixed inset-0 bg-charcoal/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-card rounded-2xl shadow-elevated w-full max-w-lg max-h-[90vh] overflow-y-auto my-4">
            <div className="p-4 sm:p-6 border-b border-border flex items-center justify-between sticky top-0 bg-card z-10">
              <h2 className="text-lg sm:text-xl font-display font-bold text-foreground">
                {editingProduct ? "Edit Product" : "Add New Product"}
              </h2>
              <button onClick={() => setShowProductModal(false)} className="text-muted-foreground hover:text-foreground">
                <X size={24} />
              </button>
            </div>
            <div className="p-4 sm:p-6 space-y-4">
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
                  className="w-full p-3 border border-border rounded-lg bg-background text-foreground focus:border-primary outline-none resize-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Price (K) *</label>
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
              
              {/* Route Tags (for cars) */}
              {productForm.category === "car" && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Available Routes</label>
                  <div className="flex gap-3">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={productForm.route_tags.includes("local")}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setProductForm({ ...productForm, route_tags: [...productForm.route_tags, "local"] });
                          } else {
                            setProductForm({ ...productForm, route_tags: productForm.route_tags.filter(t => t !== "local") });
                          }
                        }}
                        className="rounded"
                      />
                      <span className="text-sm">Local Routes</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={productForm.route_tags.includes("outside")}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setProductForm({ ...productForm, route_tags: [...productForm.route_tags, "outside"] });
                          } else {
                            setProductForm({ ...productForm, route_tags: productForm.route_tags.filter(t => t !== "outside") });
                          }
                        }}
                        className="rounded"
                      />
                      <span className="text-sm">Outside Lusaka</span>
                    </label>
                  </div>
                </div>
              )}

              {/* Main Image */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Main Image (1:1 ratio)</label>
                <input type="file" ref={fileInputRef} onChange={(e) => handleImageUpload(e, true)} accept="image/*" className="hidden" />
                <div className="flex flex-col gap-3">
                  {imagePreview ? (
                    <div className="relative w-full aspect-square max-w-[200px] rounded-lg overflow-hidden bg-muted">
                      <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => { setImagePreview(null); setProductForm({ ...productForm, image_url: "" }); }}
                        className="absolute top-2 right-2 p-1 bg-destructive text-destructive-foreground rounded-full hover:bg-destructive/90"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ) : (
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full aspect-square max-w-[200px] border-2 border-dashed border-border rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-primary/50 transition-colors"
                    >
                      {uploadingImage ? (
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                      ) : (
                        <>
                          <ImageIcon size={32} className="text-muted-foreground mb-2" />
                          <span className="text-sm text-muted-foreground">Click to upload</span>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Additional Images */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Additional Images</label>
                <input type="file" ref={multiImageInputRef} onChange={(e) => handleImageUpload(e, false)} accept="image/*" className="hidden" />
                <div className="flex flex-wrap gap-2">
                  {productForm.images.map((img, idx) => (
                    <div key={idx} className="relative w-20 h-20 rounded-lg overflow-hidden">
                      <img src={img} alt={`Additional ${idx + 1}`} className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removeAdditionalImage(idx)}
                        className="absolute top-1 right-1 p-0.5 bg-destructive text-destructive-foreground rounded-full"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => multiImageInputRef.current?.click()}
                    className="w-20 h-20 border-2 border-dashed border-border rounded-lg flex items-center justify-center hover:border-primary/50"
                  >
                    <Plus size={24} className="text-muted-foreground" />
                  </button>
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
                <label htmlFor="available" className="text-sm text-foreground">Available</label>
              </div>
            </div>
            <div className="p-4 sm:p-6 border-t border-border flex gap-3 sticky bottom-0 bg-card">
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

      {/* Testimonial Modal */}
      {showTestimonialModal && (
        <div className="fixed inset-0 bg-charcoal/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-card rounded-2xl shadow-elevated w-full max-w-lg max-h-[90vh] overflow-y-auto my-4">
            <div className="p-4 sm:p-6 border-b border-border flex items-center justify-between sticky top-0 bg-card z-10">
              <h2 className="text-lg sm:text-xl font-display font-bold text-foreground">
                {editingTestimonial ? "Edit Testimonial" : "Add New Testimonial"}
              </h2>
              <button onClick={() => setShowTestimonialModal(false)} className="text-muted-foreground hover:text-foreground">
                <X size={24} />
              </button>
            </div>
            <div className="p-4 sm:p-6 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Customer Name *</label>
                <Input
                  value={testimonialForm.name}
                  onChange={(e) => setTestimonialForm({ ...testimonialForm, name: e.target.value })}
                  placeholder="e.g., John Smith"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Role/Title</label>
                <Input
                  value={testimonialForm.role}
                  onChange={(e) => setTestimonialForm({ ...testimonialForm, role: e.target.value })}
                  placeholder="e.g., Business Owner"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Testimonial Content *</label>
                <textarea
                  value={testimonialForm.content}
                  onChange={(e) => setTestimonialForm({ ...testimonialForm, content: e.target.value })}
                  placeholder="What did they say?"
                  rows={4}
                  className="w-full p-3 border border-border rounded-lg bg-background text-foreground focus:border-primary outline-none resize-none"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Rating</label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button key={star} type="button" onClick={() => setTestimonialForm({ ...testimonialForm, rating: star })} className="p-1">
                      <Star className={`w-6 h-6 ${star <= testimonialForm.rating ? "fill-primary text-primary" : "text-muted-foreground"}`} />
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Image URL (optional)</label>
                <Input
                  value={testimonialForm.image_url}
                  onChange={(e) => setTestimonialForm({ ...testimonialForm, image_url: e.target.value })}
                  placeholder="https://example.com/photo.jpg"
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="approved"
                  checked={testimonialForm.is_approved}
                  onChange={(e) => setTestimonialForm({ ...testimonialForm, is_approved: e.target.checked })}
                  className="rounded"
                />
                <label htmlFor="approved" className="text-sm text-foreground">Publish immediately</label>
              </div>
            </div>
            <div className="p-4 sm:p-6 border-t border-border flex gap-3 sticky bottom-0 bg-card">
              <Button variant="outline" onClick={() => setShowTestimonialModal(false)} className="flex-1">
                Cancel
              </Button>
              <Button onClick={handleSaveTestimonial} disabled={saving} className="flex-1">
                {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                <Save size={16} className="mr-2" />
                {editingTestimonial ? "Update" : "Create"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Reply Modal */}
      {replyModalOpen && replyingTo && (
        <div className="fixed inset-0 bg-charcoal/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-card rounded-2xl shadow-elevated w-full max-w-lg my-4">
            <div className="p-4 sm:p-6 border-b border-border flex items-center justify-between">
              <h2 className="text-lg sm:text-xl font-display font-bold text-foreground">Reply to {replyingTo.name}</h2>
              <button onClick={() => setReplyModalOpen(false)} className="text-muted-foreground hover:text-foreground">
                <X size={24} />
              </button>
            </div>
            <div className="p-4 sm:p-6">
              <div className="bg-muted/50 p-3 rounded-lg mb-4">
                <p className="text-sm text-muted-foreground mb-1">Original message:</p>
                <p className="text-foreground">{replyingTo.message}</p>
              </div>
              <textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Type your reply..."
                rows={4}
                className="w-full p-3 border border-border rounded-lg bg-background text-foreground focus:border-primary outline-none resize-none"
              />
            </div>
            <div className="p-4 sm:p-6 border-t border-border flex gap-3">
              <Button variant="outline" onClick={() => setReplyModalOpen(false)} className="flex-1">Cancel</Button>
              <Button onClick={handleSendReply} disabled={sendingReply} className="flex-1">
                {sendingReply && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                <Save size={16} className="mr-2" />Save Reply
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Admin;
