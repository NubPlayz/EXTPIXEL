'use client'
import { useState, useRef, useCallback, useEffect } from 'react'
import ManualCropModal from './ManualCropModal'
import { loadImg, processImage, type CropData } from '@/lib/imageProcessing'
import { downloadDataUrl, downloadResultsAsZip } from '@/lib/download'

import chromeIcon from '../chrome16x16.png'
import edgeIcon from '../edge.png'
import operaIcon from '../opera.png'

type Browser = 'edge' | 'chrome' | 'opera'
type ResizeMode = 'stretch' | 'autoCrop' | 'manualCrop' | 'fit'
type FitBg = 'white' | 'black' | 'blur'

interface Preset {
    label: string
    w: number
    h: number
    tag: string
}
interface UploadedFile {
    file: File
    preview: string
    id: string
}
interface ProcessedResult {
    dataUrl: string
    filename: string
    w: number
    h: number
    id: string
}


const PRESETS: Record<Browser, Preset[]> = {
    edge: [
        { label: 'Small Promo', w: 440, h: 280, tag: 'PROMO' },
        { label: 'Screenshot', w: 1280, h: 800, tag: 'SS' },
        { label: 'Screenshot (S)', w: 640, h: 400, tag: 'SS' },
        { label: 'Large Promo', w: 1400, h: 560, tag: 'PROMO' },
    ],
    chrome: [
        { label: 'Small Promo', w: 440, h: 280, tag: 'PROMO' },
        { label: 'Screenshot', w: 1280, h: 800, tag: 'SS' },
        { label: 'Screenshot (S)', w: 640, h: 400, tag: 'SS' },
        { label: 'Large Promo', w: 1400, h: 560, tag: 'PROMO' },
        { label: 'Marquee Promo', w: 2800, h: 1120, tag: 'PROMO' },
    ],
    opera: [
        { label: 'Promo Pic', w: 300, h: 188, tag: 'PROMO' },
        { label: 'Screenshot', w: 612, h: 408, tag: 'SS' },
        { label: 'Screenshot Max', w: 800, h: 600, tag: 'SS' },
    ],
}

const BROWSER_ICON_PNG: Record<Browser, unknown> = {
    chrome: chromeIcon,
    edge: edgeIcon,
    opera: operaIcon,
}


