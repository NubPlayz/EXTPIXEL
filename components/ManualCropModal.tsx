'use client'

import { useEffect, useRef } from 'react'
import Cropper from 'cropperjs'

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
    lockAspect: boolean
    onConfirm: (cropData: CropData) => void
    onCancel: () => void
}

export default function ManualCropModal({
    imageUrl,
    targetW,
    targetH,
    queuePosition,
    totalInQueue,
    lockAspect,
    onConfirm,
    onCancel,
}: Props) {
    const imgRef = useRef<HTMLImageElement | null>(null)

    const cropperRef = useRef<Cropper | null>(null)

    useEffect(() => {
        const img = imgRef.current
        if (!img) return

        cropperRef.current?.destroy()
        cropperRef.current = new Cropper(img, {
            viewMode: 1,
            autoCropArea: 0.9,
            responsive: true,
            background: true,
            guides: true,
            center: true,
            highlight: true,
            movable: true,
            zoomable: true,
            cropBoxMovable: true,
            cropBoxResizable: true,
            aspectRatio: lockAspect ? targetW / targetH : undefined,
        })

        return () => {
            cropperRef.current?.destroy()
            cropperRef.current = null
        }
    }, [imageUrl])

    useEffect(() => {
        if (!cropperRef.current) return
        cropperRef.current.setAspectRatio(lockAspect ? targetW / targetH : NaN)
    }, [lockAspect, targetW, targetH])

    const handleConfirm = () => {
        const cropper = cropperRef.current
        if (!cropper) return
        const data = cropper.getData(true)
        onConfirm({
            x: Math.round(data.x),
            y: Math.round(data.y),
            w: Math.round(data.width),
            h: Math.round(data.height),
        })
    }

    return (
        <>
            <div className="modal-backdrop">
                <div className="nes-container is-rounded modal-content with-title">
                    <p className="title">✂ MANUAL CROP</p>
                    <div className="modal-body">
                        <p style={{ fontSize: '10px', marginBottom: '15px' }}>
                            IMAGE {queuePosition} OF {totalInQueue} &nbsp;•&nbsp;
                            TARGET: {targetW}×{targetH}px
                        </p>

                        <div className="modal-canvas-wrapper">
                            <div className="manual-crop-area manual-cropper-area">
                                <img ref={imgRef} src={imageUrl} alt="Manual crop" />
                            </div>
                        </div>
                    </div>

                    <div className="modal-actions" style={{ display: 'flex', gap: '20px', justifyContent: 'center' }}>
                        <button type="button" className="nes-btn is-error" onClick={onCancel}>
                            CANCEL ALL
                        </button>
                        <button type="button" className="nes-btn is-success" onClick={handleConfirm}>
                            {queuePosition < totalInQueue ? `NEXT IMAGE →` : `APPLY CROP`}
                        </button>
                    </div>
                </div>
            </div>
        </>
    )
}