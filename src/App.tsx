import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { RouterProvider } from 'react-router-dom'
import { router } from '@/router'
import { ToastContainer } from '@/components/ui/ToastContainer'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
      <ToastContainer />
      <ConfirmDialog />
    </QueryClientProvider>
  )
}

export default App
