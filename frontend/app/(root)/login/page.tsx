"use client";

import Link from "next/link"
import { Eye, GraduationCap, Loader2 } from "lucide-react"
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
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
    const [role, setRole] = useState("");

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
        if (email === "" || password === "" || role === "") {
            toast.error("Please fill in all fields")
            return
        }
        if (role !== "user" && role !== "admin") {
            toast.error("Invalid role selected")
            return

        } else if (role === "user") {
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
                                <Input id="email" type="email" placeholder="rahul@example.com" required onChange={(e) => (setEmail(e.target.value))} />
                            </div>
                            <div className="relative space-y-2">
                                <div className="flex items-center">
                                    <Label htmlFor="password">Password</Label>
                                </div>
                                <Input id="password" type="password" required onChange={(e) => (setPassword(e.target.value))} placeholder="Rahuhl1234"/>
                                <Button variant="ghost" size="icon" className="absolute bottom-1 right-1 h-7 w-7">
                                    <Eye className="size-4" />
                                    <span className="sr-only">Toggle password visibility</span>
                                </Button>
                            </div>
                            <div className="space-y-1">
                                <Select required onValueChange={(value => setRole(value))}>
                                    <SelectTrigger className="w-[180px]">
                                        <SelectValue placeholder="Select the role!!" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectGroup>
                                            <SelectLabel>Avaiable roles</SelectLabel>
                                            <SelectItem value="user">user</SelectItem>
                                            <SelectItem value="admin">admin</SelectItem>
                                        </SelectGroup>
                                    </SelectContent>
                                </Select>
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
