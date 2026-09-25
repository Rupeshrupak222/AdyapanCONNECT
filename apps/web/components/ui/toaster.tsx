'use client';
import { useToast } from '@/hooks/use-toast';
import { Toast, ToastClose, ToastDescription, ToastProvider, ToastTitle, ToastViewport } from '@radix-ui/react-toast';
import { cn } from '@/lib/utils';

export function Toaster() {
  const { toasts } = useToast();
  return (
    <ToastProvider>
      {toasts.map(({ id, title, description, action, variant, ...props }) => (
        <Toast key={id} {...props}
          className={cn('group pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-xl border p-4 pr-8 shadow-lg transition-all data-[swipe=cancel]:translate-x-0 data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)] data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[state=open]:animate-in data-[state=closed]:animate-out data-[swipe=end]:animate-out data-[state=closed]:fade-out-80 data-[state=closed]:slide-out-to-right-full data-[state=open]:slide-in-from-top-full',
            variant === 'destructive' ? 'border-red-200 bg-red-50 text-red-900' : 'border-green-100 bg-white text-slate-900'
          )}>
          <div className="grid gap-1">
            {title && <ToastTitle className="text-sm font-semibold">{title}</ToastTitle>}
            {description && <ToastDescription className="text-sm opacity-90">{description}</ToastDescription>}
          </div>
          {action}
          <ToastClose className="absolute right-2 top-2 rounded-md p-1 opacity-0 ring-offset-background transition-opacity hover:opacity-100 group-hover:opacity-100" />
        </Toast>
      ))}
      <ToastViewport className="fixed top-0 z-[100] flex max-h-screen w-full flex-col-reverse p-4 sm:bottom-0 sm:right-0 sm:top-auto sm:flex-col md:max-w-[420px]" />
    </ToastProvider>
  );
}
