'use client'

import { useCallback } from 'react'
import { DRAFT_STORAGE_KEY } from './_constants'
import type { WizardData, WizardDraft } from './_types'
import { WIZARD_INITIAL_DATA } from './_types'

export function useWizardStorage() {
  const saveDraft = useCallback((data: WizardData, currentStep: number) => {
    if (typeof window === 'undefined') return

    try {
      const draft: WizardDraft = {
        data,
        currentStep,
        savedAt: new Date().toISOString(),
      }
      localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(draft))
    } catch (err) {
      console.error('No se pudo guardar el borrador:', err)
    }
  }, [])

  const loadDraft = useCallback((): WizardDraft | null => {
    if (typeof window === 'undefined') return null

    try {
      const raw = localStorage.getItem(DRAFT_STORAGE_KEY)
      if (!raw) return null

      const parsed = JSON.parse(raw) as WizardDraft

      if (
        !parsed ||
        typeof parsed !== 'object' ||
        !parsed.data ||
        typeof parsed.currentStep !== 'number'
      ) {
        return null
      }

      const mergedData: WizardData = {
        ...WIZARD_INITIAL_DATA,
        ...parsed.data,
      }

      return {
        data: mergedData,
        currentStep: parsed.currentStep,
        savedAt: parsed.savedAt,
      }
    } catch (err) {
      console.error('Error al leer el borrador:', err)
      return null
    }
  }, [])

  const clearDraft = useCallback(() => {
    if (typeof window === 'undefined') return

    try {
      localStorage.removeItem(DRAFT_STORAGE_KEY)
    } catch (err) {
      console.error('Error al limpiar el borrador:', err)
    }
  }, [])

  const hasDraft = useCallback((): boolean => {
    if (typeof window === 'undefined') return false
    return localStorage.getItem(DRAFT_STORAGE_KEY) !== null
  }, [])

  return {
    saveDraft,
    loadDraft,
    clearDraft,
    hasDraft,
  }
}