import type { InjectionKey, Ref } from 'vue'

export interface RedeemActionInterface {
  startTimer: (id: string) => void
  pauseTimer: (id: string) => void
  completeTimer: (id: string) => void
  consumeBanked: (id: string) => void
  addToBanked: (id: string, amount?: number) => void
  completeInstant: (id: string) => void
  incrementCounter: (id: string) => void
  decrementCounter: (id: string) => void
  activateToggle: (id: string) => void
  deactivateToggle: (id: string) => void
  deleteRedeem: (id: string) => void
  resetRedeem: (id: string) => void
  updateNote: (id: string, note: string) => void
}

export const REDEEM_ACTIONS_KEY: InjectionKey<RedeemActionInterface> = Symbol('redeem-actions')
export const CAN_MANAGE_REDEEMS_KEY: InjectionKey<Ref<boolean>> = Symbol('can-manage-redeems')

export function useCanManageRedeems(): Ref<boolean> {
  return inject(CAN_MANAGE_REDEEMS_KEY, ref(false))
}

export function useRedeemActions(): RedeemActionInterface {
  const injected = inject(REDEEM_ACTIONS_KEY, null)
  if (injected) return injected

  // Fallback: use global redeems store
  const store = useRedeemsStore()
  return {
    startTimer: id => store.startTimer(id),
    pauseTimer: id => store.pauseTimer(id),
    completeTimer: id => store.completeTimer(id),
    consumeBanked: id => store.consumeBanked(id),
    addToBanked: (id, amount) => store.addToBanked(id, amount),
    completeInstant: id => store.completeInstant(id),
    incrementCounter: id => store.incrementCounter(id),
    decrementCounter: id => store.decrementCounter(id),
    activateToggle: id => store.activateToggle(id),
    deactivateToggle: id => store.deactivateToggle(id),
    deleteRedeem: id => store.deleteRedeem(id),
    resetRedeem: id => store.resetRedeem(id),
    updateNote: (id, note) => store.updateNote(id, note),
  }
}
