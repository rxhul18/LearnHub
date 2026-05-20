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

    useEffect(() => {
        if (authLoading) return
        if (!user) {
            router.push("/login")
            return
        }
        load()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [authLoading, user, id])

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
                return String(cId) === String(id)
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
            <header className="sticky top-0 z-40 flex h-14 items-center gap-3 border-b bg-background/95 px-4 backdrop-blur sm:px-6">
                <Button variant="ghost" size="icon" asChild>
                    <Link href="/dashboard">
                        <ArrowLeft className="size-5" />
                    </Link>
                </Button>
                <div className="flex min-w-0 flex-1 items-center gap-2">
                    <GraduationCap className="size-6 shrink-0" />
                    <span className="truncate font-semibold text-sm">
                        {isEnrolled ? course.title : "LearnHub"}
                    </span>
                </div>
                {isEnrolled && (
                    <Badge variant="secondary" className="shrink-0 gap-1 text-green-700 dark:text-green-400">
                        <CheckCircle2 className="size-3" />
                        Enrolled
                    </Badge>
                )}
            </header>

            {/* ── ENROLLED: full-width video + info below ── */}
            {isEnrolled ? (
                <>
                    {course.videoUrl ? (
                        <div className="w-full bg-black">
                            <video
                                src={course.videoUrl}
                                controls
                                autoPlay
                                playsInline
                                className="aspect-video w-full max-h-[70vh] object-contain"
                            />
                        </div>
                    ) : (
                        <div className="flex aspect-video w-full items-center justify-center bg-muted">
                            <div className="flex flex-col items-center gap-2 text-muted-foreground">
                                <BookOpen className="size-10" />
                                <p className="text-sm">No video uploaded for this course yet.</p>
                            </div>
                        </div>
                    )}

                    <main className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6">
                        <div className="space-y-4">
                            {course.category && (
                                <Badge variant="secondary" className="gap-1.5">
                                    <Tag className="size-3" />
                                    {course.category}
                                </Badge>
                            )}
                            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                                {course.title}
                            </h1>
                            <p className="text-muted-foreground leading-relaxed">
                                {course.description || "No description available."}
                            </p>
                        </div>
                    </main>
                </>
            ) : (
                /* ── NOT ENROLLED: details + sidebar thumbnail ── */
                <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
                    <div className="grid gap-8 lg:grid-cols-[1fr_300px]">
                        <div className="space-y-6 order-2 lg:order-1">
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

                            <div className="flex items-center gap-2">
                                <IndianRupee className="size-5 text-foreground" />
                                <span className="text-2xl font-bold">{course.price}</span>
                            </div>

                            <Button
                                size="lg"
                                className="w-full sm:w-auto"
                                onClick={handleEnroll}
                                disabled={enrolling}
                            >
                                {enrolling && <Loader2 className="size-4 animate-spin" />}
                                Enroll Now — ₹{course.price}
                            </Button>
                        </div>

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
                                    <Button
                                        className="w-full"
                                        onClick={handleEnroll}
                                        disabled={enrolling}
                                    >
                                        {enrolling ? (
                                            <Loader2 className="size-4 animate-spin" />
                                        ) : (
                                            <Play className="size-4" />
                                        )}
                                        Enroll to Watch
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </main>
            )}
        </div>
    )
}
