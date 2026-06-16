'use server'

import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { guides, places, purchases, user } from '@/lib/db/schema'
import { and, desc, eq, ilike, or } from 'drizzle-orm'
import { headers } from 'next/headers'
import { revalidatePath } from 'next/cache'

async function getUserId() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) throw new Error('Unauthorized')
  return session.user.id
}

export async function getSession() {
  const session = await auth.api.getSession({ headers: await headers() })
  return session
}

// Guide CRUD operations

export async function createGuide(data: {
  title: string
  description?: string
  city: string
  country: string
  priceInCents: number
  mapsUrl?: string
}) {
  const userId = await getUserId()
  
  const [guide] = await db
    .insert(guides)
    .values({
      ...data,
      userId,
    })
    .returning()
  
  revalidatePath('/dashboard')
  return guide
}

export async function updateGuide(
  guideId: number,
  data: Partial<{
    title: string
    description: string
    city: string
    country: string
    priceInCents: number
    coverImage: string
    mapsUrl: string
    isPublished: boolean
  }>
) {
  const userId = await getUserId()
  
  const [guide] = await db
    .update(guides)
    .set({ ...data, updatedAt: new Date() })
    .where(and(eq(guides.id, guideId), eq(guides.userId, userId)))
    .returning()
  
  revalidatePath('/dashboard')
  revalidatePath(`/guide/${guideId}`)
  return guide
}

export async function deleteGuide(guideId: number) {
  const userId = await getUserId()
  
  // Delete places first
  await db.delete(places).where(eq(places.guideId, guideId))
  
  // Delete guide
  await db.delete(guides).where(and(eq(guides.id, guideId), eq(guides.userId, userId)))
  
  revalidatePath('/dashboard')
}

export async function getMyGuides() {
  const userId = await getUserId()
  
  return db
    .select()
    .from(guides)
    .where(eq(guides.userId, userId))
    .orderBy(desc(guides.createdAt))
}

export async function getGuideById(guideId: number) {
  const [guide] = await db
    .select()
    .from(guides)
    .where(eq(guides.id, guideId))
    .limit(1)
  
  return guide
}

export async function getGuideWithPlaces(guideId: number) {
  const [guide] = await db
    .select()
    .from(guides)
    .where(eq(guides.id, guideId))
    .limit(1)
  
  if (!guide) return null
  
  const guidePlaces = await db
    .select()
    .from(places)
    .where(eq(places.guideId, guideId))
    .orderBy(places.name)
  
  // Get seller info
  const [seller] = await db
    .select({ name: user.name, id: user.id })
    .from(user)
    .where(eq(user.id, guide.userId))
    .limit(1)
  
  return { ...guide, places: guidePlaces, seller }
}

// Places operations

export async function addPlacesToGuide(guideId: number, placesData: Array<{
  name: string
  address?: string
  category?: string
  notes?: string
  latitude?: string
  longitude?: string
  placeId?: string
}>) {
  const userId = await getUserId()
  
  // Verify ownership
  const [guide] = await db
    .select()
    .from(guides)
    .where(and(eq(guides.id, guideId), eq(guides.userId, userId)))
    .limit(1)
  
  if (!guide) throw new Error('Guide not found')
  
  if (placesData.length > 0) {
    await db.insert(places).values(
      placesData.map((p) => ({
        guideId,
        name: p.name,
        address: p.address,
        category: p.category,
        notes: p.notes,
        latitude: p.latitude,
        longitude: p.longitude,
        placeId: p.placeId,
      }))
    )
  }
  
  revalidatePath('/dashboard')
  revalidatePath(`/guide/${guideId}`)
}

export async function getPlacesForGuide(guideId: number) {
  return db
    .select()
    .from(places)
    .where(eq(places.guideId, guideId))
    .orderBy(places.name)
}

// Marketplace queries

export async function getPublishedGuides(search?: string) {
  try {
    if (search) {
      return db
        .select({
          guide: guides,
          seller: { name: user.name, id: user.id },
        })
        .from(guides)
        .innerJoin(user, eq(guides.userId, user.id))
        .where(
          and(
            eq(guides.isPublished, true),
            or(
              ilike(guides.city, `%${search}%`),
              ilike(guides.country, `%${search}%`),
              ilike(guides.title, `%${search}%`)
            )
          )
        )
        .orderBy(desc(guides.createdAt))
    }
    
    return db
      .select({
        guide: guides,
        seller: { name: user.name, id: user.id },
      })
      .from(guides)
      .innerJoin(user, eq(guides.userId, user.id))
      .where(eq(guides.isPublished, true))
      .orderBy(desc(guides.createdAt))
  } catch (error) {
    console.error('[v0] getPublishedGuides error:', error)
    // Return empty array if database is not available
    return []
  }
}

// Purchase operations

export async function checkPurchase(guideId: number) {
  try {
    const userId = await getUserId()
    
    const [purchase] = await db
      .select()
      .from(purchases)
      .where(and(eq(purchases.guideId, guideId), eq(purchases.userId, userId)))
      .limit(1)
    
    return !!purchase
  } catch {
    return false
  }
}

export async function isGuideOwner(guideId: number) {
  try {
    const userId = await getUserId()
    
    const [guide] = await db
      .select()
      .from(guides)
      .where(and(eq(guides.id, guideId), eq(guides.userId, userId)))
      .limit(1)
    
    return !!guide
  } catch {
    return false
  }
}

export async function recordPurchase(
  guideId: number,
  stripeSessionId: string,
  amountPaid: number
) {
  const userId = await getUserId()
  
  const [purchase] = await db
    .insert(purchases)
    .values({
      userId,
      guideId,
      stripeSessionId,
      amountPaid,
    })
    .returning()
  
  return purchase
}

export async function getMyPurchases() {
  const userId = await getUserId()
  
  return db
    .select({
      purchase: purchases,
      guide: guides,
    })
    .from(purchases)
    .innerJoin(guides, eq(purchases.guideId, guides.id))
    .where(eq(purchases.userId, userId))
    .orderBy(desc(purchases.createdAt))
}
