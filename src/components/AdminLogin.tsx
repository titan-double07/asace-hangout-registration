import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle
} from "@/components/ui/card";
import { useState } from "react";
import { Button } from "./ui/button";
import { Field, FieldError, FieldLabel } from "./ui/field";
import { Input } from "./ui/input";
export default function AdminLogin({ onLogin }: { onLogin: () => void }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === import.meta.env.VITE_ADMIN_PASSWORD) {
      onLogin();
    } else {
      setError("Invalid password");
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
            <Input
              type="password"
              placeholder="Enter admin password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className=""
            />
            {error && <FieldError errors={[{ message: error }]} />}
          </Field>
          <CardFooter>
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Submitting..." : " Login"}
            </Button>
          </CardFooter>
        </form>
      </CardContent>
    </Card>
  );
}
