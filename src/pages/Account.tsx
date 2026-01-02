import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Loader2, User, Calendar, LogOut, Save } from "lucide-react";
import { getSafeErrorMessage } from "@/lib/error-handler";
import type { User as SupabaseUser, Session } from "@supabase/supabase-js";

interface ClientProfile {
  id: string;
  user_id: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  default_pickup_location: string | null;
  default_dropoff_location: string | null;
}

interface Booking {
  id: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  pickup_location: string | null;
  dropoff_location: string | null;
  notes: string | null;
  status: string;
  created_at: string;
  product_id: string | null;
}

const Account = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<"profile" | "bookings">("profile");
  const [profile, setProfile] = useState<ClientProfile | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    defaultPickupLocation: "",
    defaultDropoffLocation: "",
  });

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (!session) {
        navigate("/login");
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (!session) {
        navigate("/login");
      } else {
        fetchData(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const fetchData = async (userId: string) => {
    setLoading(true);
    try {
      // Fetch profile
      const { data: profileData, error: profileError } = await supabase
        .from("client_profiles")
        .select("*")
        .eq("user_id", userId)
        .single();

      if (profileError && profileError.code !== "PGRST116") {
        console.error("Profile fetch error:", profileError);
      }

      if (profileData) {
        setProfile(profileData);
        setFormData({
          fullName: profileData.full_name || "",
          phone: profileData.phone || "",
          defaultPickupLocation: profileData.default_pickup_location || "",
          defaultDropoffLocation: profileData.default_dropoff_location || "",
        });
      }

      // Fetch bookings
      const { data: bookingsData, error: bookingsError } = await supabase
        .from("bookings")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (bookingsError) {
        console.error("Bookings fetch error:", bookingsError);
      }

      setBookings(bookingsData || []);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!user) return;
    setSaving(true);

    try {
      const { error } = await supabase
        .from("client_profiles")
        .upsert({
          user_id: user.id,
          full_name: formData.fullName.trim() || null,
          phone: formData.phone.trim() || null,
          default_pickup_location: formData.defaultPickupLocation.trim() || null,
          default_dropoff_location: formData.defaultDropoffLocation.trim() || null,
          email: user.email,
        });

      if (error) throw error;

      toast({
        title: "Profile Updated",
        description: "Your profile has been saved successfully.",
      });
    } catch (error: unknown) {
      toast({
        title: "Error",
        description: getSafeErrorMessage(error),
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      case "completed":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-3xl font-display font-bold text-foreground">
                  My Account
                </h1>
                <p className="text-muted-foreground mt-1">
                  Manage your profile and view your bookings
                </p>
              </div>
              <Button variant="outline" onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </Button>
            </div>

            {/* Tabs */}
            <div className="flex gap-4 mb-8 border-b border-border">
              <button
                onClick={() => setActiveTab("profile")}
                className={`pb-3 px-1 font-medium transition-colors ${
                  activeTab === "profile"
                    ? "text-primary border-b-2 border-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <User className="inline-block mr-2 h-4 w-4" />
                Profile
              </button>
              <button
                onClick={() => setActiveTab("bookings")}
                className={`pb-3 px-1 font-medium transition-colors ${
                  activeTab === "bookings"
                    ? "text-primary border-b-2 border-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Calendar className="inline-block mr-2 h-4 w-4" />
                My Bookings
                {bookings.length > 0 && (
                  <span className="ml-2 bg-primary/10 text-primary text-xs px-2 py-0.5 rounded-full">
                    {bookings.length}
                  </span>
                )}
              </button>
            </div>

            {/* Profile Tab */}
            {activeTab === "profile" && (
              <div className="bg-card rounded-xl p-6 shadow-sm border border-border">
                <h2 className="text-xl font-semibold mb-6">Profile Information</h2>
                <div className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">Full Name</label>
                      <Input
                        placeholder="Your full name"
                        value={formData.fullName}
                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">Email</label>
                      <Input
                        value={user?.email || ""}
                        disabled
                        className="bg-muted"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Phone Number</label>
                    <Input
                      type="tel"
                      placeholder="Your phone number"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">Default Pickup Location</label>
                      <Input
                        placeholder="Save your default pickup location"
                        value={formData.defaultPickupLocation}
                        onChange={(e) => setFormData({ ...formData, defaultPickupLocation: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">Default Dropoff Location</label>
                      <Input
                        placeholder="Save your default dropoff location"
                        value={formData.defaultDropoffLocation}
                        onChange={(e) => setFormData({ ...formData, defaultDropoffLocation: e.target.value })}
                      />
                    </div>
                  </div>

                  <Button onClick={handleSaveProfile} disabled={saving} className="mt-4">
                    {saving ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Save className="mr-2 h-4 w-4" />
                    )}
                    Save Changes
                  </Button>
                </div>
              </div>
            )}

            {/* Bookings Tab */}
            {activeTab === "bookings" && (
              <div className="space-y-4">
                {bookings.length === 0 ? (
                  <div className="bg-card rounded-xl p-8 text-center border border-border">
                    <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-foreground mb-2">No Bookings Yet</h3>
                    <p className="text-muted-foreground mb-4">
                      You haven't made any bookings yet. Browse our services to get started.
                    </p>
                    <Button onClick={() => navigate("/")}>
                      Browse Services
                    </Button>
                  </div>
                ) : (
                  bookings.map((booking) => (
                    <div
                      key={booking.id}
                      className="bg-card rounded-xl p-6 border border-border hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${getStatusBadgeClass(
                                booking.status
                              )}`}
                            >
                              {booking.status}
                            </span>
                            <span className="text-sm text-muted-foreground">
                              {new Date(booking.created_at).toLocaleDateString("en-US", {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              })}
                            </span>
                          </div>
                          {booking.notes && (
                            <p className="text-foreground font-medium mb-2">{booking.notes}</p>
                          )}
                          <div className="text-sm text-muted-foreground space-y-1">
                            {booking.pickup_location && (
                              <p>
                                <span className="font-medium">Pickup:</span> {booking.pickup_location}
                              </p>
                            )}
                            {booking.dropoff_location && (
                              <p>
                                <span className="font-medium">Dropoff:</span> {booking.dropoff_location}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Account;
