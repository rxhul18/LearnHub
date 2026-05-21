import React from 'react'
import { Github, GraduationCap, Twitter } from 'lucide-react' // Using lucide-react for consistent icons
import Link from 'next/link'

function Footer() {
    return (
        <footer className='flex justify-center h-16 border-t px-6 bg-background sticky bottom-0'>
            <div className='container flex justify-between items-center'>
                <div className='flex items-center gap-4'>
                    <GraduationCap className='size-8 stroke-[1.5px]' />
                    <p className='text-sm text-muted-foreground font-normal'>
                        {/* Built with <span className='text-red-500 text-lg'>❤️</span> by <Link href={"https://rahulwtf.in"} className='underline font-semibold'>Rahul Shah(me)</Link> */}
                        Build by <span className='font-semibold text-primary italic'>Rahul Shah, Harsh Dubey & Shreyash Jambhulkar</span>
                    </p>
                </div>

                <div className='flex items-center gap-2'>
                    <a
                        href="https://github.com/rxhul18/InterviewScheduler"
                        target="_blank"
                        rel="noopener noreferrer"
                        className='text-muted-foreground hover:text-foreground transition-colors border p-1 rounded-lg'
                    >
                        <Github className='size-5' />
                    </a>
                    <a
                        href="https://x.com/mindpuzzledev"
                        target="_blank"
                        rel="noopener noreferrer"
                        className='text-muted-foreground hover:text-foreground transition-colors border p-1 rounded-lg'
                    >
                        <Twitter className='size-5' />
                    </a>
                </div>
            </div>
        </footer>
    )
}

export default Footer