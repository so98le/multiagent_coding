import { auth } from "@/lib/auth"

export const MISSING_SESSION_USER_ERROR = "You must be logged in to perform this action."

export class MissingSessionUserError extends Error {
  constructor() {
    super(MISSING_SESSION_USER_ERROR)
    this.name = "MissingSessionUserError"
  }
}

export async function requireSessionUser() {
  const session = await auth()
  const userId = session?.user?.id
  const userRole = session?.user?.role

  if (!userId || !userRole) {
    throw new MissingSessionUserError()
  }

  return {
    id: userId,
    role: userRole,
  }
}
