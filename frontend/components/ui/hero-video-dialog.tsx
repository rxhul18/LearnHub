"use client"

import { useState } from "react"
import { Play, XIcon } from "lucide-react"
import { AnimatePresence, motion } from "motion/react"

import { cn } from "@/lib/utils"

type AnimationStyle =
  | "from-bottom"
  | "from-center"
  | "from-top"
  | "from-left"
  | "from-right"
  | "fade"
  | "top-in-bottom-out"
  | "left-in-right-out"

interface HeroVideoDialogProps {
  animationStyle?: AnimationStyle
  videoSrc: string
  thumbnailSrc: string
  thumbnailAlt?: string
  className?: string
  /** Controlled open state (e.g. dashboard quick preview) */
  open?: boolean
  onOpenChange?: (open: boolean) => void
  /** When false, only the modal is rendered — no thumbnail trigger */
  showTrigger?: boolean
}

const animationVariants = {
  "from-bottom": {
    initial: { y: "100%", opacity: 0 },
    animate: { y: 0, opacity: 1 },
    exit: { y: "100%", opacity: 0 },
  },
  "from-center": {
    initial: { scale: 0.5, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    exit: { scale: 0.5, opacity: 0 },
  },
  "from-top": {
    initial: { y: "-100%", opacity: 0 },
    animate: { y: 0, opacity: 1 },
    exit: { y: "-100%", opacity: 0 },
  },
  "from-left": {
    initial: { x: "-100%", opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: "-100%", opacity: 0 },
  },
  "from-right": {
    initial: { x: "100%", opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: "100%", opacity: 0 },
  },
  fade: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  },
  "top-in-bottom-out": {
    initial: { y: "-100%", opacity: 0 },
    animate: { y: 0, opacity: 1 },
    exit: { y: "100%", opacity: 0 },
  },
  "left-in-right-out": {
    initial: { x: "-100%", opacity: 0 },
    animate: { x: 0, opacity: 1 },
    exit: { x: "100%", opacity: 0 },
  },
}

function isEmbedUrl(src: string) {
  return /youtube\.com|youtu\.be|vimeo\.com|embed/i.test(src)
}

export function HeroVideoDialog({
  animationStyle = "from-center",
  videoSrc,
  thumbnailSrc,
  thumbnailAlt = "Video thumbnail",
  className,
  open: controlledOpen,
  onOpenChange,
  showTrigger = true,
}: HeroVideoDialogProps) {
  const [internalOpen, setInternalOpen] = useState(false)
  const isControlled = controlledOpen !== undefined
  const isVideoOpen = isControlled ? controlledOpen : internalOpen

  const setOpen = (value: boolean) => {
    if (isControlled) {
      onOpenChange?.(value)
    } else {
      setInternalOpen(value)
    }
  }

  const selectedAnimation = animationVariants[animationStyle]
  const useIframe = isEmbedUrl(videoSrc)

  return (
    <div className={cn("relative", className)}>
      {showTrigger && (
        <button
          type="button"
          aria-label="Play video"
          className="group relative w-full cursor-pointer border-0 bg-transparent p-0"
          onClick={() => setOpen(true)}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={thumbnailSrc}
            alt={thumbnailAlt}
            width={1920}
            height={1080}
            className="aspect-video w-full rounded-xl border object-cover shadow-sm transition-all duration-200 ease-out group-hover:brightness-[0.85]"
          />
          <div className="absolute inset-0 flex items-center justify-center rounded-xl">
            <div className="flex size-16 items-center justify-center rounded-full bg-black/40 backdrop-blur-sm transition-transform duration-200 group-hover:scale-110 sm:size-20">
              <Play className="size-7 fill-white text-white sm:size-8" />
            </div>
          </div>
        </button>
      )}

      <AnimatePresence>
        {isVideoOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            role="presentation"
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md"
            onClick={() => setOpen(false)}
          >
            <motion.div
              {...selectedAnimation}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="relative mx-4 aspect-video w-full max-w-4xl md:mx-0"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                aria-label="Close video"
                onClick={() => setOpen(false)}
                className="absolute -top-14 right-0 rounded-full bg-neutral-900/60 p-2 text-white ring-1 ring-white/20 backdrop-blur-md hover:bg-neutral-900"
              >
                <XIcon className="size-5" />
              </button>
              <div className="relative isolate z-1 size-full overflow-hidden rounded-2xl border border-white/20 bg-black shadow-2xl">
                {useIframe ? (
                  <iframe
                    src={videoSrc}
                    title={thumbnailAlt}
                    className="mt-0 size-full"
                    allowFullScreen
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  />
                ) : (
                  <video
                    src={videoSrc}
                    controls
                    autoPlay
                    playsInline
                    className="size-full object-contain"
                  />
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
