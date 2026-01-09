# About Us CMS - API Documentation

## Overview

The About Us CMS API provides comprehensive endpoints for managing the About Us page content, including headers, sections, team members, statistics, and SEO metadata.

**Base URL:** `/api/cms/about-us`

**Authentication:** Most endpoints require JWT authentication with Admin or Super Admin roles.

---

## Authentication

### Required Headers

```http
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

### Roles Required
- **Admin** (`ADMIN`)
- **Super Admin** (`SUPER_ADMIN`)

---

## Endpoints

### 1. Create About Us Page

Creates a new About Us page.

**Endpoint:** `POST /cms/about-us`

**Authentication:** Required (Admin/Super Admin)

**Request Body:**

```typescript
{
  headerSection: {
    title: string;          // Required
    subtitle: string;       // Required
    image?: string;         // Optional - URL or base64
    imageAlt?: string;      // Optional
  };
  sections: [               // Required - Array of content sections
    {
      id: string;          // Required - Unique identifier
      title: string;       // Required
      content: string;     // Required - HTML content
      image?: string;      // Optional
      imageAlt?: string;   // Optional
      isActive: boolean;   // Optional - defaults to true
      order: number;       // Optional - defaults to 0
    }
  ];
  teamSection?: {          // Optional
    isActive?: boolean;    // Optional
    title?: string;        // Optional
    subtitle?: string;     // Optional
    description?: string;  // Optional
    members: [             // Array of team members
      {
        id: string;              // Required
        name: string;            // Required
        position: string;        // Required
        image?: string;          // Optional
        imageAlt?: string;       // Optional
        bio?: string;            // Optional
        certifications?: string; // Optional
        isActive: boolean;       // Optional
        order: number;           // Optional
      }
    ]
  };
  statsSection?: {         // Optional
    isActive?: boolean;    // Optional
    stats: [               // Array of statistics
      {
        value: string;     // Required - e.g., "15+"
        label: string;     // Required - e.g., "Years Experience"
      }
    ]
  };
  seo: {                   // Required
    title: string;         // Required
    description: string;   // Required
    keywords?: string[];   // Optional
    ogTitle?: string;      // Optional
    ogDescription?: string; // Optional
    ogImage?: string;      // Optional
    canonicalUrl?: string; // Optional
  };
  isActive?: boolean;      // Optional - defaults to true
}
```

**Response:**

```typescript
{
  success: boolean;
  message: string;
  data: AboutUs;  // Complete About Us object with _id
}
```

**Status Codes:**
- `201` - Created successfully
- `400` - Bad request (validation error)
- `401` - Unauthorized
- `403` - Forbidden (insufficient permissions)

---

### 2. Get All About Us Pages

Retrieves all About Us pages.

**Endpoint:** `GET /cms/about-us`

**Authentication:** Required (Admin/Super Admin)

**Response:**

```typescript
{
  success: boolean;
  message: string;
  data: AboutUs[];  // Array of About Us pages
}
```

**Status Codes:**
- `200` - Success
- `401` - Unauthorized
- `403` - Forbidden

---

### 3. Get Active About Us Page

Retrieves the currently active About Us page (Public endpoint).

**Endpoint:** `GET /cms/about-us/active`

**Authentication:** Not required (Public endpoint)

**Response:**

```typescript
{
  success: boolean;
  message: string;
  data: AboutUs;
}
```

**Status Codes:**
- `200` - Success
- `404` - No active page found

---

### 4. Get Default About Us Page

Retrieves the default About Us page, creating one if it doesn't exist.

**Endpoint:** `GET /cms/about-us/default`

**Authentication:** Required (Admin/Super Admin)

**Response:**

```typescript
{
  success: boolean;
  message: string;
  data: AboutUs;
}
```

**Status Codes:**
- `200` - Success
- `401` - Unauthorized
- `403` - Forbidden

---

### 5. Get About Us Page by ID

Retrieves a specific About Us page by its ID.

**Endpoint:** `GET /cms/about-us/:id`

**Authentication:** Required (Admin/Super Admin)

**URL Parameters:**
- `id` - MongoDB ObjectId of the About Us page

**Response:**

```typescript
{
  success: boolean;
  message: string;
  data: AboutUs;
}
```

**Status Codes:**
- `200` - Success
- `404` - Page not found
- `401` - Unauthorized
- `403` - Forbidden

---

### 6. Update About Us Page

Updates an existing About Us page.

**Endpoint:** `PUT /cms/about-us/:id`

**Authentication:** Required (Admin/Super Admin)

**URL Parameters:**
- `id` - MongoDB ObjectId of the About Us page

**Request Body:** Same as Create (all fields optional)

**Response:**

```typescript
{
  success: boolean;
  message: string;
  data: AboutUs;
}
```

**Status Codes:**
- `200` - Updated successfully
- `400` - Bad request
- `404` - Page not found
- `401` - Unauthorized
- `403` - Forbidden

---

### 7. Update About Us Page with File Upload

Updates an About Us page including image uploads.

**Endpoint:** `PUT /cms/about-us/:id/upload`

**Authentication:** Required (Admin/Super Admin)

**Content-Type:** `multipart/form-data`

**URL Parameters:**
- `id` - MongoDB ObjectId of the About Us page

**Form Data Fields:**

```typescript
{
  // JSON fields (stringified)
  headerSection: string;    // JSON stringified HeaderSection
  sections: string;         // JSON stringified ContentSection[]
  teamSection?: string;     // JSON stringified TeamSection
  statsSection?: string;    // JSON stringified StatsSection
  seo: string;             // JSON stringified SeoMeta
  isActive: string;        // "true" or "false"
  
  // File fields
  headerImage?: File;           // Single file
  sectionImages?: File[];       // Multiple files (max 10)
  teamMemberImages?: File[];    // Multiple files (max 10)
}
```

**Response:**

```typescript
{
  success: boolean;
  message: string;
  data: AboutUs;
}
```

**Status Codes:**
- `200` - Updated successfully
- `400` - Bad request or invalid file
- `404` - Page not found
- `401` - Unauthorized
- `403` - Forbidden

---

### 8. Delete About Us Page

Permanently deletes an About Us page.

**Endpoint:** `DELETE /cms/about-us/:id`

**Authentication:** Required (Admin/Super Admin)

**URL Parameters:**
- `id` - MongoDB ObjectId of the About Us page

**Response:**

```typescript
{
  success: boolean;
  message: string;
  data: AboutUs;  // The deleted page data
}
```

**Status Codes:**
- `200` - Deleted successfully
- `404` - Page not found
- `401` - Unauthorized
- `403` - Forbidden

---

### 9. Toggle About Us Page Status

Toggles the active/inactive status of an About Us page.

**Endpoint:** `POST /cms/about-us/:id/toggle-active`

**Authentication:** Required (Admin/Super Admin)

**URL Parameters:**
- `id` - MongoDB ObjectId of the About Us page

**Response:**

```typescript
{
  success: boolean;
  message: string;  // "About Us page activated/deactivated successfully"
  data: AboutUs;
}
```

**Status Codes:**
- `200` - Status toggled successfully
- `404` - Page not found
- `401` - Unauthorized
- `403` - Forbidden

---

### 10. Duplicate About Us Page

Creates a copy of an existing About Us page.

**Endpoint:** `POST /cms/about-us/:id/duplicate`

**Authentication:** Required (Admin/Super Admin)

**URL Parameters:**
- `id` - MongoDB ObjectId of the About Us page to duplicate

**Response:**

```typescript
{
  success: boolean;
  message: string;
  data: AboutUs;  // The duplicated page (marked as inactive)
}
```

**Status Codes:**
- `201` - Duplicated successfully
- `404` - Original page not found
- `401` - Unauthorized
- `403` - Forbidden

---

### 11. Export About Us Page

Exports a specific About Us page in JSON or PDF format.

**Endpoint:** `GET /cms/about-us/:id/export`

**Authentication:** Required (Admin/Super Admin)

**URL Parameters:**
- `id` - MongoDB ObjectId of the About Us page

**Query Parameters:**
- `format` - Export format: `json` or `pdf` (Required)

**Response (JSON format):**

```typescript
{
  success: boolean;
  message: string;
  data: AboutUs;
}
```

**Response (PDF format):** 
Currently not implemented - returns error message

**Status Codes:**
- `200` - Export successful (JSON)
- `400` - Invalid format or PDF not implemented
- `404` - Page not found
- `401` - Unauthorized
- `403` - Forbidden

---

### 12. Export All About Us Pages

Exports all About Us pages in JSON or PDF format.

**Endpoint:** `GET /cms/about-us/export`

**Authentication:** Required (Admin/Super Admin)

**Query Parameters:**
- `format` - Export format: `json` or `pdf` (Required)

**Response (JSON format):**

```typescript
{
  success: boolean;
  message: string;
  data: AboutUs[];  // Array of all pages
}
```

**Response (PDF format):** 
Currently not implemented - returns error message

**Status Codes:**
- `200` - Export successful (JSON)
- `400` - Invalid format or PDF not implemented
- `401` - Unauthorized
- `403` - Forbidden

---

## Data Types

### AboutUs

```typescript
interface AboutUs {
  _id?: string;
  headerSection: HeaderSection;
  sections: ContentSection[];
  teamSection?: TeamSection;
  statsSection?: StatsSection;
  seo: SeoMeta;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}
