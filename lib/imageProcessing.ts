export interface CropData {
    x: number
    y: number
    w: number
    h: number
}

export async function loadImg(src: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
        const img = new Image()
        img.onload = () => resolve(img)
        img.onerror = () => reject(new Error('Failed to load image'))
        img.src = src
    })
}

export async function processImage(
    img: HTMLImageElement,
    tw: number,
    th: number,
    mode: 'stretch' | 'autoCrop' | 'manualCrop' | 'fit',
    fitBg: 'white' | 'black' | 'blur',
    cropData?: CropData
): Promise<string> {
    const canvas = document.createElement('canvas')
    canvas.width = tw
    canvas.height = th
    const ctx = canvas.getContext('2d')
    if (!ctx) throw new Error('Failed to get 2D context')

    switch (mode) {
        case 'stretch':
            ctx.drawImage(img, 0, 0, tw, th)
            break

        case 'autoCrop': {
            const scale = Math.max(tw / img.width, th / img.height)
            const sw = tw / scale
            const sh = th / scale
            const sx = (img.width - sw) / 2
            const sy = (img.height - sh) / 2
            ctx.drawImage(img, sx, sy, sw, sh, 0, 0, tw, th)
            break
        }

        case 'manualCrop': {
            const cd = cropData ?? (() => {
                const scale = Math.max(tw / img.width, th / img.height)
                return {
                    x: (img.width - tw / scale) / 2,
                    y: (img.height - th / scale) / 2,
                    w: tw / scale,
                    h: th / scale,
                }
            })()
            ctx.drawImage(img, cd.x, cd.y, cd.w, cd.h, 0, 0, tw, th)
            break
        }

        case 'fit': {
            if (fitBg === 'blur') {
                const bgScale = Math.max(tw / img.width, th / img.height)
                const bgW = img.width * bgScale
                const bgH = img.height * bgScale
                ctx.filter = 'blur(32px)'
                ctx.drawImage(img, (tw - bgW * 1.1) / 2, (th - bgH * 1.1) / 2, bgW * 1.1, bgH * 1.1)
                ctx.filter = 'none'
            } else {
                ctx.fillStyle = fitBg
                ctx.fillRect(0, 0, tw, th)
            }

            const scale = Math.min(tw / img.width, th / img.height)
            const dw = img.width * scale
            const dh = img.height * scale
            ctx.drawImage(img, (tw - dw) / 2, (th - dh) / 2, dw, dh)
            break
        }
    }

    return canvas.toDataURL('image/png')
}
