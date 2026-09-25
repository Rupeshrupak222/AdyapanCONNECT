import * as React from 'react';

type ToastVariant = 'default' | 'destructive';

interface Toast {
  id: string;
  title?: string;
  description?: string;
  variant?: ToastVariant;
  action?: React.ReactNode;
  duration?: number;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

interface ToastState { toasts: Toast[] }

let count = 0;
function genId() { count = (count + 1) % Number.MAX_SAFE_INTEGER; return count.toString(); }

const listeners: Array<(state: ToastState) => void> = [];
let memoryState: ToastState = { toasts: [] };

function dispatch(action: { type: string; toast?: Toast; toastId?: string }) {
  switch (action.type) {
    case 'ADD':
      memoryState = { toasts: [action.toast!, ...memoryState.toasts].slice(0, 5) };
      break;
    case 'DISMISS':
      memoryState = { toasts: memoryState.toasts.map(t => t.id === action.toastId ? { ...t, open: false } : t) };
      break;
    case 'REMOVE':
      memoryState = { toasts: memoryState.toasts.filter(t => t.id !== action.toastId) };
      break;
  }
  listeners.forEach(l => l(memoryState));
}

export function toast(props: Omit<Toast, 'id'>) {
  const id = genId();
  const t: Toast = { ...props, id, open: true, onOpenChange: (open) => { if (!open) dispatch({ type: 'DISMISS', toastId: id }); } };
  dispatch({ type: 'ADD', toast: t });
  setTimeout(() => dispatch({ type: 'REMOVE', toastId: id }), props.duration || 4000);
  return id;
}

export function useToast() {
  const [state, setState] = React.useState<ToastState>(memoryState);
  React.useEffect(() => {
    listeners.push(setState);
    return () => { const i = listeners.indexOf(setState); if (i > -1) listeners.splice(i, 1); };
  }, []);
  return { ...state, toast, dismiss: (id: string) => dispatch({ type: 'DISMISS', toastId: id }) };
}