```

### HeaderSection

```typescript
interface HeaderSection {
  title: string;
  subtitle: string;
  image?: string;
  imageAlt?: string;
}
```

### ContentSection

```typescript
interface ContentSection {
  id: string;
  title: string;
  content: string;  // HTML content
  image?: string;
  imageAlt?: string;
  isActive: boolean;
  order: number;
}
```

### TeamSection

```typescript
interface TeamSection {
  isActive?: boolean;
  title?: string;
  subtitle?: string;
  description?: string;
  members: TeamMember[];
}
```

### TeamMember

```typescript
interface TeamMember {
  id: string;
  name: string;
  position: string;
  image?: string;
  imageAlt?: string;
  bio?: string;
  certifications?: string;
  isActive: boolean;
  order: number;
}
```

### StatsSection

```typescript
interface StatsSection {
  isActive?: boolean;
  stats: Stat[];
}
```

### Stat

```typescript
interface Stat {
  value: string;
  label: string;
}
```

### SeoMeta

```typescript
interface SeoMeta {
  title: string;
  description: string;
  keywords: string[];
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  canonicalUrl?: string;
}
```

---

## Error Responses

All error responses follow this format:

```typescript
{
  success: false;
  message: string;  // Human-readable error message
  error?: string;   // Additional error details (optional)
}
```

### Common Error Messages

- **Authentication Errors (401):**
  - "Invalid or expired token"
  - "Authentication required"

- **Authorization Errors (403):**
  - "Insufficient permissions"
  - "Admin access required"

- **Not Found Errors (404):**
  - "About Us page not found"
  - "No active About Us page found"

- **Validation Errors (400):**
  - "Invalid request data"
  - "Required fields missing"
  - "Invalid file format"

- **Server Errors (500):**
  - "Internal server error"
  - "Failed to process request"

---

## Usage Examples

### Example 1: Create New About Us Page

```javascript
const response = await fetch('/api/cms/about-us', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_JWT_TOKEN',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    headerSection: {
      title: 'About Personal Wings',
      subtitle: 'EMPOWERING AVIATORS WORLDWIDE',
      image: 'https://example.com/header.jpg',
      imageAlt: 'Aviation training center'
    },
    sections: [
      {
        id: 'mission',
        title: 'Our Mission',
        content: '<p>We provide world-class aviation training...</p>',
        isActive: true,
        order: 1
      }
    ],
    seo: {
      title: 'About Us | Personal Wings',
      description: 'Learn about our aviation training programs',
      keywords: ['aviation', 'training', 'flight school'],
      canonicalUrl: 'https://personalwings.com/about-us'
    },
    isActive: true
  })
});

