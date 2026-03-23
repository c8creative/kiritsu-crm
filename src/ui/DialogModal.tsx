import { MdClose, MdWarning, MdInfo } from 'react-icons/md'

export type DialogConfig = {
  type: 'alert' | 'confirm'
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  isDestructive?: boolean
  onConfirm: () => void
  onCancel: () => void
}

export default function DialogModal({ config }: { config: DialogConfig }) {
  if (!config) return null
  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl dark:bg-boxdark">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            {config.isDestructive ? (
              <div className="rounded-full bg-danger/10 p-2 text-danger">
                <MdWarning size={24} />
              </div>
            ) : (
              <div className="rounded-full bg-primary/10 p-2 text-primary">
                <MdInfo size={24} />
              </div>
            )}
            <h3 className="text-xl font-semibold text-black dark:text-white">{config.title}</h3>
          </div>
          <button onClick={config.onCancel} className="text-body-color hover:text-black dark:hover:text-white transition">
            <MdClose size={24} />
          </button>
        </div>
        <p className="text-body-color dark:text-bodydark mb-6 leading-relaxed">
          {config.message}
        </p>
        <div className="flex justify-end gap-3">
          {config.type === 'confirm' && (
             <button 
               onClick={config.onCancel} 
               className="rounded-lg px-4 py-2 font-medium text-black border border-stroke hover:bg-gray transition dark:text-white dark:border-strokedark dark:hover:bg-meta-4"
             >
               {config.cancelText || 'Cancel'}
             </button>
          )}
          <button 
            onClick={config.onConfirm} 
            className={`rounded-lg px-6 py-2 font-medium text-white shadow-md transition ${
              config.isDestructive ? 'bg-danger hover:bg-opacity-80' : 'bg-primary hover:bg-opacity-90'
            }`}
          >
            {config.confirmText || 'OK'}
          </button>
        </div>
      </div>
    </div>
  )
}
