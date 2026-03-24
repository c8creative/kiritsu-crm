import { MdClose } from 'react-icons/md'
import CsvImport from './CsvImport'

type Props = {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => Promise<void> | void
}

export default function ImportLeadsModal({ isOpen, onClose, onSuccess }: Props) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-xl bg-white shadow-2xl dark:bg-boxdark">
        <div className="sticky top-0 z-50 flex items-center justify-between border-b border-stroke bg-white px-6 py-4 dark:border-strokedark dark:bg-boxdark">
          <h3 className="text-xl font-bold text-black dark:text-white">Import Leads</h3>
          <button
            onClick={onClose}
            className="text-body-color hover:text-black dark:text-bodydark dark:hover:text-white transition-colors p-1 rounded-full hover:bg-gray-2 dark:hover:bg-meta-4"
          >
            <MdClose size={24} />
          </button>
        </div>
        <div className="p-6">
          <CsvImport onImported={async () => {
            await onSuccess()
            onClose()
          }} />
        </div>
      </div>
    </div>
  )
}
