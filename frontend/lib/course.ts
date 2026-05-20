/** Resolve course thumbnail — supports legacy `image` field */
export function getCourseThumbnail(course: {
  thumbnailUrl?: string;
  image?: string;
}) {
  return course.thumbnailUrl || course.image || "/placeholder.svg";
}
