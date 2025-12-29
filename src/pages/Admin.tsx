import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { 
  Plus, LogOut, Car, Gem, Heart, Loader2, Trash2, Edit2, 
  Package, Mail, Calendar, X, Save, Upload, Image as ImageIcon,
  Check, XCircle, Clock, Eye, EyeOff, MessageSquare, BarChart3
} from "lucide-react";
import logo from "@/assets/logo.png";
import type { User } from "@supabase/supabase-js";

type ProductCategory = "car" | "jewellery" | "wedding";
type BookingStatus = "pending" | "completed" | "cancelled";

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
  is_read: boolean;
  admin_reply: string | null;
  replied_at: string | null;
}

const Admin = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"products" | "bookings" | "contacts" | "analytics">("products");
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
  
  // Reply modal state
  const [replyModalOpen, setReplyModalOpen] = useState(false);
  const [replyingTo, setReplyingTo] = useState<ContactSubmission | null>(null);
  const [replyText, setReplyText] = useState("");
  const [sendingReply, setSendingReply] = useState(false);

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

  // Booking status update
  const handleUpdateBookingStatus = async (id: string, status: BookingStatus) => {
    const { error } = await supabase
      .from("bookings")
      .update({ status })
      .eq("id", id);
    
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Updated", description: `Booking marked as ${status}` });
      fetchData();
    }
  };

  // Delete booking
  const handleDeleteBooking = async (id: string) => {
    if (!confirm("Are you sure you want to delete this booking?")) return;
    
    const { error } = await supabase.from("bookings").delete().eq("id", id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Deleted", description: "Booking removed" });
      fetchData();
    }
  };

  // Toggle message read status
  const handleToggleMessageRead = async (id: string, currentStatus: boolean) => {
    const { error } = await supabase
      .from("contact_submissions")
      .update({ is_read: !currentStatus })
      .eq("id", id);
    
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      fetchData();
    }
  };

  // Delete message
  const handleDeleteMessage = async (id: string) => {
    if (!confirm("Are you sure you want to delete this message?")) return;
    
    const { error } = await supabase.from("contact_submissions").delete().eq("id", id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Deleted", description: "Message removed" });
      fetchData();
    }
  };

  // Open reply modal
  const openReplyModal = (contact: ContactSubmission) => {
    setReplyingTo(contact);
    setReplyText(contact.admin_reply || "");
    setReplyModalOpen(true);
  };

  // Send reply
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
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Reply Saved", description: "Your reply has been saved" });
      setReplyModalOpen(false);
      setReplyingTo(null);
      setReplyText("");
      fetchData();
    }
    setSendingReply(false);
  };

  const filteredProducts = products.filter((p) => p.category === activeCategory);
  const unreadMessages = contacts.filter(c => !c.is_read).length;
  const pendingBookings = bookings.filter(b => b.status === "pending").length;

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

      <div className="container mx-auto px-4 py-6">
        {/* Tabs - Mobile Responsive */}
        <div className="flex flex-wrap gap-2 mb-6">
          <Button
            variant={activeTab === "products" ? "default" : "outline"}
            onClick={() => setActiveTab("products")}
            size="sm"
            className="flex-1 sm:flex-none"
          >
            <Package size={16} className="mr-1 sm:mr-2" />
            <span className="hidden sm:inline">Products</span>
          </Button>
          <Button
            variant={activeTab === "bookings" ? "default" : "outline"}
            onClick={() => setActiveTab("bookings")}
            size="sm"
            className="flex-1 sm:flex-none relative"
          >
            <Calendar size={16} className="mr-1 sm:mr-2" />
            <span className="hidden sm:inline">Bookings</span>
            {pendingBookings > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-primary-foreground text-xs rounded-full flex items-center justify-center">
                {pendingBookings}
              </span>
            )}
          </Button>
          <Button
            variant={activeTab === "contacts" ? "default" : "outline"}
            onClick={() => setActiveTab("contacts")}
            size="sm"
            className="flex-1 sm:flex-none relative"
          >
            <Mail size={16} className="mr-1 sm:mr-2" />
            <span className="hidden sm:inline">Messages</span>
            {unreadMessages > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-destructive text-destructive-foreground text-xs rounded-full flex items-center justify-center">
                {unreadMessages}
              </span>
            )}
          </Button>
          <Button
            variant={activeTab === "analytics" ? "default" : "outline"}
            onClick={() => setActiveTab("analytics")}
            size="sm"
            className="flex-1 sm:flex-none"
          >
            <BarChart3 size={16} className="mr-1 sm:mr-2" />
            <span className="hidden sm:inline">Analytics</span>
          </Button>
        </div>

        {/* Products Tab */}
        {activeTab === "products" && (
          <>
            <div className="flex flex-wrap gap-2 mb-6">
              {(["car", "jewellery", "wedding"] as ProductCategory[]).map((cat) => (
                <Button
                  key={cat}
                  variant={activeCategory === cat ? "default" : "outline"}
                  size="sm"
                  onClick={() => setActiveCategory(cat)}
                >
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
                  {product.image_url ? (
                    <img src={product.image_url} alt={product.name} className="w-full h-40 sm:h-48 object-cover" />
                  ) : (
                    <div className="w-full h-40 sm:h-48 bg-muted flex items-center justify-center">
                      {getCategoryIcon(product.category)}
                    </div>
                  )}
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-foreground text-sm sm:text-base">{product.name}</h3>
                      <span className="text-primary font-bold">${product.price}</span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{product.description}</p>
                    <span className={`text-xs px-2 py-1 rounded-full ${product.is_available ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                      {product.is_available ? "Available" : "Unavailable"}
                    </span>
                    <div className="flex gap-2 mt-4">
                      <Button size="sm" variant="outline" onClick={() => openProductModal(product)} className="flex-1">
                        <Edit2 size={14} className="mr-1" />
                        Edit
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleDeleteProduct(product.id)} className="flex-1">
                        <Trash2 size={14} className="mr-1" />
                        Delete
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
              <div key={booking.id} className="bg-card rounded-xl shadow-card p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
                  <div>
                    <h3 className="font-semibold text-foreground">{booking.customer_name}</h3>
                    <p className="text-sm text-muted-foreground">{booking.customer_email}</p>
                    <p className="text-sm text-muted-foreground">{booking.customer_phone}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <span className={`text-xs px-3 py-1 rounded-full capitalize ${getStatusColor(booking.status)}`}>
                      {booking.status || "pending"}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(booking.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                
                {booking.notes && (
                  <p className="text-sm text-muted-foreground mb-4 bg-muted/50 p-3 rounded-lg">{booking.notes}</p>
                )}
                
                {(booking.pickup_location || booking.dropoff_location) && (
                  <div className="text-sm text-muted-foreground mb-4">
                    {booking.pickup_location && <p>📍 Pickup: {booking.pickup_location}</p>}
                    {booking.dropoff_location && <p>📍 Dropoff: {booking.dropoff_location}</p>}
                  </div>
                )}

                <div className="flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    variant={booking.status === "pending" ? "default" : "outline"}
                    onClick={() => handleUpdateBookingStatus(booking.id, "pending")}
                  >
                    <Clock size={14} className="mr-1" />
                    Pending
                  </Button>
                  <Button
                    size="sm"
                    variant={booking.status === "completed" ? "default" : "outline"}
                    onClick={() => handleUpdateBookingStatus(booking.id, "completed")}
                  >
                    <Check size={14} className="mr-1" />
                    Completed
                  </Button>
                  <Button
                    size="sm"
                    variant={booking.status === "cancelled" ? "default" : "outline"}
                    onClick={() => handleUpdateBookingStatus(booking.id, "cancelled")}
                  >
                    <XCircle size={14} className="mr-1" />
                    Cancelled
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDeleteBooking(booking.id)}
                    className="ml-auto text-destructive hover:bg-destructive hover:text-destructive-foreground"
                  >
                    <Trash2 size={14} className="mr-1" />
                    Delete
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
              <div 
                key={contact.id} 
                className={`bg-card rounded-xl shadow-card p-4 sm:p-6 ${!contact.is_read ? "border-l-4 border-primary" : ""}`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-foreground">{contact.name}</h3>
                      {!contact.is_read && (
                        <span className="text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded-full">New</span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{contact.email} • {contact.phone}</p>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {new Date(contact.created_at).toLocaleDateString()}
                  </span>
                </div>
                
                {contact.subject && (
                  <p className="text-sm font-medium text-foreground mb-2">{contact.subject}</p>
                )}
                <p className="text-muted-foreground mb-4">{contact.message}</p>
                
                {contact.admin_reply && (
                  <div className="bg-muted/50 p-3 rounded-lg mb-4">
                    <p className="text-xs text-muted-foreground mb-1">Your reply ({contact.replied_at ? new Date(contact.replied_at).toLocaleDateString() : ""}):</p>
                    <p className="text-sm text-foreground">{contact.admin_reply}</p>
                  </div>
                )}

                <div className="flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleToggleMessageRead(contact.id, contact.is_read)}
                  >
                    {contact.is_read ? <EyeOff size={14} className="mr-1" /> : <Eye size={14} className="mr-1" />}
                    {contact.is_read ? "Mark Unread" : "Mark Read"}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => openReplyModal(contact)}
                  >
                    <MessageSquare size={14} className="mr-1" />
                    {contact.admin_reply ? "Edit Reply" : "Reply"}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDeleteMessage(contact.id)}
                    className="ml-auto text-destructive hover:bg-destructive hover:text-destructive-foreground"
                  >
                    <Trash2 size={14} className="mr-1" />
                    Delete
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

        {/* Analytics Tab */}
        {activeTab === "analytics" && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="bg-card rounded-xl shadow-card p-6">
              <div className="flex items-center gap-3 mb-2">
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
              <div className="flex items-center gap-3 mb-2">
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
              <div className="flex items-center gap-3 mb-2">
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
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-lg bg-destructive/10 flex items-center justify-center">
                  <Mail className="text-destructive" size={20} />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Unread Messages</p>
                  <p className="text-2xl font-bold text-foreground">{unreadMessages}</p>
                </div>
              </div>
            </div>
            
            <div className="col-span-full bg-card rounded-xl shadow-card p-6">
              <h3 className="font-semibold text-foreground mb-4">Recent Activity</h3>
              <div className="space-y-3">
                {[...bookings.slice(0, 3), ...contacts.slice(0, 2)].sort((a, b) => 
                  new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
                ).slice(0, 5).map((item, idx) => (
                  <div key={idx} className="flex items-center gap-3 text-sm">
                    <div className="w-2 h-2 rounded-full bg-primary" />
                    <span className="text-muted-foreground">
                      {'customer_name' in item ? `Booking from ${item.customer_name}` : `Message from ${item.name}`}
                    </span>
                    <span className="text-xs text-muted-foreground ml-auto">
                      {new Date(item.created_at).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
              <p className="text-sm text-muted-foreground mt-4">
                Note: Detailed visitor analytics requires integration with a service like Google Analytics or Plausible.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Product Modal */}
      {showProductModal && (
        <div className="fixed inset-0 bg-charcoal/50 z-50 flex items-center justify-center p-4">
          <div className="bg-card rounded-2xl shadow-elevated w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-4 sm:p-6 border-b border-border flex items-center justify-between">
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
                          <span className="text-sm text-muted-foreground">Click to upload</span>
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
                    {uploadingImage ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Upload size={16} className="mr-2" />}
                    {imagePreview ? "Change" : "Upload"}
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
                <label htmlFor="available" className="text-sm text-foreground">Available</label>
              </div>
            </div>
            <div className="p-4 sm:p-6 border-t border-border flex gap-3">
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

      {/* Reply Modal */}
      {replyModalOpen && replyingTo && (
        <div className="fixed inset-0 bg-charcoal/50 z-50 flex items-center justify-center p-4">
          <div className="bg-card rounded-2xl shadow-elevated w-full max-w-lg">
            <div className="p-4 sm:p-6 border-b border-border flex items-center justify-between">
              <h2 className="text-lg sm:text-xl font-display font-bold text-foreground">
                Reply to {replyingTo.name}
              </h2>
              <button onClick={() => setReplyModalOpen(false)} className="text-muted-foreground hover:text-foreground">
                <X size={24} />
              </button>
            </div>
            <div className="p-4 sm:p-6 space-y-4">
              <div className="bg-muted/50 p-3 rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Original message:</p>
                <p className="text-foreground">{replyingTo.message}</p>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Your Reply</label>
                <textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Type your reply..."
                  rows={4}
                  className="w-full p-3 border border-border rounded-lg bg-background text-foreground focus:border-primary outline-none"
                />
              </div>
            </div>
            <div className="p-4 sm:p-6 border-t border-border flex gap-3">
              <Button variant="outline" onClick={() => setReplyModalOpen(false)} className="flex-1">
                Cancel
              </Button>
              <Button onClick={handleSendReply} disabled={sendingReply || !replyText.trim()} className="flex-1">
                {sendingReply && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Reply
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Admin;