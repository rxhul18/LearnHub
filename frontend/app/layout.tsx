import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "LearnHub – Your Gateway to Smarter Learning",
  description: "LearnHub is a full-stack learning platform developed by Rahul Shah, offering curated educational content, quizzes, and dashboards for learners and administrators. Built with cutting-edge web technologies.",
  keywords: [
    "LearnHub",
    "Online Learning",
    "EdTech Platform",
    "Learning Management System",
    "Quizzes",
    "Rahul Shah",
    "Full Stack Developer",
    "Next.js",
    "Tailwind CSS",
    "MongoDB",
    "Express.js",
    "React",
    "Fullstack Learning App",
    "Admin Dashboard"
  ],
  authors: [{ name: "Rahul Shah", url: "https://rahulwtf.in" }],
  creator: "Rahul Shah",
  publisher: "Rahul Shah",
  metadataBase: new URL("https://learnhub.rahulwtf.in"),
  openGraph: {
    title: "LearnHub – Smarter Learning Starts Here",
    description: "LearnHub is an intuitive platform to explore learning resources, manage quizzes, and track progress. Developed by Rahul Shah.",
    url: "https://learnhub.rahulwtf.in",
    siteName: "LearnHub",
    images: [
      {
        url: "https://learnhub.rahulwtf.in/og-image.png", // Add this image if you have one
        width: 1200,
        height: 630,
        alt: "LearnHub – Smarter Learning Starts Here"
      }
    ],
    locale: "en_US",
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title: "LearnHub – Smarter Learning Starts Here",
    description: "Explore curated learning paths and quizzes on LearnHub. Built with Next.js by Rahul Shah.",
    creator: "@rahulwtf", // Add your Twitter handle if available
    images: ["https://learnhub.rahulwtf.in/og-image.png"]
  },
  category: "Education"
};

export const viewport: Viewport = {
  themeColor: "#0f172a",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
