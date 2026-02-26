'use client'

import { useRef, useEffect, useState, useCallback } from 'react'

interface CropData {
    x: number
    y: number
    w: number
    h: number
}

interface Props {
    imageUrl: string
    targetW: number
    targetH: number
    queuePosition: number
    totalInQueue: number
    onConfirm: (cropData: CropData) => void
    onCancel: () => void
}

const CANVAS_SIZE = 580

export default function ManualCropModal({
    imageUrl,
    targetW,
    targetH,
    queuePosition,
    totalInQueue,
    onConfirm,
    onCancel,
}: Props) {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const imgRef = useRef<HTMLImageElement | null>(null)


    const [layout, setLayout] = useState({ imgX: 0, imgY: 0, imgW: 0, imgH: 0, scaleX: 1, scaleY: 1 })


    const [cropRect, setCropRect] = useState({ x: 0, y: 0, w: 100, h: 100 })

    const dragRef = useRef<{ active: boolean; startX: number; startY: number; initCropX: number; initCropY: number }>({
        active: false, startX: 0, startY: 0, initCropX: 0, initCropY: 0,
    })


    const resizeRef = useRef<{ active: boolean; corner: string; startX: number; startY: number; initRect: { x: number; y: number; w: number; h: number } }>({
        active: false, corner: '', startX: 0, startY: 0, initRect: { x: 0, y: 0, w: 0, h: 0 },
    })

    const aspectRatio = targetW / targetH


    useEffect(() => {
        const img = new Image()
        img.onload = () => {
            imgRef.current = img
            const scale = Math.min((CANVAS_SIZE - 40) / img.width, (CANVAS_SIZE - 40) / img.height, 1)
            const imgW = Math.round(img.width * scale)
            const imgH = Math.round(img.height * scale)
            const imgX = (CANVAS_SIZE - imgW) / 2
            const imgY = (CANVAS_SIZE - imgH) / 2

            setLayout({ imgX, imgY, imgW, imgH, scaleX: img.width / imgW, scaleY: img.height / imgH })


            let cw = imgW * 0.75
            let ch = cw / aspectRatio
            if (ch > imgH * 0.75) { ch = imgH * 0.75; cw = ch * aspectRatio }
            setCropRect({
                x: imgX + (imgW - cw) / 2,
                y: imgY + (imgH - ch) / 2,
                w: Math.round(cw),
                h: Math.round(ch),
            })
        }
        img.src = imageUrl
    }, [imageUrl, aspectRatio])


    const draw = useCallback(() => {
        const canvas = canvasRef.current
        const img = imgRef.current
        if (!canvas || !img || layout.imgW === 0) return
        const ctx = canvas.getContext('2d')!

   
        ctx.fillStyle = '#f0f0f0'
        ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE)

  
        ctx.drawImage(img, layout.imgX, layout.imgY, layout.imgW, layout.imgH)
        ctx.fillStyle = 'rgba(255,255,255,0.45)'
        ctx.fillRect(layout.imgX, layout.imgY, layout.imgW, layout.imgH)

 
        const cr = cropRect
        ctx.save()
        ctx.beginPath()
        ctx.rect(cr.x, cr.y, cr.w, cr.h)
        ctx.clip()
        ctx.drawImage(img, layout.imgX, layout.imgY, layout.imgW, layout.imgH)
        ctx.restore()

  
        ctx.strokeStyle = '#209cee'
        ctx.lineWidth = 2
        ctx.strokeRect(cr.x, cr.y, cr.w, cr.h)

   
        ctx.strokeStyle = 'rgba(32,156,238,0.3)'
        ctx.lineWidth = 1
        for (let i = 1; i <= 2; i++) {
            ctx.beginPath(); ctx.moveTo(cr.x + cr.w * i / 3, cr.y); ctx.lineTo(cr.x + cr.w * i / 3, cr.y + cr.h); ctx.stroke()
            ctx.beginPath(); ctx.moveTo(cr.x, cr.y + cr.h * i / 3); ctx.lineTo(cr.x + cr.w, cr.y + cr.h * i / 3); ctx.stroke()
        }

   
        const hs = 8
        ctx.fillStyle = '#209cee'
        const corners = [
            [cr.x, cr.y], [cr.x + cr.w - hs, cr.y],
            [cr.x, cr.y + cr.h - hs], [cr.x + cr.w - hs, cr.y + cr.h - hs],
        ]
        corners.forEach(([cx, cy]) => ctx.fillRect(cx, cy, hs, hs))

   
        const imgCropW = Math.round(cr.w * layout.scaleX)
        const imgCropH = Math.round(cr.h * layout.scaleY)
        ctx.fillStyle = 'rgba(255,255,255,0.8)'
        ctx.fillRect(cr.x, cr.y + cr.h - 20, cr.w, 20)
        ctx.fillStyle = '#212529'
        ctx.font = '7px "Press Start 2P", monospace'
        ctx.textAlign = 'center'
        ctx.fillText(`${imgCropW} × ${imgCropH}`, cr.x + cr.w / 2, cr.y + cr.h - 7)
    }, [cropRect, layout])

    useEffect(() => { draw() }, [draw])


    const clampCrop = useCallback((rect: { x: number; y: number; w: number; h: number }) => {
        const { imgX, imgY, imgW, imgH } = layout
        let { x, y, w, h } = rect
      
        w = Math.max(20, Math.min(w, imgW))
        h = Math.max(20 / aspectRatio, Math.min(h, imgH))
      
        x = Math.max(imgX, Math.min(x, imgX + imgW - w))
        y = Math.max(imgY, Math.min(y, imgY + imgH - h))
        return { x, y, w, h }
    }, [layout, aspectRatio])

    const getCanvasPos = (e: React.MouseEvent<HTMLCanvasElement>) => {
        const rect = canvasRef.current!.getBoundingClientRect()
        const scaleX = CANVAS_SIZE / rect.width
        const scaleY = CANVAS_SIZE / rect.height
        return { x: (e.clientX - rect.left) * scaleX, y: (e.clientY - rect.top) * scaleY }
    }

    const getCorner = (pos: { x: number; y: number }, cr: typeof cropRect) => {
        const hs = 12
        if (pos.x < cr.x + hs && pos.y < cr.y + hs) return 'tl'
        if (pos.x > cr.x + cr.w - hs && pos.y < cr.y + hs) return 'tr'
        if (pos.x < cr.x + hs && pos.y > cr.y + cr.h - hs) return 'bl'
        if (pos.x > cr.x + cr.w - hs && pos.y > cr.y + cr.h - hs) return 'br'
        return null
    }

    const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
        const pos = getCanvasPos(e)
        const corner = getCorner(pos, cropRect)

        if (corner) {
            resizeRef.current = { active: true, corner, startX: pos.x, startY: pos.y, initRect: { ...cropRect } }
        } else if (
            pos.x >= cropRect.x && pos.x <= cropRect.x + cropRect.w &&
            pos.y >= cropRect.y && pos.y <= cropRect.y + cropRect.h
        ) {
            dragRef.current = { active: true, startX: pos.x, startY: pos.y, initCropX: cropRect.x, initCropY: cropRect.y }
        }
    }

    const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
        const pos = getCanvasPos(e)

        if (dragRef.current.active) {
            const dx = pos.x - dragRef.current.startX
            const dy = pos.y - dragRef.current.startY
            setCropRect(r => clampCrop({ ...r, x: dragRef.current.initCropX + dx, y: dragRef.current.initCropY + dy }))
            return
        }

        if (resizeRef.current.active) {
            const dx = pos.x - resizeRef.current.startX
            const dy = pos.y - resizeRef.current.startY
            const init = resizeRef.current.initRect
            const corner = resizeRef.current.corner

            let { x, y, w, h } = init
    
            if (corner === 'br') { w = init.w + dx; h = w / aspectRatio }
            if (corner === 'bl') { w = init.w - dx; h = w / aspectRatio; x = init.x + init.w - w }
            if (corner === 'tr') { w = init.w + dx; h = w / aspectRatio; y = init.y + init.h - h }
            if (corner === 'tl') { w = init.w - dx; h = w / aspectRatio; x = init.x + init.w - w; y = init.y + init.h - h }

            if (w > 20) setCropRect(clampCrop({ x, y, w, h }))
        }
    }

    const handleMouseUp = () => {
        dragRef.current.active = false
        resizeRef.current.active = false
    }

    const getCursor = (e: React.MouseEvent<HTMLCanvasElement>) => {
        const pos = getCanvasPos(e)
        const corner = getCorner(pos, cropRect)
        if (corner === 'tl' || corner === 'br') return 'nwse-resize'
        if (corner === 'tr' || corner === 'bl') return 'nesw-resize'
        if (pos.x >= cropRect.x && pos.x <= cropRect.x + cropRect.w &&
            pos.y >= cropRect.y && pos.y <= cropRect.y + cropRect.h) return 'move'
        return 'default'
    }

    const handleConfirm = () => {
        const imgCropX = Math.round((cropRect.x - layout.imgX) * layout.scaleX)
        const imgCropY = Math.round((cropRect.y - layout.imgY) * layout.scaleY)
        const imgCropW = Math.round(cropRect.w * layout.scaleX)
        const imgCropH = Math.round(cropRect.h * layout.scaleY)
        onConfirm({ x: imgCropX, y: imgCropY, w: imgCropW, h: imgCropH })
    }

    return (
        <div className="modal-backdrop">
            <div className="nes-container is-rounded modal-content with-title">
                <p className="title">✂ MANUAL CROP</p>
                <p style={{ fontSize: '10px', marginBottom: '15px' }}>
                    IMAGE {queuePosition} OF {totalInQueue} &nbsp;•&nbsp;
                    TARGET: {targetW}×{targetH}px
                </p>

                <div className="modal-canvas-wrapper">
                    <canvas
                        ref={canvasRef}
                        width={CANVAS_SIZE}
                        height={CANVAS_SIZE}
                        onMouseDown={handleMouseDown}
                        onMouseMove={(e) => {
                            handleMouseMove(e)
                            if (canvasRef.current) canvasRef.current.style.cursor = getCursor(e)
                        }}
                        onMouseUp={handleMouseUp}
                        onMouseLeave={handleMouseUp}
                    />
                </div>

                <div className="modal-actions" style={{ display: 'flex', gap: '20px', justifyContent: 'center' }}>
                    <button type="button" className="nes-btn is-error" onClick={onCancel}>
                        CANCEL ALL
                    </button>
                    <button type="button" className="nes-btn is-success" onClick={handleConfirm}>
                        {queuePosition < totalInQueue ? `NEXT IMAGE →` : `APPLY CROP ✓`}
                    </button>
                </div>
            </div>
        </div>
    )
}