const data = await response.json();
console.log(data);
```

### Example 2: Update with File Upload

```javascript
const formData = new FormData();

// Add JSON data
formData.append('headerSection', JSON.stringify({
  title: 'Updated Title',
  subtitle: 'Updated Subtitle'
}));

formData.append('sections', JSON.stringify([...]));
formData.append('seo', JSON.stringify({...}));
formData.append('isActive', 'true');

// Add file
const headerImage = document.getElementById('headerImageInput').files[0];
formData.append('headerImage', headerImage);

const response = await fetch('/api/cms/about-us/YOUR_PAGE_ID/upload', {
  method: 'PUT',
  headers: {
    'Authorization': 'Bearer YOUR_JWT_TOKEN'
  },
  body: formData
});

const data = await response.json();
console.log(data);
```

### Example 3: Get Active Page (Public)

```javascript
const response = await fetch('/api/cms/about-us/active');
const data = await response.json();

if (data.success) {
  const aboutUsPage = data.data;
  // Render the page content
}
```

---

## Frontend Integration

### React Hook Example

```typescript
import { useEffect, useState } from 'react';
import { AboutUs } from '@/types/about-us';

export function useAboutUs() {
  const [aboutUs, setAboutUs] = useState<AboutUs | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchAboutUs() {
      try {
        const response = await fetch('/api/cms/about-us/active');
        const data = await response.json();
        
        if (data.success) {
          setAboutUs(data.data);
        } else {
          setError(data.message);
        }
      } catch (err) {
        setError('Failed to load About Us page');
      } finally {
        setLoading(false);
      }
    }

    fetchAboutUs();
  }, []);

  return { aboutUs, loading, error };
}
```

---

## Rate Limiting

API endpoints are rate-limited to prevent abuse:

- **Standard endpoints:** 100 requests per minute
- **Upload endpoints:** 20 requests per minute

Rate limit headers are included in responses:
- `X-RateLimit-Limit` - Maximum requests allowed
- `X-RateLimit-Remaining` - Remaining requests
- `X-RateLimit-Reset` - Time when limit resets (Unix timestamp)

---

## Webhooks (Future)

Webhook support for About Us page events is planned for future releases:

- `about_us.created` - Triggered when a new page is created
- `about_us.updated` - Triggered when a page is updated
- `about_us.deleted` - Triggered when a page is deleted
- `about_us.status_changed` - Triggered when page status changes

---

## Changelog

### Version 1.0.0 (Current)

- Initial release
- CRUD operations for About Us pages
- File upload support
- Export functionality (JSON only)
- SEO metadata management
- Team and statistics sections

### Planned Features

- PDF export functionality
- Bulk operations
- Version history
- Webhook notifications
- Advanced search and filtering
- Multi-language support

---

## Support

For API support and questions:

- **Email:** support@personalwings.com
- **Documentation:** https://docs.personalwings.com
- **GitHub Issues:** https://github.com/personalwings/api/issues

---

**Last Updated:** January 5, 2026



