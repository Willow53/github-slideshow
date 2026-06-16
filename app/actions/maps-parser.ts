'use server'

import * as cheerio from 'cheerio'

interface ParsedPlace {
  name: string
  address?: string
  category?: string
  latitude?: string
  longitude?: string
}

export async function parseGoogleMapsUrl(url: string): Promise<ParsedPlace[]> {
  try {
    // Follow the short URL to get the full URL
    const response = await fetch(url, {
      redirect: 'follow',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      },
    })
    
    const html = await response.text()
    const $ = cheerio.load(html)
    
    const places: ParsedPlace[] = []
    
    // Try to extract data from meta tags and JSON-LD
    const scriptTags = $('script').toArray()
    
    for (const script of scriptTags) {
      const content = $(script).html()
      if (!content) continue
      
      // Look for place data in various formats
      try {
        // Try to find window.APP_INITIALIZATION_STATE or similar
        if (content.includes('window.APP_INITIALIZATION_STATE')) {
          const matches = content.matchAll(/\["([^"]+)",\s*null,\s*null,\s*null,\s*null,\s*null,\s*null,\s*\[(-?\d+\.\d+),\s*(-?\d+\.\d+)\]/g)
          for (const match of matches) {
            places.push({
              name: match[1],
              latitude: match[2],
              longitude: match[3],
            })
          }
        }
        
        // Try JSON-LD
        if (content.includes('@type') && content.includes('Place')) {
          const jsonLd = JSON.parse(content)
          if (Array.isArray(jsonLd)) {
            for (const item of jsonLd) {
              if (item['@type'] === 'Place' || item['@type'] === 'LocalBusiness') {
                places.push({
                  name: item.name,
                  address: item.address?.streetAddress || item.address,
                  latitude: item.geo?.latitude?.toString(),
                  longitude: item.geo?.longitude?.toString(),
                })
              }
            }
          } else if (jsonLd['@type'] === 'Place' || jsonLd['@type'] === 'LocalBusiness') {
            places.push({
              name: jsonLd.name,
              address: jsonLd.address?.streetAddress || jsonLd.address,
              latitude: jsonLd.geo?.latitude?.toString(),
              longitude: jsonLd.geo?.longitude?.toString(),
            })
          }
        }
      } catch {
        // Continue parsing other scripts
      }
    }
    
    // Also try to extract from aria-label attributes (common in Google Maps)
    $('[aria-label]').each((_, el) => {
      const label = $(el).attr('aria-label')
      if (label && label.length > 3 && label.length < 200) {
        // Check if it looks like a place name
        if (!label.includes('Search') && !label.includes('Menu') && !label.includes('Close')) {
          const existing = places.find(p => p.name === label)
          if (!existing) {
            places.push({ name: label })
          }
        }
      }
    })
    
    // Remove duplicates
    const unique = places.filter((place, index, self) =>
      index === self.findIndex(p => p.name === place.name)
    )
    
    return unique
  } catch (error) {
    console.error('Error parsing Google Maps URL:', error)
    return []
  }
}

// Extract city and country from a Google Maps list URL
export async function extractLocationFromUrl(url: string): Promise<{ city: string; country: string } | null> {
  try {
    const response = await fetch(url, {
      redirect: 'follow',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      },
    })
    
    const finalUrl = response.url
    const html = await response.text()
    const $ = cheerio.load(html)
    
    // Try to extract from URL (e.g., /maps/place/Tokyo,+Japan)
    const urlMatch = finalUrl.match(/\/maps\/place\/([^/]+)/)
    if (urlMatch) {
      const location = decodeURIComponent(urlMatch[1]).replace(/\+/g, ' ')
      const parts = location.split(',').map(p => p.trim())
      if (parts.length >= 2) {
        return { city: parts[0], country: parts[parts.length - 1] }
      }
    }
    
    // Try meta tags
    const ogTitle = $('meta[property="og:title"]').attr('content')
    if (ogTitle) {
      const parts = ogTitle.split(' - ')
      if (parts.length > 1) {
        const locationPart = parts[parts.length - 1]
        const locParts = locationPart.split(',').map(p => p.trim())
        if (locParts.length >= 2) {
          return { city: locParts[0], country: locParts[locParts.length - 1] }
        }
      }
    }
    
    return null
  } catch {
    return null
  }
}
