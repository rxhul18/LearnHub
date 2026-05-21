"use client";

import Link from "next/link"
import { Eye, GraduationCap, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState } from "react"
import { toast } from "sonner"
import axios from "axios";
import Footer from "@/components/footer";
import Logo from "@/components/logo";
import { useAuth } from "@/lib/authContext";
import { getCurrentUser } from "@/lib/auth";
import { useRouter } from "next/navigation";

export default function LoginPage() {

    const { user, loading, setUser } = useAuth();
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loginAsAdmin, setLoginAsAdmin] = useState(false);

    if (!loading && user) {
        router.replace("/dashboard");
        return null;
    }

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Loader2 className="mr-2 size-6 animate-spin" />
                <p className="text-lg font-semibold">Loading...</p>
            </div>
        )
    }
    async function handleLogin() {
        if (email === "" || password === "") {
            toast.error("Please fill in all fields")
            return
        }

        const role = loginAsAdmin ? "admin" : "user"

        if (role === "user") {
            toast.loading("Loginng in as user", {
                id: "login"
            })
            try {
                const response = await axios.post(
                    `${process.env.NEXT_PUBLIC_API_URL}/api/v1/user/signin`,
                    { email, password },
                    { withCredentials: true }
                );

                if (response.status === 200) {
                    toast.success("Login successful", {
                        description: `Welcome back, ${email}!`,
                        id: "login",
                    });
                    const data = await getCurrentUser();
                    if (data?.user) {
                        setUser({ ...data.user, role: data.role });
                        router.push("/dashboard");
                    }
                }
            } catch (error) {
                toast.error("Login failed", {
                    id: "login"
                });
                throw error;
            }
        } else {
            toast.loading("Loginng in as admin", {
                id: "adminlogin"
            })
            try {
                const res = await axios.post(process.env.NEXT_PUBLIC_API_URL + "/api/v1/admin/signin", {
                    email,
                    password,
                }, { withCredentials: true })
                if (res.status === 200) {
                    toast.success("Admin login successful", {
                        description: `Welcome back, ${email}!`,
                        id: "adminlogin"
                    });
                    const data = await getCurrentUser();
                    if (data?.user) {
                        setUser({ ...data.user, role: data.role });
                        router.push("/dashboard");
                    }
                }
            } catch (error) {
                toast.error("Adminlogin failed", {
                    id: "adminlogin"
                })
                throw error;
            }
        }
    }

    return (
        <div className="flex min-h-dvh flex-col">
            <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 flex justify-center">
                <div className="container flex h-16 items-center justify-between">
                    <Link href="/" className="flex items-center gap-2">
                        <GraduationCap className="size-9" />
                        <Logo />
                    </Link>
                </div>
            </header>
            <main className="flex-1 flex items-center justify-center p-6">
                <Card className="mx-auto max-w-sm w-full">
                    <CardHeader className="space-y-1">
                        <CardTitle className="text-2xl font-bold">Login</CardTitle>
                        <CardDescription>Enter your credentials to access your account</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input id="email" type="email" placeholder="example@example.com" required onChange={(e) => (setEmail(e.target.value))} />
                            </div>
                            <div className="relative space-y-2">
                                <div className="flex items-center">
                                    <Label htmlFor="password">Password</Label>
                                </div>
                                <Input id="password" type="password" required onChange={(e) => (setPassword(e.target.value))} placeholder="Example@1234"/>
                                <Button variant="ghost" size="icon" className="absolute bottom-1 right-1 h-7 w-7">
                                    <Eye className="size-4" />
                                    <span className="sr-only">Toggle password visibility</span>
                                </Button>
                            </div>
                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="login-as-admin"
                                    checked={loginAsAdmin}
                                    onChange={(e) => setLoginAsAdmin(e.target.checked)}
                                    className="size-4 shrink-0 cursor-pointer rounded border border-input accent-foreground"
                                />
                                <Label
                                    htmlFor="login-as-admin"
                                    className="cursor-pointer font-normal text-muted-foreground"
                                >
                                    Login as admin
                                </Label>
                            </div>
                            <Button type="button" className="w-full" onClick={handleLogin}>
                                Login
                            </Button>
                        </div>
                        <div className="mt-4 text-center text-sm">
                            Don&apos;t have an account?{" "}
                            <Link href="/signup" className="underline">
                                Sign up
                            </Link>
                        </div>
                    </CardContent>
                </Card>
            </main>
            <Footer />
        </div>
    )
}
