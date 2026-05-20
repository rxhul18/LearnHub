import AIChatbot from '@/components/AIChatbot'
import { Toaster } from '@/components/ui/sonner'
import { AuthProvider } from '@/lib/authContext'
import React, { ReactNode } from 'react'

const layout = ({ children }: { children: ReactNode }) => {
    return (
        <>
            <AuthProvider>
                <main>{children}</main>
                <AIChatbot />
                <Toaster richColors />
            </AuthProvider>
        </>
    )
}

export default layout