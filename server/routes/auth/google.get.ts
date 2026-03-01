import { eq } from 'drizzle-orm'
import { users } from '../../database/schema'

export default defineOAuthGoogleEventHandler({
  async onSuccess(event, { user: googleUser }) {
    const existingUsers = await db.select().from(users).where(eq(users.googleId, googleUser.sub))

    let dbUser = existingUsers[0]

    if (dbUser) {
      // Update profile info on each login
      const updated = await db.update(users)
        .set({
          name: googleUser.name,
          avatarUrl: googleUser.picture,
          updatedAt: new Date(),
        })
        .where(eq(users.id, dbUser.id))
        .returning()
      dbUser = updated[0]!
    }
    else {
      // Create new user
      const inserted = await db.insert(users)
        .values({
          googleId: googleUser.sub,
          email: googleUser.email,
          name: googleUser.name,
          avatarUrl: googleUser.picture,
        })
        .returning()
      dbUser = inserted[0]!
    }

    await setUserSession(event, {
      user: {
        id: dbUser.id,
        email: dbUser.email,
        name: dbUser.name,
        avatarUrl: dbUser.avatarUrl,
        isAdmin: dbUser.isAdmin,
      },
    })

    return sendRedirect(event, '/events')
  },
  onError(event, error) {
    console.error('Google OAuth error:', error)
    return sendRedirect(event, '/login?error=auth_failed')
  },
})
