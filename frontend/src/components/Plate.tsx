import { useState, useEffect, useRef } from "react"
import type React from "react"
import { motion } from "framer-motion"

interface PlateProps {
    className?: string // Accepts Tailwind classes for the SVG
    pathDataTemplate?: string // Template for SVG path
    simplifiedPathTemplate?: string // Simplified template for small widths
    wThreshold?: number // Minimum width to use full path
    children?: React.ReactNode
}

const Plate: React.FC<PlateProps> = ({
    className = "",
    pathDataTemplate,
    simplifiedPathTemplate,
    wThreshold: wThreshold = 128,
    children,
}) => {
    // Refs/States
    // In this Vite-based app we don't have next/navigation; use window.location.pathname as a simple route key
    const [path, setPath] = useState(() => typeof window !== "undefined" ? window.location.pathname : "/")
    const containerRef = useRef<HTMLDivElement>(null)
    const [dim, setDims] = useState({ width: 0, height: 0 })
    // Compute mouse position relative to this Plate in render
    // unique ids
    const uid = Math.random().toString(36).slice(2, 9)
    const [gradientId] = useState(() => `spotlight-gradient-${uid}`)
    const [maskId] = useState(() => `spotlight-mask-${uid}`)

    // Use a local mouse position hook so this component works without the original context
    const useLocalMouse = () => {
        const [pos, setPos] = useState({ x: 0, y: 0 })
        useEffect(() => {
            const handler = (e: MouseEvent) => setPos({ x: e.clientX, y: e.clientY })
            window.addEventListener("mousemove", handler)
            return () => window.removeEventListener("mousemove", handler)
        }, [])
        return pos
    }
    const globalMouse = useLocalMouse()
    // Update dim on window resize
    useEffect(() => {
        const updateDims = () => {
        if (containerRef.current) setDims({ width: containerRef.current.clientWidth, height: containerRef.current.clientHeight,})
        }
        updateDims() // Initial call
        const observer = new ResizeObserver(() => updateDims())
        if (containerRef.current) observer.observe(containerRef.current)
        return () => observer.disconnect()
    }, [])

    // Keep `path` in sync with location changes (minimal replacement for Next's usePathname)
    useEffect(() => {
        const onPop = () => setPath(window.location.pathname)
        window.addEventListener("popstate", onPop)
        return () => window.removeEventListener("popstate", onPop)
    }, [])


    let mousePos = { x: 0, y: 0 };
    if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        mousePos = {
            x: globalMouse.x - rect.left,
            y: globalMouse.y - rect.top
        };
    }

    const s = 64
    const replacements: Record<string, number> = {
        "ts-4": 4 * s,
        "ts-3": 3 * s,
        "ts-2": 2 * s,
        "ts-1/2": 0.5 * s,
        ts: s,
        "wm-L2": dim.width / 2 - 2 * s,
        "wm-L1": dim.width / 2 - s,
        wm: dim.width / 2,
        hm: dim.height / 2,
        "width-L2": dim.width - 2 * s,
        "width-L1": dim.width - s,
        "width-L.5": dim.width - 0.5 * s,
        width: dim.width,
        "height-L4": dim.height - 4 * s,
        "height-L3": dim.height - 3 * s,
        "height-L2": dim.height - 2 * s,
        "height-L1": dim.height - s,
        "height-L.5": dim.height - 0.5 * s,
        height: dim.height,
    }

    // Determine which template to use based on width
    const templateToUse = dim.width < wThreshold && simplifiedPathTemplate ? simplifiedPathTemplate : pathDataTemplate
    // Replace placeholders in pathDataTemplate
    const pathData = templateToUse?.replace(
        /\b(ts-4|ts-3|ts-2|ts-1\/2|ts|wm-L2|wm-L1|wm|hm|width-L2|width-L1|width-L.5|width|height-L4|height-L3|height-L2|height-L1|height-L.5|height)\b/g,
        (match) => replacements[match]?.toString(),
        ) || ""
    // Extracting stroke values from className
    const strokeColorMatch = className.match(/stroke-\[(.*?)\]/)
    const strokeColor = strokeColorMatch ? strokeColorMatch[1] : "#FECD66"
    const fillMatch = className.match(/fill-\[(.*?)\]/)
    const fill = fillMatch ? fillMatch[1] : "none"
    const strokeWidthMatch = className.match(/stroke-(\d+)/)
    const strokeWidth = strokeWidthMatch ? Number.parseInt(strokeWidthMatch[1]) : 4

    return (
        <div ref={containerRef} className={`${className} relative`}> 
            <motion.div className="w-full h-full" key={path}
                initial={{ opacity: 0}} animate={{ opacity: 1}} transition={{ duration: 1, ease: 'easeOut', delay: 0.1 }}
            >
                <svg width={dim.width} height={dim.height} className="absolute top-0 left-0 z-0">
                    {/* spotlight radial gradient */}
                    <defs>
                        <radialGradient
                            id={gradientId}
                            cx={mousePos.x}
                            cy={mousePos.y}
                            r="300"
                            gradientUnits="userSpaceOnUse"
                        >
                            <stop offset="0%" stopColor="white" stopOpacity="1" />
                            <stop offset="20%" stopColor="white" stopOpacity="0.8" />
                            <stop offset="100%" stopColor="white" stopOpacity="0" />
                        </radialGradient>
                        {/* mask only stroke */}
                        <mask id={maskId}>
                            <rect x="0" y="0" width={dim.width} height={dim.height} fill="white" opacity="0.4" />
                            <circle cx={mousePos.x} cy={mousePos.y} r="300" fill={`url(#${gradientId})`} />
                        </mask>
                    </defs>
                    {fill !== "none" && <path d={pathData} fill={fill} />} {/* filled path */}
                    <path
                        d={pathData}
                        fill="none"
                        stroke={strokeColor}
                        strokeWidth={strokeWidth}
                        mask={`url(#${maskId})`}
                    />{" "}
                    {/* Stroke path with spotlight effect */}
                </svg>
                <div className="h-full w-full">{children}</div>
            </motion.div>
        </div>
    )
}

export default Plate
