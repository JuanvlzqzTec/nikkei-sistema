import { Suspense } from 'react'
import VerifyEmailForm from './_VerifyEmailForm'

export default function VerifyEmailPage() {
  return (
    <Suspense>
      <VerifyEmailForm />
    </Suspense>
  )
}