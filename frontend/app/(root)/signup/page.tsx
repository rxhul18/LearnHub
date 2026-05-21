"use client"

import Link from "next/link"
import { Eye, GraduationCap, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState } from "react"
import { toast } from "sonner"
import axios from "axios"
import { redirect } from "next/navigation"
import Footer from "@/components/footer"
import Logo from "@/components/logo"
import { useAuth } from "@/lib/authContext"

export default function SignupPage() {

    const { user, loading } = useAuth();
    const [firstName, setFiratName] = useState("")
    const [lastName, setLastName] = useState("")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [signupAsAdmin, setSignupAsAdmin] = useState(false)
    if (!loading && user) {
        redirect("/dashboard");
    }

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Loader2 className="mr-2 size-6 animate-spin" />
                <p className="text-lg font-semibold">Loading...</p>
            </div>
        )
    }

    async function handleSignup() {
        if (firstName === "" || lastName === "" || email === "" || password === "") {
            toast.error("Please fill in all fields")
            return
        }

        const role = signupAsAdmin ? "admin" : "user"

        if (role === "user") {
            toast.loading("Creating account BuckleUp!", {
                id: "usersignup"
            })
            await axios.post(process.env.NEXT_PUBLIC_API_URL + "/api/v1/user/signup", {
                firstName,
                lastName,
                email,
                password,
            })
                .then((res) => {
                    if (res.status === 201) {
                        toast.success("Account created successfully", {
                            description: `Welcome aboard, ${firstName}!`,
                            id: "usersignup"
                        })
                        redirect("/login");
                    } else {
                        toast.error("Account creation failed", {
                            id: "usersignup"
                        })
                    }
                })
        } else if (role === "admin") {
            toast("Creating account BuckleUp", {
                id: "adminsignup"
            })
            await axios.post(process.env.NEXT_PUBLIC_API_URL + "/api/v1/admin/signup", {
                firstName,
                lastName,
                email,
                password,
            })
                .then((res) => {
                    if (res.status === 201) {
                        toast.success("Account created successfully", {
                            description: `Welcome aboard, ${firstName}!`,
                            id: "adminsignup"
                        })
                        redirect("/login");
                    } else {
                        toast.error("Account creation failed", {
                            id: "adminsignup"
                        })
                    }
                })
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
                <Card className="mx-auto max-w-sm">
                    <CardHeader className="space-y-1">
                        <CardTitle className="text-2xl font-bold">Sign Up</CardTitle>
                        <CardDescription>Create an account to start learning</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="firstName">First Name</Label>
                                    <Input id="firstName" required onChange={(e) => (setFiratName(e.target.value))} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="lastName">Last Name</Label>
                                    <Input id="lastName" required onChange={(e) => (setLastName(e.target.value))} />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input id="email" type="email" placeholder="example@example.com" required onChange={(e) => (setEmail(e.target.value))} />
                            </div>
                            <div className="relative space-y-2">
                                <Label htmlFor="password">Password</Label>
                                <Input id="password" type="password" required onChange={(e) => (setPassword(e.target.value))} />
                                <Button variant="ghost" size="icon" className="absolute bottom-1 right-1 h-7 w-7">
                                    <Eye className="size-4" />
                                    <span className="sr-only">Toggle password visibility</span>
                                </Button>
                            </div>
                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="signup-as-admin"
                                    checked={signupAsAdmin}
                                    onChange={(e) => setSignupAsAdmin(e.target.checked)}
                                    className="size-4 shrink-0 cursor-pointer rounded border border-input accent-foreground"
                                />
                                <Label
                                    htmlFor="signup-as-admin"
                                    className="cursor-pointer font-normal text-muted-foreground"
                                >
                                    Sign up as admin
                                </Label>
                            </div>
                            <Button type="submit" className="w-full" onClick={handleSignup}>
                                Create Account
                            </Button>
                        </div>
                        <div className="mt-4 text-center text-sm">
                            Already have an account?{" "}
                            <Link href="/login" className="underline">
                                Log in
                            </Link>
                        </div>
                    </CardContent>
                </Card>
            </main>
            <Footer />
        </div>
    )
}
