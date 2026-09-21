"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/entities/user/model/user-context";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { $fetch } from "@/utils/fetch";

export default function ProfilePage() {
  const router = useRouter();
  const { user } = useUser();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setEmail(user.email || "");
    }
  }, [user]);

  if (!user) return null;

  async function handleSave() {
    setLoading(true);
    const res = await $fetch("/api/v1/me", {
      method: "PATCH",
      body: JSON.stringify({ name, email }),
      headers: { "Content-Type": "application/json" },
      isToast: false,
    });

    if (res.response?.status === 401) {
      router.push("/login");
      return;
    }

    if (res.response && res.response.status >= 500) {
      toast.error("Server error. Please try again later.");
      setLoading(false);
      return;
    }

    if (res.response?.ok) {
      toast.success("Profile updated");
      setEditing(false);
    } else {
      toast.error(res.json?.message || "Failed to update profile");
    }
    setLoading(false);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-display-2">Profile</h1>
        {!editing && (
          <Button variant="outlined" onClick={() => setEditing(true)}>
            Edit
          </Button>
        )}
      </div>

      <Card className="p-6 space-y-4">
        {!editing ? (
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Name</p>
            <p className="text-lg">{user.name}</p>
            <p className="text-sm text-muted-foreground">Email</p>
            <p className="text-lg">{user.email}</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="text-sm text-muted-foreground">Name</label>
              <Input value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div>
              <label className="text-sm text-muted-foreground">Email</label>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleSave} disabled={loading}>
                {loading ? "Saving..." : "Save"}
              </Button>
              <Button variant="text" onClick={() => setEditing(false)}>
                Cancel
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
