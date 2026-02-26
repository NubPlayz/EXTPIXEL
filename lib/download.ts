import JSZip from 'jszip'

export interface ZipEntryLike {
    dataUrl: string
    filename: string
}

export function downloadDataUrl(dataUrl: string, filename: string) {
    const a = document.createElement('a')
    a.href = dataUrl
    a.download = filename
    a.click()
}

export async function downloadResultsAsZip(options: {
    results: ZipEntryLike[]
    browser: string
    zipNamePrefix?: string
}) {
    const { results, browser, zipNamePrefix = 'extpixel' } = options
    if (!results.length) return

    const zip = new JSZip()
    for (const r of results) {
        const res = await fetch(r.dataUrl)
        const blob = await res.blob()
        zip.file(r.filename, blob)
    }

    const content = await zip.generateAsync({ type: 'blob' })
    const zipUrl = URL.createObjectURL(content)
    const a = document.createElement('a')
    a.href = zipUrl
    a.download = `${zipNamePrefix}_${browser}_${results.length}_images.zip`
    a.click()
    setTimeout(() => URL.revokeObjectURL(zipUrl), 1000)
}
