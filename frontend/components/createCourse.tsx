import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Plus } from "lucide-react"
import { useAuth } from "@/lib/authContext"
import { toast } from "sonner"
import axios from "axios"
import { ThumbnailUpload } from "@/components/ThumbnailUpload"
import { VideoUpload } from "@/components/VideoUpload"

export function CreateCourse() {
    const { user } = useAuth()
    const [title, setTitle] = useState("")
    const [description, setDescription] = useState("")
    const [price, setPrice] = useState("")
    const [category, setCategory] = useState("")
    const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null)
    const [videoUrl, setVideoUrl] = useState<string | null>(null)
    const [isOpen, setIsOpen] = useState(false)
    const [submitting, setSubmitting] = useState(false)

    const resetForm = () => {
        setTitle("")
        setDescription("")
        setPrice("")
        setCategory("")
        setThumbnailUrl(null)
        setVideoUrl(null)
    }

    const handleSubmit = async () => {
        if (!user) {
            toast.error("You must be logged in to create a course.")
            return
        }
        if (!title || !description || !price || !thumbnailUrl) {
            toast.error("Please fill in title, description, price, and upload a thumbnail.")
            return
        }

        setSubmitting(true)
        toast.loading("Creating course...", { id: "create-course" })

        try {
            const res = await axios.post(
                process.env.NEXT_PUBLIC_API_URL + "/api/v1/admin/course",
                {
                    title,
                    description,
                    price: Number(price),
                    category: category || "General",
                    thumbnailUrl,
                    videoUrl: videoUrl || "",
                },
                { withCredentials: true }
            )

            if (res.status === 201) {
                toast.success("Course created successfully", { id: "create-course" })
                resetForm()
                setIsOpen(false)
                window.location.reload()
            }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (error: any) {
            toast.error("Course creation failed", {
                description: error.response?.data?.message || "Something went wrong",
                id: "create-course",
            })
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button><Plus /><span className="hidden md:flex">Create Course</span></Button>
            </DialogTrigger>
            <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[560px]">
                <DialogHeader>
                    <DialogTitle>Create a new course</DialogTitle>
                    <DialogDescription>
                        Upload a thumbnail and video, then fill in the course details.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-5 py-2">
                    <div className="space-y-2">
                        <Label>Thumbnail</Label>
                        <ThumbnailUpload value={thumbnailUrl} onChange={setThumbnailUrl} />
                    </div>

                    <div className="space-y-2">
                        <Label>Course video <span className="text-muted-foreground">(optional)</span></Label>
                        <VideoUpload value={videoUrl} onChange={setVideoUrl} />
                    </div>

                    <div className="grid gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="title">Title</Label>
                            <Input
                                id="title"
                                placeholder="e.g. Fullstack Bootcamp"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                id="description"
                                placeholder="Brief summary of the course"
                                rows={3}
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="price">Price (₹)</Label>
                                <Input
                                    id="price"
                                    type="number"
                                    placeholder="499"
                                    value={price}
                                    onChange={(e) => setPrice(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="category">Category</Label>
                                <Input
                                    id="category"
                                    placeholder="e.g. Web Development"
                                    value={category}
                                    onChange={(e) => setCategory(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <DialogFooter>
                    <Button
                        onClick={handleSubmit}
                        className="w-full"
                        disabled={submitting || !thumbnailUrl}
                    >
                        <Plus />
                        {submitting ? "Creating…" : "Create Course"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
