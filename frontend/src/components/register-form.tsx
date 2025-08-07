"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { setCookie } from "cookies-next";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "./ui/shadcn-io/spinner";
import { toast } from "sonner";

export function RegisterForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [avatar, setAvatar] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [isRegisterPressed, setIsRegisterPressed] = useState(false);
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsRegisterPressed(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("email", email);
      formData.append("password", password);
      formData.append("firstName", firstName);
      formData.append("lastName", lastName);

      if (avatar) {
        formData.append("file", avatar);
      }

      const res = await fetch("http://localhost:3005/auth/register", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!data.data) {
        setError(data.message || "Registration failed");
        setIsRegisterPressed(false);
        return;
      }

      setCookie("token", data.data.accessToken, {
        maxAge: 60 * 60 * 24 * 7,
        path: "/",
      });
      toast("User Registered Successfuly");
      setIsRegisterPressed(false);
      router.push("/dashboard");
    } catch (err) {
      setIsRegisterPressed(false);
      console.error(err);
      setError("Something went wrong");
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle>Create your account</CardTitle>
          <CardDescription>
            Enter your information and upload a profile picture to register.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleRegister}>
            <div className="flex flex-col gap-6">
              <div className="grid gap-3">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="grid gap-3">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <div className="grid gap-3">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  type="text"
                  placeholder="First Name"
                  onChange={(e) => setFirstName(e.target.value)}
                  required
                />
              </div>
              <div className="grid gap-3">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  type="text"
                  placeholder="Last Name"
                  onChange={(e) => setLastName(e.target.value)}
                  required
                />
              </div>
              <div className="grid gap-3">
                <Label htmlFor="avatar">Profile Image</Label>
                <Input
                  id="avatar"
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setAvatar(e.target.files[0]);
                    }
                  }}
                />
              </div>
              <div className="flex flex-col gap-3">
                {isRegisterPressed ? (
                  <div className="mx-auto">
                    <Spinner />
                  </div>
                ) : (
                  <Button type="submit" className="w-full">
                    Register
                  </Button>
                )}
              </div>
              {error && <p className="text-red-500 text-sm">{error}</p>}
            </div>
            <div className="mt-4 text-center text-sm">
              Already have an account?{" "}
              <a href="/" className="underline underline-offset-4">
                Sign in
              </a>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
