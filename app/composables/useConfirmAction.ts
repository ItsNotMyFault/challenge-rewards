export function useConfirmAction() {
  const isOpen = ref(false)
  const title = ref('')
  const message = ref('')
  const color = ref<'primary' | 'error' | 'success' | 'warning'>('primary')
  const confirmLabel = ref('Confirm')
  const confirmIcon = ref<string | undefined>(undefined)

  let pendingAction: (() => void) | null = null

  function requestConfirm(opts: {
    title: string
    message: string
    color?: 'primary' | 'error' | 'success' | 'warning'
    confirmLabel?: string
    confirmIcon?: string
    action: () => void
  }) {
    title.value = opts.title
    message.value = opts.message
    color.value = opts.color ?? 'primary'
    confirmLabel.value = opts.confirmLabel ?? 'Confirm'
    confirmIcon.value = opts.confirmIcon
    pendingAction = opts.action
    isOpen.value = true
  }

  function onConfirm() {
    pendingAction?.()
    pendingAction = null
    isOpen.value = false
  }

  function onCancel() {
    pendingAction = null
    isOpen.value = false
  }

  return { isOpen, title, message, color, confirmLabel, confirmIcon, requestConfirm, onConfirm, onCancel }
}
