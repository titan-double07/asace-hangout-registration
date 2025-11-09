import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useState } from "react";
import { Button } from "./ui/button";
import { Field, FieldError, FieldLabel } from "./ui/field";
import { Input } from "./ui/input";
import { API_URL } from "@/lib/supabaseClient";
import { toast } from "sonner";
import { Eye, EyeOff } from "lucide-react";
export default function AdminLogin({ onLogin }: { onLogin: () => void }) {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_URL}/admin/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      if (res.ok) onLogin();
      else toast.error("Invalid admin password");
    } catch {
      setError("Failed to login");
    }
  };

  return (
    <Card className="w-full sm:max-w-sm">
      <CardHeader>
        <CardTitle>Admin Login</CardTitle>
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <Field>
            <FieldLabel>Password</FieldLabel>
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Enter admin password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                // className=""
                className="pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className=" absolute right-1 top-1 rounded-r-none"
                onClick={() => setShowPassword((prev) => !prev)}>
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
            {error && <FieldError errors={[{ message: error }]} />}
          </Field>
          <CardFooter>
            <Button type="submit" className="w-full">
              {" Login"}
            </Button>
          </CardFooter>
        </form>
      </CardContent>
    </Card>
  );
}
