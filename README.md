# EXTPIXEL – Extension Image Resizer

[![Next.js](https://img.shields.io/badge/Next.js-16.1.6-black)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.x-61DAFB)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-Enabled-3178C6)](https://www.typescriptlang.org/)
[![Client-Side Processing](https://img.shields.io/badge/Processing-100%25%20Client--Side-success)]()
[![No Backend](https://img.shields.io/badge/Backend-None-critical)]()
[![Privacy First](https://img.shields.io/badge/Privacy-No%20Uploads-green)]()
[![ZIP Generation](https://img.shields.io/badge/ZIP-Client%20Generated-blue)]()
[![License](https://img.shields.io/badge/License-MIT-lightgrey)]()

EXTPIXEL is a fully client-side image resizer 


All image processing runs inside the browser using the HTML5 Canvas API.  
No images are uploaded. No servers process your files.


## Overview

EXTPIXEL supports:

- Manual croo
- Scaling based cropping 
- preset dimensions (for extensions)
- Multiple resize stuff
- Batch processing (up to 10 images)
- Client side ZIP export

Designed with a retro NES inspired UI and sound effects.


# Core Features

## Preset sizes for extension req  (dev)

Preconfigured pixel dimensions for:

- Chrome Web Store
- Microsoft Edge Add-ons
- Opera Addons

Includes:
- Small and large promo tiles
- Screenshot s (smaal)
- Screenshot Max





## Manual Configuration

### Dimension Input
- Custom width (px)
- Custom height (px)
- Percentage scaling (e.g., 50%, 200%)
- Optional aspect-ratio lock



## Resize Modes

### STRETCH
Scales directly to target width and height.




### AUTO CROP
Scales to fully fill the target area, then center-crops.



### MANUAL CROP
Interactive crop modal with:
- Draggable crop rectangle
- Resizable corner handles
- Live pixel dimension readout




### FIT
Letterbox / pillarbox into the target size.

Background options:
- White
- Black
- Blur

Blur mode:
- Background image scaled to cover
- `ctx.filter = 'blur(32px)'`
- Foreground image drawn sharp and centered



## Batch Processing

- Drag and drop up to 10 images
- Process all in one click




## Download Options

- Download individual PNG files
- Download all results as a ZIP



## Privacy Model

- All files processed in memory
- No API keys
- No uploads
- No external image services
- No storage
- No tracking of image content



# Tech Stack

## Framework
- Next.js 16.1.6 (App Router)

## Language
- TypeScript

## UI / Styling
- NES.css










