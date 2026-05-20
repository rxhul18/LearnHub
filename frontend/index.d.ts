export type CourseType = {
    _id: string;
    title: string;
    description: string;
    thumbnailUrl?: string;
    videoUrl?: string;
    category?: string;
    image?: string; // legacy
    price: number;
    creatorId: string;
}