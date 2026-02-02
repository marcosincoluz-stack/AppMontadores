"use client"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Field,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { login } from "@/app/login/actions"
import { useActionState } from "react"

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"form">) {
  const [state, action, isPending] = useActionState(login, undefined)

  return (
    <form className={cn("flex flex-col gap-6", className)} {...props} action={action}>
      <FieldGroup>
        <div className="flex flex-col items-center gap-1 text-center">
          <h1 className="text-2xl font-bold">Bienvenido</h1>
          <p className="text-muted-foreground text-sm text-balance">
            Introduce tus credenciales para acceder
          </p>
        </div>
        <Field>
          <FieldLabel htmlFor="email">Email</FieldLabel>
          <Input id="email" name="email" type="email" placeholder="m@example.com" required />
        </Field>
        <Field>
          <div className="flex items-center">
            <FieldLabel htmlFor="password">Contraseña</FieldLabel>
          </div>
          <Input id="password" name="password" type="password" required />
        </Field>

        {state?.error && (
          <div className="text-red-500 text-sm font-medium text-center">
            {state.error}
          </div>
        )}

        <Field>
          <Button type="submit" disabled={isPending}>
            {isPending ? "Iniciando..." : "Iniciar Sesión"}
          </Button>
        </Field>
      </FieldGroup>
    </form>
  )
}
