/* eslint-disable @typescript-eslint/no-unused-vars */
"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { GraduationCap, Home, Loader2, LogOut, Play, Search, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarProvider,
    SidebarTrigger,
} from "@/components/ui/sidebar"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { useAuth } from "@/lib/authContext"
import { redirect } from "next/navigation"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import axios from "axios"
import { toast } from "sonner"
import Logo from "@/components/logo"
import { CreateCourse } from "@/components/createCourse"
import { CourseType } from "@/index"
import Image from "next/image"
import { Separator } from "@/components/ui/separator"
import { getCourseThumbnail } from "@/lib/course"
import ProfileBtn from "@/components/profile"

export default function DashboardPage() {
    const [searchQuery, setSearchQuery] = useState("");
    const { user, loading } = useAuth();
    const [courses, setCourses] = useState<CourseType[]>([]);
    const [enrolledCourses, setEnrolledCourses] = useState<CourseType[]>([]);
    const [publishedCourses, setPublishedCourses] = useState<CourseType[]>([]);

    // video popup state
    const [videoOpen, setVideoOpen] = useState(false);
    const [activeCourse, setActiveCourse] = useState<CourseType | null>(null);

    const handleLogout = async () => {
        await axios.post(process.env.NEXT_PUBLIC_API_URL + "/api/v1/logout", {}, { withCredentials: true });
        toast.success("Logout successful", {
            description: `See you soon, ${user?.firstName}!`,
        })
        window.location.reload();
    }

    if (!loading && !user) {
        redirect("/login");
    }

    useEffect(() => {
        async function fetchData() {
            if (!loading) {
                try {
                    const [coursesRes, enrolledRes] = await Promise.all([
                        axios.get(process.env.NEXT_PUBLIC_API_URL + "/api/v1/course/preview", { withCredentials: true }),
                        axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/course/purchased`, { withCredentials: true })
                    ]);

                    const allCourses: CourseType[] = coursesRes.data?.courses || [];
                    const enrolledIds: string[] = enrolledRes.data?.purchases.map((e: { courseId: CourseType }) =>
                        typeof e.courseId === "object" ? e.courseId._id : e.courseId
                    );

                    const enrolled: CourseType[] = allCourses.filter(course => enrolledIds.includes(course._id));
                    const remaining: CourseType[] = allCourses.filter(course => !enrolledIds.includes(course._id));

                    setCourses(remaining);
                    setEnrolledCourses(enrolled);

                    toast.success("Courses fetched successfully", { id: "fetch-courses" });
                } catch {
                    toast.error("Failed to fetch courses.", { id: "fetch-courses" });
                }
            }
        }

        async function fetchPublished() {
            try {
                const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/course/launched`, { withCredentials: true });
                if (res.status === 200) setPublishedCourses(res.data?.courses || []);
            } catch { /* admin might not have any courses */ }
        }

        fetchPublished();
        fetchData();
    }, [loading]);

    const handleEnrollCourse = async (courseId: string) => {
        toast.loading("Enrolling in course...", { id: "enroll-course" });
        try {
            const res = await axios.post(
                `${process.env.NEXT_PUBLIC_API_URL}/api/v1/course/purchase`,
                { userId: user?._id, courseId },
                { withCredentials: true },
            );
            if (res.status === 201) {
                toast.success("Enrolled successfully", { id: "enroll-course" });
                window.location.reload();
            }
        } catch {
            toast.error("Failed to enroll", { id: "enroll-course" });
        }
    }

    function openVideo(course: CourseType) {
        setActiveCourse(course);
        setVideoOpen(true);
    }

    const filteredCourses = courses.filter(
        (course: CourseType) =>
            course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (course.description || "").toLowerCase().includes(searchQuery.toLowerCase()),
    )

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Loader2 className="mr-2 size-6 animate-spin" />
                <p className="text-lg font-semibold">Loading...</p>
            </div>
        )
    }

    return (
        <SidebarProvider>
            {/* ── Video popup ─────────────────────────────── */}
            <Dialog open={videoOpen} onOpenChange={(v) => { setVideoOpen(v); if (!v) setActiveCourse(null); }}>
                <DialogContent className="max-w-3xl p-0 overflow-hidden rounded-2xl gap-0">
                    <DialogHeader className="px-5 pt-4 pb-3 border-b">
                        <DialogTitle className="text-base font-semibold truncate pr-8">
                            {activeCourse?.title ?? "Course Video"}
                        </DialogTitle>
                    </DialogHeader>
                    {activeCourse?.videoUrl ? (
                        <video
                            src={activeCourse.videoUrl}
                            controls
                            autoPlay
                            className="aspect-video w-full bg-black"
                        />
                    ) : (
                        <div className="flex aspect-video w-full items-center justify-center bg-muted text-sm text-muted-foreground">
                            No video available for this course yet.
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            <div className="flex min-h-dvh w-full">
                <Sidebar>
                    <SidebarHeader>
                        <div className="flex items-center gap-2 px-4 py-2">
                            <GraduationCap className="size-9" />
                            <Logo />
                        </div>
                    </SidebarHeader>
                    <SidebarContent className="px-6">
                        <SidebarMenu>
                            <SidebarMenuItem>
                                <SidebarMenuButton asChild isActive>
                                    <Link href="/dashboard">
                                        <Home className="size-4" />
                                        <span>Dashboard</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        </SidebarMenu>
                    </SidebarContent>
                    <SidebarFooter>
                        <SidebarMenu>
                            <SidebarMenuItem>
                                <SidebarMenuButton asChild>
                                    <Button className="min-w-full hover:bg-black hover:text-white focus:bg-black focus:text-white" onClick={handleLogout}>
                                        <LogOut className="size-4" /> Logout
                                    </Button>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        </SidebarMenu>
                    </SidebarFooter>
                </Sidebar>

                <div className="flex flex-1 flex-col">
                    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-6">
                        <SidebarTrigger />
                        <div className="flex flex-1 items-center justify-between gap-4">
                            <form className="flex-1 md:max-w-sm lg:max-w-lg">
                                <div className="relative">
                                    <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
                                    <Input
                                        type="search"
                                        placeholder="Search courses..."
                                        className="w-full bg-background pl-8 md:w-[300px] lg:w-[400px]"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                </div>
                            </form>
                            <div className="flex gap-3 items-center">
                                {user?.role === "admin" && <CreateCourse />}
                                <ProfileBtn
                                    firstName={user?.firstName ?? ""}
                                    lastName={user?.lastName ?? ""}
                                    email={user?.email ?? ""}
                                    avatar={
                                        <Avatar className="size-10 cursor-pointer border">
                                            <AvatarFallback>{user?.firstName[0]}</AvatarFallback>
                                        </Avatar>
                                    }
                                />
                            </div>
                        </div>
                    </header>

                    <main className="flex-1 p-6">
                        <div className="flex flex-col gap-6">
                            <div>
                                <h1 className="text-3xl font-bold tracking-tight">Welcome back, {user?.firstName}!</h1>
                                <p className="text-muted-foreground">
                                    {user?.role === "admin"
                                        ? "Manage your courses and users here."
                                        : "Continue learning or explore new courses to enhance your skills."}
                                </p>
                            </div>
                            <Separator />

                            {/* ── USER VIEW ── */}
                            {user?.role === "user" && (
                                <div>
                                    {/* My Learning */}
                                    <h2 className="text-2xl font-bold tracking-tight mb-4">My Learning</h2>
                                    {enrolledCourses.length !== 0 ? (
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                            {enrolledCourses.map((course) => (
                                                <Card
                                                    key={course._id}
                                                    className="overflow-hidden pt-0 flex flex-col justify-between h-full group cursor-pointer"
                                                    onClick={() => openVideo(course)}
                                                >
                                                    <div className="relative aspect-video w-full overflow-hidden">
                                                        <Image
                                                            src={getCourseThumbnail(course)}
                                                            alt={course.title}
                                                            className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-[1.03]"
                                                            width={350}
                                                            height={200}
                                                        />
                                                        {/* Play overlay */}
                                                        <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                                            <div className="flex size-12 items-center justify-center rounded-full bg-white/90 shadow-lg">
                                                                <Play className="size-5 fill-black text-black pl-0.5" />
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <CardHeader className="px-4">
                                                        <CardTitle className="line-clamp-1">{course.title}</CardTitle>
                                                    </CardHeader>
                                                    <CardFooter className="px-4 pt-0">
                                                        <Button className="w-full gap-2" variant="outline" onClick={(e) => { e.stopPropagation(); openVideo(course); }}>
                                                            <Play className="size-4" /> Continue Learning
                                                        </Button>
                                                    </CardFooter>
                                                </Card>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center text-muted-foreground py-6">
                                            <p>You haven&apos;t enrolled in any courses yet.</p>
                                            <p>Explore available courses to start learning!</p>
                                        </div>
                                    )}

                                    <Separator className="my-6" />

                                    {/* Available Courses */}
                                    <h2 className="text-2xl font-bold tracking-tight mb-4">Available Courses</h2>
                                    {filteredCourses.length !== 0 ? (
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                            {filteredCourses.map((course: CourseType) => (
                                                <Card key={course._id} className="overflow-hidden py-0 flex flex-col justify-between h-full">
                                                    <Link href={`/dashboard/${course._id}`} className="block">
                                                        <div className="aspect-video w-full overflow-hidden">
                                                            <Image
                                                                src={getCourseThumbnail(course)}
                                                                alt={course.title}
                                                                className="object-cover w-full h-full transition-transform duration-300 hover:scale-[1.03]"
                                                                width={350}
                                                                height={200}
                                                            />
                                                        </div>
                                                    </Link>
                                                    <CardHeader className="px-4">
                                                        <CardTitle className="line-clamp-1">{course.title}</CardTitle>
                                                        <CardDescription className="line-clamp-2">{course.description}</CardDescription>
                                                    </CardHeader>
                                                    <CardContent className="px-4 pt-0">
                                                        <p className="font-bold">₹{course.price}</p>
                                                    </CardContent>
                                                    <CardFooter className="px-4 pb-4 gap-2 flex-col sm:flex-row">
                                                        <Button asChild variant="outline" className="w-full">
                                                            <Link href={`/dashboard/${course._id}`}>View Details</Link>
                                                        </Button>
                                                        <Button className="w-full" onClick={() => handleEnrollCourse(course._id)}>
                                                            Enroll Now
                                                        </Button>
                                                    </CardFooter>
                                                </Card>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center text-muted-foreground py-6">
                                            <p>No courses found matching your search.</p>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* ── ADMIN VIEW ── */}
                            {user?.role === "admin" && (
                                <div>
                                    <h2 className="text-2xl font-bold tracking-tight">Published Courses</h2>
                                    <p className="text-muted-foreground mb-4">
                                        Courses you&apos;ve created on LearnHub.
                                    </p>
                                    {publishedCourses.length !== 0 ? (
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                            {publishedCourses.map((course) => (
                                                <Card key={course._id} className="overflow-hidden pt-0 flex flex-col justify-between h-full group cursor-pointer" onClick={() => openVideo(course)}>
                                                    <div className="relative aspect-video w-full overflow-hidden">
                                                        <Image
                                                            src={getCourseThumbnail(course)}
                                                            alt={course.title}
                                                            className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-[1.03]"
                                                            width={350}
                                                            height={200}
                                                        />
                                                        <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                                            <div className="flex size-12 items-center justify-center rounded-full bg-white/90 shadow-lg">
                                                                <Play className="size-5 fill-black text-black pl-0.5" />
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <CardHeader className="px-4">
                                                        <CardTitle className="line-clamp-1">{course.title}</CardTitle>
                                                    </CardHeader>
                                                    <CardFooter className="px-4 pt-0">
                                                        <Button className="w-full gap-2" variant="outline" onClick={(e) => { e.stopPropagation(); openVideo(course); }}>
                                                            <Play className="size-4" /> Preview Video
                                                        </Button>
                                                    </CardFooter>
                                                </Card>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center text-muted-foreground py-6">
                                            <p>You haven&apos;t created any courses yet.</p>
                                            <p>Click &quot;Create Course&quot; to get started!</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </main>
                </div>
            </div>
        </SidebarProvider>
    )
}
