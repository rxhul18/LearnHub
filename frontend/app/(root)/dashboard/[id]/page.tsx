"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import {
    ArrowLeft,
    BookOpen,
    CheckCircle2,
    GraduationCap,
    IndianRupee,
    Loader2,
    Play,
    Tag,
} from "lucide-react"
import axios from "axios"
import { toast } from "sonner"
import Image from "next/image"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { useAuth } from "@/lib/authContext"
import { getCourseThumbnail } from "@/lib/course"
import { CourseType } from "@/index"

const API = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") || ""

export default function CourseDetailPage() {
    const { id } = useParams<{ id: string }>()
    const router = useRouter()
    const { user, loading: authLoading } = useAuth()

    const [course, setCourse] = useState<CourseType | null>(null)
    const [isEnrolled, setIsEnrolled] = useState(false)
    const [pageLoading, setPageLoading] = useState(true)
    const [enrolling, setEnrolling] = useState(false)
    const [playing, setPlaying] = useState(false)

    useEffect(() => {
        if (authLoading) return
        if (!user) {
            router.push("/login")
            return
        }
        load()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [authLoading, user])

    async function load() {
        setPageLoading(true)
        try {
            const [courseRes, purchasedRes] = await Promise.all([
                axios.get(`${API}/api/v1/course/${id}`, { withCredentials: true }),
                axios.get(`${API}/api/v1/course/purchased`, { withCredentials: true }),
            ])

            const c: CourseType = courseRes.data?.course
            setCourse(c)

            const purchases: { courseId: CourseType | string }[] =
                purchasedRes.data?.purchases || []
            const enrolled = purchases.some((p) => {
                const cId =
                    typeof p.courseId === "object"
                        ? (p.courseId as CourseType)._id
                        : p.courseId
                return cId === id
            })
            setIsEnrolled(enrolled)
        } catch {
            toast.error("Could not load course details.")
        } finally {
            setPageLoading(false)
        }
    }

    async function handleEnroll() {
        if (!user) return
        setEnrolling(true)
        toast.loading("Enrolling…", { id: "enroll" })
        try {
            await axios.post(
                `${API}/api/v1/course/purchase`,
                { courseId: id },
                { withCredentials: true }
            )
            toast.success("Enrolled successfully!", { id: "enroll" })
            setIsEnrolled(true)
        } catch (err) {
            const msg = axios.isAxiosError(err)
                ? err.response?.data?.message
                : null
            toast.error(msg || "Enrollment failed.", { id: "enroll" })
        } finally {
            setEnrolling(false)
        }
    }

    if (authLoading || pageLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <Loader2 className="size-6 animate-spin text-muted-foreground" />
            </div>
        )
    }

    if (!course) {
        return (
            <div className="flex min-h-screen flex-col items-center justify-center gap-4">
                <BookOpen className="size-12 text-muted-foreground" />
                <p className="text-lg font-semibold">Course not found</p>
                <Button asChild variant="outline">
                    <Link href="/dashboard">
                        <ArrowLeft className="size-4" />
                        Back to Dashboard
                    </Link>
                </Button>
            </div>
        )
    }

    const thumbnail = getCourseThumbnail(course)

    return (
        <div className="min-h-screen bg-background">
            {/* Top nav bar */}
            <header className="sticky top-0 z-40 flex h-14 items-center gap-3 border-b bg-background/95 px-4 backdrop-blur sm:px-6">
                <Button variant="ghost" size="icon" asChild>
                    <Link href="/dashboard">
                        <ArrowLeft className="size-5" />
                    </Link>
                </Button>
                <div className="flex items-center gap-2">
                    <GraduationCap className="size-6" />
                    <span className="font-semibold text-sm hidden sm:block">LearnHub</span>
                </div>
            </header>

            <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
                <div className="grid gap-8 lg:grid-cols-[1fr_320px]">

                    {/* LEFT — course info */}
                    <div className="space-y-6 order-2 lg:order-1">
                        {/* Category */}
                        {course.category && (
                            <Badge variant="secondary" className="gap-1.5">
                                <Tag className="size-3" />
                                {course.category}
                            </Badge>
                        )}

                        <h1 className="text-3xl font-bold leading-tight tracking-tight">
                            {course.title}
                        </h1>

                        <p className="text-muted-foreground leading-relaxed">
                            {course.description || "No description available."}
                        </p>

                        <Separator />

                        {/* Price row */}
                        <div className="flex items-center gap-2">
                            <IndianRupee className="size-5 text-foreground" />
                            <span className="text-2xl font-bold">{course.price}</span>
                        </div>

                        {/* Enrollment status */}
                        {isEnrolled ? (
                            <div className="flex items-center gap-2 rounded-xl border border-green-200 bg-green-50 px-4 py-3 dark:border-green-900 dark:bg-green-950/30">
                                <CheckCircle2 className="size-5 shrink-0 text-green-600" />
                                <p className="text-sm font-medium text-green-700 dark:text-green-400">
                                    You&apos;re enrolled in this course
                                </p>
                            </div>
                        ) : (
                            <Button
                                size="lg"
                                className="w-full sm:w-auto"
                                onClick={handleEnroll}
                                disabled={enrolling}
                            >
                                {enrolling && <Loader2 className="size-4 animate-spin" />}
                                Enroll Now — ₹{course.price}
                            </Button>
                        )}

                        {/* Video player (enrolled only) */}
                        {isEnrolled && course.videoUrl && (
                            <div className="space-y-3">
                                <Separator />
                                <h2 className="font-semibold text-lg">Course Video</h2>
                                {playing ? (
                                    <div className="overflow-hidden rounded-2xl border bg-black">
                                        <video
                                            src={course.videoUrl}
                                            controls
                                            autoPlay
                                            className="aspect-video w-full"
                                        />
                                    </div>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={() => setPlaying(true)}
                                        className="group relative w-full overflow-hidden rounded-2xl border"
                                    >
                                        <Image
                                            src={thumbnail}
                                            alt={course.title}
                                            width={800}
                                            height={450}
                                            className="aspect-video w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                                        />
                                        <div className="absolute inset-0 flex items-center justify-center bg-black/30 transition-colors group-hover:bg-black/40">
                                            <div className="flex size-16 items-center justify-center rounded-full bg-white/90 shadow-xl transition-transform duration-200 group-hover:scale-110">
                                                <Play className="size-7 fill-black text-black pl-1" />
                                            </div>
                                        </div>
                                    </button>
                                )}
                            </div>
                        )}

                        {/* Enrolled but no video */}
                        {isEnrolled && !course.videoUrl && (
                            <div className="space-y-3">
                                <Separator />
                                <div className="flex items-center gap-3 rounded-xl border bg-muted/40 px-4 py-3">
                                    <BookOpen className="size-5 text-muted-foreground shrink-0" />
                                    <p className="text-sm text-muted-foreground">
                                        No video uploaded for this course yet. Check back soon!
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* RIGHT — thumbnail card */}
                    <div className="order-1 lg:order-2">
                        <div className="overflow-hidden rounded-2xl border shadow-sm">
                            <Image
                                src={thumbnail}
                                alt={course.title}
                                width={640}
                                height={360}
                                className="aspect-video w-full object-cover"
                            />
                            <div className="space-y-4 p-5">
                                <div className="flex items-center justify-between">
                                    <span className="text-xs text-muted-foreground uppercase tracking-wide">
                                        Course Price
                                    </span>
                                    <span className="text-xl font-bold">₹{course.price}</span>
                                </div>
                                {isEnrolled ? (
                                    <div className="flex items-center gap-2 text-sm font-medium text-green-600 dark:text-green-400">
                                        <CheckCircle2 className="size-4" />
                                        Enrolled
                                    </div>
                                ) : (
                                    <Button
                                        className="w-full"
                                        onClick={handleEnroll}
                                        disabled={enrolling}
                                    >
                                        {enrolling ? (
                                            <Loader2 className="size-4 animate-spin" />
                                        ) : null}
                                        Enroll Now
                                    </Button>
                                )}
                                {isEnrolled && course.videoUrl && !playing && (
                                    <Button
                                        variant="outline"
                                        className="w-full gap-2"
                                        onClick={() => setPlaying(true)}
                                    >
                                        <Play className="size-4" />
                                        Watch Course
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}
