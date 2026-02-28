

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

## Demo






https://github.com/user-attachments/assets/068dcb01-9157-4ad7-ac82-f440cfdeff9e










## Overview

EXTPIXEL supports:

<img width="1904" height="879" alt="image" src="https://github.com/user-attachments/assets/a332aec3-a947-44ac-809a-3739162cf611" />


- Manual croo
- Scaling based cropping 
- preset dimensions (for extensions)
- Multiple resize stuff
- Batch processing (up to 10 images)
- Client side ZIP export

Designed with a retro NES inspired UI and sound effects.


# Core Features

<img width="1302" height="468" alt="image" src="https://github.com/user-attachments/assets/f81f6d76-1811-4a48-a04f-591265a82b31" />


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

<img width="1525" height="856" alt="image" src="https://github.com/user-attachments/assets/fdd6df19-70f4-4835-8da8-9bf0838bf965" />


### Dimension Input
- Custom width (px)
- Custom height (px)
- Percentage scaling (e.g., 50%, 200%)
- Optional aspect-ratio lock



## Resize Modes

### STRETCH
Scales directly to target width and height.

<img width="1481" height="788" alt="image" src="https://github.com/user-attachments/assets/6729042e-bb1d-4d30-83cd-9579748318a4" />




### AUTO CROP
Scales to fully fill the target area, then center-crops.

<img width="1326" height="749" alt="image" src="https://github.com/user-attachments/assets/e5a4bb18-1ddd-455d-b6ae-b36714554e1f" />




### MANUAL CROP
Interactive crop modal with:
- Draggable crop rectangle
- Resizable corner handles
- Live pixel dimension readout

<img width="1155" height="822" alt="image" src="https://github.com/user-attachments/assets/3bf71541-0df8-46c5-bb29-66ac42da234e" />





### FIT
Letterbox / pillarbox into the target size.

Background options:
- White
<img width="639" height="641" alt="image" src="https://github.com/user-attachments/assets/15e352f6-eed9-4852-b611-e58c9490f4b3" />

- Black

<img width="635" height="862" alt="image" src="https://github.com/user-attachments/assets/24fdbde1-3a24-455b-b068-cc06c7f21577" />

- Blur

<img width="658" height="868" alt="image" src="https://github.com/user-attachments/assets/d2382b9e-12b0-4828-a2a6-27e10f037a28" />


Blur mode:
- Background image scaled to cover
- `ctx.filter = 'blur(32px)'`
- Foreground image drawn sharp and centered



## Batch Processing

- Drag and drop up to 10 images
- Process all in one click

<img width="1466" height="562" alt="image" src="https://github.com/user-attachments/assets/9c82a718-0669-4fd0-a541-75e3b16d76e5" />






## Download Options

- Download individual PNG files
<img width="1571" height="831" alt="image" src="https://github.com/user-attachments/assets/72d26d9b-d5af-496f-9e20-c39fd9c40471" />


- Download all results as a ZIP

<img width="1408" height="801" alt="image" src="https://github.com/user-attachments/assets/bbd65ca4-b1d4-441f-8760-337466f0cb5b" />




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

# UI / Styling
- NES.css

# credit
Pixel art source: AnubiArts -: https://anubiarts-info.carrd.co
<img width="1156" height="338" alt="image" src="https://github.com/user-attachments/assets/6c8bdff6-3b63-4522-9140-30cd9f2ed300" />