export default function ImageResizer() {
    const [browser, setBrowser] = useState<Browser>('edge')
    const [targetW, setTargetW] = useState(440)
    const [targetH, setTargetH] = useState(280)
    const [keepAspect, setKeepAspect] = useState(false)
    const [mode, setMode] = useState<ResizeMode>('autoCrop')
    const [fitBg, setFitBg] = useState<FitBg>('blur')
    const [uploads, setUploads] = useState<UploadedFile[]>([])
    const [results, setResults] = useState<ProcessedResult[]>([])
    const [processing, setProcessing] = useState(false)
    const [progress, setProgress] = useState(0)
    const [dragOver, setDragOver] = useState(false)
    const [zipDownloadMode, setZipDownloadMode] = useState(true)

    const clickSoundRef = useRef<HTMLAudioElement | null>(null)

    useEffect(() => {
        if (typeof window === 'undefined') return

        const audio = new Audio('/EXTResizer_sound.m4a')
        audio.preload = 'auto'
        clickSoundRef.current = audio

        const handleClick = (event: MouseEvent) => {
            const target = event.target as HTMLElement | null
            if (!target) return

            const button = target.closest('button,[role="button"]')
            if (!button || !clickSoundRef.current) return

            try {
                clickSoundRef.current.currentTime = 0
                void clickSoundRef.current.play()
            } catch {
              
            }
        }

        document.addEventListener('click', handleClick, true)

        return () => {
            document.removeEventListener('click', handleClick, true)
        }
    }, [])

    
    const [cropQueue, setCropQueue] = useState<UploadedFile[]>([])
    const [currentCropFile, setCurrentCropFile] = useState<UploadedFile | null>(null)
    const pendingCropResultsRef = useRef<ProcessedResult[]>([])

    
    const aspectRef = useRef<number | null>(null)

    const fileInputRef = useRef<HTMLInputElement>(null)

    const addFiles = useCallback((files: File[]) => {
        const images = files.filter(f => f.type.startsWith('image/'))
        const remaining = 10 - uploads.length
        const toAdd = images.slice(0, remaining)
        if (!toAdd.length) return

        const newUploads: UploadedFile[] = toAdd.map(file => ({
            file,
            preview: URL.createObjectURL(file),
            id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        }))
        setUploads(prev => [...prev, ...newUploads])
        setResults([])
    }, [uploads.length])

    const removeUpload = (id: string) => {
        setUploads(prev => {
            const found = prev.find(u => u.id === id)
            if (found) URL.revokeObjectURL(found.preview)
            return prev.filter(u => u.id !== id)
        })
        setResults([])
    }

    const clearAll = () => {
        uploads.forEach(u => URL.revokeObjectURL(u.preview))
        setUploads([])
        setResults([])
    }

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault()
        setDragOver(false)
        addFiles(Array.from(e.dataTransfer.files))
    }

    const selectPreset = (p: Preset) => {
        setTargetW(p.w)
        setTargetH(p.h)
        aspectRef.current = null
    }

    const handleWidthChange = (val: string) => {
        const n = parseInt(val) || 1
        setTargetW(n)
        if (keepAspect && aspectRef.current) {
            setTargetH(Math.round(n / aspectRef.current))
        }
    }

    const handleHeightChange = (val: string) => {
        const n = parseInt(val) || 1
        setTargetH(n)
        if (keepAspect && aspectRef.current) {
            setTargetW(Math.round(n * aspectRef.current))
        }
    }

    const handleScaleBlur = (val: string) => {
        const pct = parseFloat(val)
        if (isNaN(pct) || pct <= 0) return
        const factor = pct / 100
        setTargetW(w => Math.max(1, Math.round(w * factor)))
        setTargetH(h => Math.max(1, Math.round(h * factor)))
    }

    const toggleAspect = () => {
        const next = !keepAspect
        setKeepAspect(next)
        if (next) {
            
            aspectRef.current = targetW / targetH
        } else {
            aspectRef.current = null
        }
    }

     const handleProcess = async () => {
        if (!uploads.length || processing) return
        setResults([])
        setProgress(0)

        if (mode === 'manualCrop') {
            pendingCropResultsRef.current = []
            setCropQueue(uploads.slice(1))
            setCurrentCropFile(uploads[0])
            return
        }

        setProcessing(true)
        const newResults: ProcessedResult[] = []

        for (let i = 0; i < uploads.length; i++) {
            const upload = uploads[i]
            const img = await loadImg(upload.preview)

            if (keepAspect && !aspectRef.current) {
                aspectRef.current = img.width / img.height
            }

            const dataUrl = await processImage(img, targetW, targetH, mode, fitBg)
            const base = upload.file.name.replace(/\.[^.]+$/, '')
            newResults.push({
                dataUrl,
                filename: `${base}_${targetW}x${targetH}.png`,
                w: targetW,
                h: targetH,
                id: upload.id,
            })
            setProgress(Math.round(((i + 1) / uploads.length) * 100))
        }

        setResults(newResults)
        setProcessing(false)
    }

    const handleCropConfirm = async (cropData: CropData) => {
        if (!currentCropFile) return
        const img = await loadImg(currentCropFile.preview)
        const outW = keepAspect ? targetW : Math.max(1, Math.round(cropData.w))
        const outH = keepAspect ? targetH : Math.max(1, Math.round(cropData.h))
        const dataUrl = await processImage(img, outW, outH, 'manualCrop', fitBg, cropData)
        const base = currentCropFile.file.name.replace(/\.[^.]+$/, '')
        const result: ProcessedResult = {
            dataUrl,
            filename: `${base}_${outW}x${outH}.png`,
            w: outW,
            h: outH,
            id: currentCropFile.id,
        }
        pendingCropResultsRef.current.push(result)

        const nextQueue = cropQueue.slice(1)
        if (cropQueue.length > 0) {
            setCropQueue(nextQueue)
            setCurrentCropFile(cropQueue[0])
        } else {
            setCurrentCropFile(null)
            setCropQueue([])
            setResults([...pendingCropResultsRef.current])
        }
    }

    const handleCropCancel = () => {
        setCurrentCropFile(null)
        setCropQueue([])
        if (pendingCropResultsRef.current.length > 0) {
            setResults([...pendingCropResultsRef.current])
        }
    }

    const downloadAllAsZip = async () => {
        if (!results.length) return
        try {
            await downloadResultsAsZip({
                results: results.map(r => ({ dataUrl: r.dataUrl, filename: r.filename })),
                browser,
            })
        } catch {
            results.forEach((r, i) => {
                setTimeout(() => downloadDataUrl(r.dataUrl, r.filename), i * 250)
            })
        }
    }

    const downloadAll = () => {
        if (zipDownloadMode) {
            void downloadAllAsZip()
            return
        }
        results.forEach((r, i) => {
            setTimeout(() => downloadDataUrl(r.dataUrl, r.filename), i * 250)
        })
    }

    const cropQueuePos = uploads.length - cropQueue.length

    return (
        <>
        <main className="page-wrapper" aria-label="EXTPIXEL - EXTENSION IMAGE RESIZER">
           
            <header className="site-header">
                <div className="nes-container is-rounded with-title hero-card">
                    <p className="title">EXTPIXEL - EXTENSION IMAGE RESIZER</p>
                    <div className="hero-content">
                        <div className="hero-copy">
                            <h1>EXTPIXEL</h1>
                            <p className="tagline">EXTENSION IMAGE RESIZER</p>
                            <p className="section-caption">General use & dev ready</p>
                            <div className="privacy-badge">
                                <i className="nes-icon lock is-small"></i>
                                <span>100% CLIENT-SIDE - IMAGES STAY ON YOUR PC</span>
                            </div>
                        </div>
                        <div className="hero-art">
                            <div className="hero-art-frame">
                                <img
                                    src="/assets/gameboy.gif"
                                    alt="Animated pixel art handheld console"
                                    className="hero-art-img"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </header>

    
            <div className="nes-container with-title is-centered select-browser-panel" style={{ marginBottom: '40px' }}>
                <p className="title">SELECT BROWSER</p>
                <p className="section-caption">Tailored for extension development</p>
                <div className="browser-tabs">
                    {(['edge', 'chrome', 'opera'] as Browser[]).map(b => {
                        const icon = BROWSER_ICON_PNG[b]
                        const src = typeof icon === 'string' ? icon : (icon as { src: string }).src

                        return (
                            <button
                                key={b}
                                type="button"
                                className={`nes-btn tab-btn ${browser === b ? 'is-primary' : ''}`}
                                onClick={() => setBrowser(b)}
                            >
                                <span className="tab-btn-content">
                                    <img className="browser-tab-icon" src={src} alt="" aria-hidden="true" />
                                    <span>{b.toUpperCase()}</span>
                                </span>
                            </button>
                        )
                    })}
                </div>

                <div className="preset-grid">
                    {PRESETS[browser].map(p => (
                        <button
                            key={`${p.w}x${p.h}`}
                            type="button"
                            className={`nes-btn is-small ${targetW === p.w && targetH === p.h ? 'is-warning' : ''}`}
                            onClick={() => selectPreset(p)}
                            style={{ display: 'flex', flexDirection: 'column', height: 'auto', padding: '12px' }}
                        >
                            <span style={{ fontSize: '12px' }}>{p.label}</span>
                            <span style={{ fontSize: '10px', opacity: 0.7 }}>{p.w}x{p.h}</span>
                        </button>
                    ))}
                </div>
            </div>


            <div className="nes-container with-title" style={{ marginBottom: '40px' }}>
                <p className="title">CONFIG</p>
                <p className="section-caption">Manual size configuration</p>
                <div className="dimension-inputs">
                    <div className="nes-field">
                        <label htmlFor="width_field">WIDTH (PX)</label>
                        <input
                            type="number"
                            id="width_field"
                            className="nes-input"
                            value={targetW}
                            onChange={e => handleWidthChange(e.target.value)}
                        />
                    </div>
                    <div className="nes-field">
                        <label htmlFor="height_field">HEIGHT (PX)</label>
                        <input
                            type="number"
                            id="height_field"
                            className="nes-input"
                            value={targetH}
                            onChange={e => handleHeightChange(e.target.value)}
                        />
                    </div>
                    <div className="nes-field">
                        <label htmlFor="scale_field">SCALE %</label>
                        <input
                            type="number"
                            id="scale_field"
                            className="nes-input"
                            placeholder="100"
                            onBlur={e => { handleScaleBlur(e.target.value); e.target.value = '100' }}
                        />
                    </div>
                    <button
                        type="button"
                        className={`nes-btn ${keepAspect ? 'is-error' : 'is-disabled'}`}
                        onClick={toggleAspect}
                        style={{ marginBottom: '20px' }}
                    >
                        {keepAspect ? 'LOCK ASPECT ON' : 'LOCK ASPECT OFF'}
                    </button>
                </div>

                <div className="mode-section">
                    <p style={{ fontSize: '12px', marginBottom: '15px' }}>RESIZE MODE:</p>
                            <div className="mode-grid" role="radiogroup" aria-label="Resize mode">
                                {[
                                    { id: 'stretch', icon: '[ ]', label: 'STRETCH' },
                                    { id: 'autoCrop', icon: '<>', label: 'AUTO CROP' },
                                    { id: 'manualCrop', icon: '[]', label: 'MANUAL CROP' },
                                    { id: 'fit', icon: '==', label: 'FIT' },
                                ].map(m => (
                                    <div
                                        key={m.id}
                                        className={`nes-container is-rounded mode-card ${mode === m.id ? 'active' : ''}`}
                                        onClick={() => setMode(m.id as ResizeMode)}
                                        onKeyDown={e => {
                                            if (e.key === 'Enter' || e.key === ' ') {
                                                e.preventDefault()
                                                setMode(m.id as ResizeMode)
                                            }
                                        }}
                                        role="radio"
                                        aria-checked={mode === m.id}
                                        aria-label={`Resize mode ${m.label}`}
                                        tabIndex={0}
                                        style={{ padding: '15px', textAlign: 'center' }}
                                    >
                                        <span style={{ fontSize: '24px', display: 'block', marginBottom: '5px' }}>{m.icon}</span>
                                        <span style={{ fontSize: '10px' }}>{m.label}</span>
                                    </div>
                                ))}
                            </div>

                    {mode === 'fit' && (
                        <div className="nes-container is-rounded" style={{ padding: '15px', marginTop: '10px' }}>
                            <p style={{ fontSize: '10px', marginBottom: '10px' }}>BACKGROUND:</p>
                            <label>
                                <input type="radio" className="nes-radio" name="fit_bg" checked={fitBg === 'white'} onChange={() => setFitBg('white')} />
                                <span>WHITE</span>
                            </label>
                            <label style={{ marginLeft: '20px' }}>
                                <input type="radio" className="nes-radio" name="fit_bg" checked={fitBg === 'black'} onChange={() => setFitBg('black')} />
                                <span>BLACK</span>
                            </label>
                            <label style={{ marginLeft: '20px' }}>
                                <input type="radio" className="nes-radio" name="fit_bg" checked={fitBg === 'blur'} onChange={() => setFitBg('blur')} />
                                <span>BLUR</span>
                            </label>
                        </div>
                    )}
                </div>
            </div>

      
            <div className="nes-container with-title">
                <p className="title">IMAGES ({uploads.length}/10)</p>
                <div
                    className={`upload-zone nes-pointer ${dragOver ? 'drag-over' : ''}`}
                    onClick={() => fileInputRef.current?.click()}
                    onDragEnter={e => {
                        e.preventDefault()
                        setDragOver(true)
                    }}
                    onDragLeave={e => {
                        e.preventDefault()
                        setDragOver(false)
                    }}
                    onDragOver={e => {
                        e.preventDefault()
                        setDragOver(true)
                    }}
                    onDrop={handleDrop}
                    onKeyDown={e => {
                        if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault()
                            fileInputRef.current?.click()
                        }
                    }}
                    role="button"
                    tabIndex={0}
                    aria-label="Upload images"
                >
                    <i className="nes-icon close is-large" style={{ transform: 'rotate(45deg)', marginBottom: '15px' }}></i>
                    <p>DROP IMAGES HERE OR CLICK TO BROWSE</p>
                    <p style={{ fontSize: '8px', opacity: 0.6 }}>PNG, JPG, WEBP, GIF</p>
                </div>
                <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={e => e.target.files && addFiles(Array.from(e.target.files))}
                />

                {uploads.length > 0 && (
                    <div className="previews-grid nes-container is-rounded">
                        {uploads.map(u => (
                            <div key={u.id} className="thumb-item">
                                <img src={u.preview} alt={u.file.name} />
                                <button
                                    type="button"
                                    className="nes-btn is-error is-small"
                                    onClick={(e) => { e.stopPropagation(); removeUpload(u.id); }}
                                    aria-label={`Remove ${u.file.name}`}
                                    style={{ position: 'absolute', top: '-10px', right: '-10px', padding: '2px 8px' }}
                                >
                                    X
                                </button>
                            </div>
                        ))}
                        <div style={{ width: '100%', marginTop: '15px' }}>
                            <button type="button" className="nes-btn is-error is-small" onClick={clearAll}>
                                CLEAR ALL
                            </button>
                        </div>
                    </div>
                )}
            </div>


            <div style={{ textAlign: 'center', margin: '40px 0' }}>
                {processing && (
                    <div className="progress-container">
                        <p style={{ fontSize: '10px', marginBottom: '10px' }}>PROCESSING... {progress}%</p>
                        <progress className="nes-progress is-primary" value={progress} max="100"></progress>
                    </div>
                )}
                <button
                    type="button"
                    className={`nes-btn is-primary ${uploads.length === 0 || processing ? 'is-disabled' : ''}`}
                    onClick={handleProcess}
                    disabled={processing || uploads.length === 0}
                    style={{ padding: '20px 40px' }}
                >
                    {mode === 'manualCrop' ? 'START MANUAL CROP' : 'RESIZE ALL NOW'}
                </button>
            </div>

            {results.length > 0 && (
                <div className="nes-container with-title is-centered">
                    <p className="title">RESULTS</p>
                    <div style={{ marginBottom: '12px' }}>
                        <button
                            type="button"
                            className={`nes-btn is-small ${zipDownloadMode ? 'is-success' : 'is-warning'}`}
                            onClick={() => setZipDownloadMode(prev => !prev)}
                        >
                            {zipDownloadMode ? 'ZIP MODE ON' : 'PNG MODE ON'}
                        </button>
                    </div>
                    <div style={{ marginBottom: '20px' }}>
                        <button type="button" className="nes-btn is-success" onClick={downloadAll}>
                            {zipDownloadMode ? 'DOWNLOAD ALL (.ZIP)' : 'DOWNLOAD ALL (PNGS)'}
                        </button>
                    </div>
                    <div className="results-grid">
                        {results.map(r => (
                            <div key={r.id} className="nes-container is-rounded result-item">
                                <img src={r.dataUrl} alt={r.filename} />
                                <p style={{ fontSize: '8px', margin: '10px 0' }}>{r.w}x{r.h}px</p>
                                <button type="button" className="nes-btn is-primary is-small" onClick={() => downloadDataUrl(r.dataUrl, r.filename)}>
                                    SAVE PNG
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {currentCropFile && (
                <ManualCropModal
                    imageUrl={currentCropFile.preview}
                    targetW={targetW}
                    targetH={targetH}
                    queuePosition={cropQueuePos}
                    totalInQueue={uploads.length}
                    lockAspect={keepAspect}
                    onConfirm={handleCropConfirm}
                    onCancel={handleCropCancel}
                />
            )}

            <footer>
                <p>EXTPIXEL PROJECT - BUILT WITH NES.CSS</p>
                <p>NO DATA IS EVER SENT TO ANY SERVER</p>
                <section className="icon-list footer-socials" aria-label="Social links">
                    <a
                        className="footer-social-link"
                        href="https://github.com/NubPlayz/EXTPIXEL"
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="GitHub"
                        title="GitHub"
                    >
                        <i className="nes-icon github is-large"></i>
                        <span>GITHUB</span>
                    </a>
                    <a
                        className="footer-social-link"
                        href="mailto:scriptouroboros@gmail.com"
                        aria-label="Gmail"
                        title="Gmail"
                    >
                        <i className="nes-icon gmail is-large"></i>
                        <span>GMAIL</span>
                    </a>
                    <a
                        className="footer-social-link"
                        href="https://www.reddit.com/user/Miserable_Advice1986/"
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="Reddit"
                        title="Reddit"
                    >
                        <i className="nes-icon reddit is-large"></i>
                        <span>REDDIT</span>
                    </a>
                    <a
                        className="footer-social-link"
                        href="https://x.com/LilChimmp"
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="Twitter"
                        title="Twitter"
                    >
                        <i className="nes-icon twitter is-large"></i>
                        <span>TWITTER</span>
                    </a>
                    <a
                        className="footer-social-link"
                        href="https://www.youtube.com/@lilChimpChamp/videos"
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="YouTube"
                        title="YouTube"
                    >
                        <i className="nes-icon youtube is-large"></i>
                        <span>YOUTUBE</span>
                    </a>
                </section>
                <p className="footer-credit">
                    Pixel art source:{' '}
                    <a href="https://anubiarts-info.carrd.co" target="_blank" rel="noopener noreferrer">
                        AnubiArts
                    </a>{' '}
                    - CC BY-SA 4.0 - Modified (cropped and resized) - License:{' '}
                    <a href="https://creativecommons.org/licenses/by-sa/4.0/" target="_blank" rel="noopener noreferrer">
                        https://creativecommons.org/licenses/by-sa/4.0/
                    </a>
                </p>
            </footer>
        </main>
        </>
    )
}
