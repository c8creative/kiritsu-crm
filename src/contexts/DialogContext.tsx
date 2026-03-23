import { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import DialogModal, { DialogConfig } from '../ui/DialogModal';

type DialogContextType = {
  alert: (title: string, message: string, options?: { isDestructive?: boolean, confirmText?: string }) => Promise<void>;
  confirm: (title: string, message: string, options?: { isDestructive?: boolean, confirmText?: string, cancelText?: string }) => Promise<boolean>;
};

const DialogContext = createContext<DialogContextType | undefined>(undefined);

export const useDialog = () => {
  const context = useContext(DialogContext);
  if (!context) throw new Error('useDialog must be used within a DialogProvider');
  return context;
};

export const DialogProvider = ({ children }: { children: ReactNode }) => {
  const [dialogConfig, setDialogConfig] = useState<DialogConfig | null>(null);

  const alert = useCallback((title: string, message: string, options: any = {}) => {
    return new Promise<void>((resolve) => {
      setDialogConfig({
        type: 'alert',
        title,
        message,
        ...options,
        onConfirm: () => {
          setDialogConfig(null);
          resolve();
        },
        onCancel: () => {
          setDialogConfig(null);
          resolve();
        }
      });
    });
  }, []);

  const confirm = useCallback((title: string, message: string, options: any = {}) => {
    return new Promise<boolean>((resolve) => {
      setDialogConfig({
        type: 'confirm',
        title,
        message,
        ...options,
        onConfirm: () => {
          setDialogConfig(null);
          resolve(true);
        },
        onCancel: () => {
          setDialogConfig(null);
          resolve(false);
        }
      });
    });
  }, []);

  return (
    <DialogContext.Provider value={{ alert, confirm }}>
      {children}
      {dialogConfig && <DialogModal config={dialogConfig} />}
    </DialogContext.Provider>
  );
};
