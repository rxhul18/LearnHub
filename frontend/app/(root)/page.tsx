"use client"
import Link from "next/link"
import { ArrowRight, BookOpen, CheckCircle, GraduationCap, Loader2, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import heroImage from "@/public/images/heroImage.webp"
import WebDev from "@/public/images/WebDev.png"
import DataScience from "@/public/images/DataScience.png"
import UiUx from "@/public/images/ui-ux.jpg"
import Image from "next/image"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useAuth } from "@/lib/authContext"
import { redirect } from "next/navigation"
import Footer from "@/components/footer"
import Logo from "@/components/logo"
import { Globe } from "@/components/ui/globe"

export default function LandingPage() {
    const { user, loading } = useAuth();
    if (!loading && user) {
        redirect("/dashboard");
    }
    if (loading) return (
        <div className="flex h-screen items-center justify-center">
            <Loader2 className="mr-2 size-6 animate-spin" />
            <p className="text-lg font-semibold">Loading...</p>
        </div>
    );


    return (
        <div className="flex min-h-dvh flex-col">
            <header className="sticky top-0 z-50 min-w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 flex justify-center">
                <div className="container max-w-[90%] flex h-16 items-center justify-between">
                    <div className="flex items-center gap-2">
                        <GraduationCap className="size-9" />
                        <Logo />
                    </div>
                    <nav className="hidden md:flex items-center gap-6">
                        <Link href="#courses" className="text-sm font-medium hover:underline underline-offset-4">
                            Courses
                        </Link>
                        <Link href="#features" className="text-sm font-medium hover:underline underline-offset-4">
                            Features
                        </Link>
                        <Link href="#testimonials" className="text-sm font-medium hover:underline underline-offset-4">
                            Testimonials
                        </Link>
                        <Link href="#pricing" className="text-sm font-medium hover:underline underline-offset-4">
                            Pricing
                        </Link>
                    </nav>
                    <div className="flex items-center gap-3">
                        <Link href="/login">
                            <Button variant="outline" size="sm">
                                Log in
                            </Button>
                        </Link>
                        <Link href="/signup">
                            <Button size="sm">Sign up</Button>
                        </Link>
                    </div>
                </div>
            </header>
            <main className="flex-1 w-screen">
                {/* Hero Section */}
                <section className="min-w-full py-12 justify-center flex max-w-[90%]">
                    <div className="container px-4 md:px-6">
                        <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 xl:grid-cols-2">
                            <div className="flex flex-col justify-center space-y-4">
                                <div className="space-y-2">
                                    <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                                        Unlock Your Potential with Premium Courses
                                    </h1>
                                    <p className="max-w-[600px] text-muted-foreground md:text-xl">
                                        Discover expert-led courses designed to help you master new skills and advance your career.
                                    </p>
                                </div>
                                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                                    <Link href="/signup">
                                        <Button size="lg" className="gap-1.5">
                                            Get Started
                                            <ArrowRight className="size-4" />
                                        </Button>
                                    </Link>
                                    <Link href="#courses">
                                        <Button size="lg" variant="outline">
                                            Browse Courses
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                            <div className="hidden lg:flex items-center justify-center">
                                <Image
                                    src={heroImage}
                                    alt="Hero Image"
                                    className="mx-auto rounded-xl object-cover shadow-lg"
                                />
                            </div>
                        </div>
                    </div>
                </section>

                {/* Featured Courses Section */}
                <section id="courses" className="min-w-full py-12 md:py-24 lg:py-32 bg-muted/50 justify-center flex max-w-[90%]">
                    <div className="container px-4 md:px-6">
                        <div className="flex flex-col items-center justify-center space-y-4 text-center">
                            <div className="space-y-2">
                                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Featured Courses</h2>
                                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                                    Explore our most popular courses and start learning today
                                </p>
                            </div>
                        </div>
                        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 py-12 md:grid-cols-2 lg:grid-cols-3">
                            {featuredCourses.map((course) => (
                                <div
                                    key={course.id}
                                    className="group relative overflow-hidden rounded-lg border bg-background shadow-md transition-all hover:shadow-xl"
                                >
                                    <div className="aspect-video min-w-full overflow-hidden">
                                        <Image
                                            src={course.image || "/placeholder.svg"}
                                            alt={course.title}
                                            className="object-cover transition-all group-hover:scale-105"
                                            width={500}
                                            height={300}
                                        />
                                    </div>
                                    <div className="p-6">
                                        <h3 className="text-xl font-bold">{course.title}</h3>
                                        <p className="line-clamp-2 mt-2 text-muted-foreground">{course.description}</p>
                                        <div className="mt-4 flex items-center justify-between">
                                            <p className="font-bold">₹{course.price}</p>
                                            <Link href="/login">
                                                <Button variant="secondary" size="sm">
                                                    Enroll Now
                                                </Button>
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="flex justify-center">
                            <Link href="/login">
                                <Button size="lg" variant="outline">
                                    View All Courses
                                    <ArrowRight className="ml-2 size-4" />
                                </Button>
                            </Link>
                        </div>
                    </div>
                </section>

                {/* Features Section */}
                <section id="features" className="min-w-full py-12 md:py-24 lg:py-32 justify-center flex max-w-[90%]">
                    <div className="container px-4 md:px-6">
                        <div className="flex flex-col items-center justify-center space-y-4 text-center">
                            <div className="space-y-2">
                                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Why Choose LearnHub</h2>
                                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                                    Our platform offers everything you need to succeed in your learning journey
                                </p>
                            </div>
                        </div>
                        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-8 py-12 md:grid-cols-2 lg:grid-cols-3">
                            <div className="flex flex-col items-center space-y-2 rounded-lg border p-6 shadow-sm">
                                <div className="rounded-full bg-primary/10 p-3">
                                    <BookOpen className="size-6 text-primary" />
                                </div>
                                <h3 className="text-xl font-bold">Expert Instructors</h3>
                                <p className="text-center text-muted-foreground">
                                    Learn from industry professionals with years of experience
                                </p>
                            </div>
                            <div className="flex flex-col items-center space-y-2 rounded-lg border p-6 shadow-sm">
                                <div className="rounded-full bg-primary/10 p-3">
                                    <CheckCircle className="size-6 text-primary" />
                                </div>
                                <h3 className="text-xl font-bold">Flexible Learning</h3>
                                <p className="text-center text-muted-foreground">
                                    Study at your own pace with lifetime access to course materials
                                </p>
                            </div>
                            <div className="flex flex-col items-center space-y-2 rounded-lg border p-6 shadow-sm">
                                <div className="rounded-full bg-primary/10 p-3">
                                    <Users className="size-6 text-primary" />
                                </div>
                                <h3 className="text-xl font-bold">Community Support</h3>
                                <p className="text-center text-muted-foreground">
                                    Join a community of learners and get help when you need it
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Testimonials Section */}
                <section id="testimonials" className="min-w-full py-12 md:py-24 lg:py-32 bg-muted/50 justify-center flex max-w-[90%]">
                    <div className="container px-4 md:px-6">
                        <div className="flex flex-col items-center justify-center space-y-4 text-center">
                            <div className="space-y-2">
                                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">What Our Students Say</h2>
                                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                                    Hear from our students who have transformed their careers with our courses
                                </p>
                            </div>
                        </div>
                        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-8 py-12 md:grid-cols-2 lg:grid-cols-3">
                            {testimonials.map((testimonial, index) => (
                                <div key={index} className="rounded-lg border bg-background p-6 shadow-sm">
                                    <div className="flex items-start space-x-4">
                                        <Avatar>
                                            <AvatarFallback>{testimonial.name[0]}</AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <h3 className="font-bold">{testimonial.name}</h3>
                                            <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                                        </div>
                                    </div>
                                    <p className="mt-4 text-muted-foreground">{testimonial.content}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* CTA Section */}
                <section id="pricing" className="min-w-full py-12 md:py-24 lg:py-32 justify-center flex max-w-[90%]">
                    <div className="container px-4 md:px-6">
                        <div className="flex flex-col items-center justify-center space-y-4 text-center">
                            <div className="space-y-2">
                                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Ready to Start Learning?</h2>
                                <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                                    Join thousands of students already learning on our platform
                                </p>
                            </div>
                            <div className="flex flex-col gap-2 min-[400px]:flex-row">
                                <Link href="/signup">
                                    <Button size="lg" className="gap-1.5">
                                        Sign Up Now
                                        <ArrowRight className="size-4" />
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Globe + LearnHub */}
                <section className="min-w-full flex justify-center max-w-[90%] border-t">
                    <div className="relative flex min-h-[88vh] w-full flex-col items-center overflow-hidden bg-gradient-to-b from-background via-muted/25 to-background">
                        <div className="relative z-20 w-full px-4 pt-16 text-center md:pt-24">
                            <h2>
                                <Logo className="text-6xl font-bold tracking-tighter sm:text-7xl md:text-8xl lg:text-[7.5rem] lg:leading-none" />
                            </h2>
                            <p className="mx-auto mt-4 max-w-lg text-sm text-muted-foreground md:text-base">
                                Learn without borders — courses for learners everywhere.
                            </p>
                        </div>

                        <div className="relative mt-4 flex w-full flex-1 items-end justify-center overflow-hidden md:mt-8">
                            <div className="relative h-[min(58vh,640px)] w-full min-h-[380px] sm:h-[62vh] sm:min-h-[440px] md:min-h-[520px]">
                                <Globe className="!max-w-none bottom-[-40%] left-1/2 top-auto h-[min(95vw,920px)] w-[min(95vw,920px)] -translate-x-1/2" />
                            </div>
                        </div>
                    </div>
                </section>
            </main>
            <Footer />
        </div>
    )
}

// Sample data
const featuredCourses = [
    {
        id: 1,
        title: "Web Development Bootcamp",
        description: "Learn HTML, CSS, JavaScript, React, and Node.js to become a full-stack web developer.",
        price: 99.99,
        image: WebDev,
    },
    {
        id: 2,
        title: "Data Science Fundamentals",
        description: "Master the basics of data analysis, visualization, and machine learning.",
        price: 89.99,
        image: DataScience,
    },
    {
        id: 3,
        title: "UX/UI Design Masterclass",
        description: "Create stunning user interfaces and improve user experience with modern design principles.",
        price: 79.99,
        image: UiUx,
    },
]

const testimonials = [
    {
        name: "Sarah Johnson",
        role: "Frontend Developer",
        content:
            "The Web Development Bootcamp completely transformed my career. I went from knowing nothing about coding to landing a job as a frontend developer in just 6 months!",
    },
    {
        name: "Michael Chen",
        role: "Data Analyst",
        content:
            "The Data Science course provided me with the skills I needed to transition into a data-focused role. The instructor was knowledgeable and the content was comprehensive.",
    },
    {
        name: "Emily Rodriguez",
        role: "UX Designer",
        content:
            "I've taken many design courses, but this UX/UI Masterclass was by far the best. The practical projects helped me build a portfolio that impressed employers.",
    },
]
