'use client'

import { useEffect, useRef } from 'react'
import type { Project } from '@/lib/supabase'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type D3Any = any

declare global {
  interface Window {
    d3: D3Any
    topojson: { feature: (topology: unknown, object: unknown) => { features: GeoFeature[] } }
  }
}

type GeoFeature = { id: number | string; type: string; geometry: unknown; properties: unknown }

const ID_TO_A3: Record<string, string> = {
  "004":"AFG","008":"ALB","012":"DZA","024":"AGO","032":"ARG","036":"AUS","040":"AUT",
  "050":"BGD","056":"BEL","068":"BOL","076":"BRA","100":"BGR","124":"CAN","152":"CHL",
  "156":"CHN","170":"COL","188":"CRI","191":"HRV","203":"CZE","208":"DNK","231":"ETH",
  "246":"FIN","250":"FRA","276":"DEU","288":"GHA","300":"GRC","348":"HUN","356":"IND",
  "360":"IDN","364":"IRN","368":"IRQ","372":"IRL","376":"ISR","380":"ITA","392":"JPN",
  "404":"KEN","410":"KOR","414":"KWT","458":"MYS","484":"MEX","504":"MAR","528":"NLD",
  "554":"NZL","566":"NGA","578":"NOR","586":"PAK","604":"PER","608":"PHL","616":"POL",
  "620":"PRT","642":"ROU","643":"RUS","682":"SAU","702":"SGP","704":"VNM","710":"ZAF",
  "724":"ESP","752":"SWE","756":"CHE","764":"THA","784":"ARE","792":"TUR","804":"UKR",
  "818":"EGY","826":"GBR","834":"TZA","840":"USA","858":"URY","862":"VEN","894":"ZMB",
}

const CENTROIDS: Record<string, [number, number]> = {
  DEU:[10.45,51.16], AUT:[14.55,47.52], CHE:[8.23,46.82], FRA:[2.21,46.23], ESP:[-3.75,40.46],
  PRT:[-8.22,39.4], ITA:[12.57,41.87], GBR:[-3.44,55.38], IRL:[-8.24,53.41], NLD:[5.29,52.13],
  BEL:[4.47,50.5], DNK:[9.5,56.26], SWE:[18.64,60.13], NOR:[8.47,60.47], FIN:[25.75,61.92],
  POL:[19.15,51.92], CZE:[15.47,49.82], GRC:[21.82,39.07], TUR:[35.24,38.96], ARE:[53.85,23.42],
  SAU:[45.08,23.89], ISR:[34.85,31.05], EGY:[30.8,26.82], ZAF:[22.94,-30.56], KEN:[37.91,-0.02],
  IND:[78.96,20.59], CHN:[104.2,35.86], JPN:[138.25,36.2], KOR:[127.77,35.91], SGP:[103.82,1.35],
  AUS:[133.78,-25.27], USA:[-95.71,39.83], CAN:[-106.35,56.13], BRA:[-51.92,-14.24],
  MEX:[-102.55,23.63], ARG:[-63.62,-38.42], NGA:[8.68,9.08], GHA:[-1.02,7.95],
  MAR:[-7.09,31.79], ETH:[40.49,9.14], TZA:[34.89,-6.37],
}

const SANS = "var(--font-inter), -apple-system, BlinkMacSystemFont, system-ui, sans-serif"

type Props = {
  projects: (Project & { project_images: { url: string; sort_order: number }[] })[]
  accent?: string
}

export default function Map({ projects, accent = '#1e3a5f' }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const modalRef = useRef<HTMLDivElement>(null)

  const byCountry: Record<string, typeof projects> = {}
  projects.forEach(p => {
    if (!byCountry[p.iso]) byCountry[p.iso] = []
    byCountry[p.iso].push(p)
  })

  function openModal(iso: string) {
    const countryProjects = byCountry[iso]
    if (!countryProjects?.length || !modalRef.current) return
    const name = countryProjects[0].country

    modalRef.current.innerHTML = `
      <div style="background:#ffffff;border:1px solid #1a1a1a;font-family:${SANS};color:#1a1a1a;
        width:min(720px,calc(100vw - 32px));max-height:calc(100vh - 60px);overflow:auto;">
        <div style="display:flex;align-items:flex-start;justify-content:space-between;
          padding:20px 24px 16px;border-bottom:1px solid #e5e0d4;gap:16px;">
          <div>
            <div style="font-size:11px;color:#6b6658;text-transform:uppercase;
              letter-spacing:1.8px;margin-bottom:6px;font-weight:500;">Projekte in</div>
            <h2 style="font-size:24px;margin:0;line-height:1.2;font-weight:600;letter-spacing:-0.01em;color:#1a1a1a;">${name}</h2>
          </div>
          <button id="modal-close" style="background:transparent;border:1px solid #1a1a1a;
            width:32px;height:32px;cursor:pointer;font-size:14px;display:flex;align-items:center;
            justify-content:center;flex-shrink:0;color:#1a1a1a;">✕</button>
        </div>
        <div style="padding:20px 24px 24px;">
          ${countryProjects.map(p => `
            <div style="border:1px solid #e5e0d4;padding:18px;margin-bottom:16px;background:#fafaf5;">
              <h3 style="font-size:17px;margin:0 0 10px;font-weight:600;color:#1a1a1a;letter-spacing:-0.01em;">${p.title}</h3>
              <div style="font-size:12px;color:#6b6658;margin-bottom:12px;display:flex;flex-wrap:wrap;gap:18px;">
                ${p.city ? `<span>Stadt: <b style="color:#1a1a1a;font-weight:600">${p.city}</b></span>` : ''}
                ${p.year ? `<span>Jahr: <b style="color:#1a1a1a;font-weight:600">${p.year}</b></span>` : ''}
                ${p.client ? `<span>Kunde: <b style="color:#1a1a1a;font-weight:600">${p.client}</b></span>` : ''}
              </div>
              ${p.blurb ? `<p style="font-size:14px;line-height:1.6;margin:0 0 12px;color:#1a1a1a;">${p.blurb}</p>` : ''}
              ${p.quote ? `<div style="font-size:14px;font-style:italic;color:#1a1a1a;
                border-left:3px solid ${accent};padding:4px 0 4px 12px;margin:12px 0;line-height:1.5;">"${p.quote}"</div>` : ''}
              ${p.project_images?.length ? `
                <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:6px;margin-top:12px;">
                  ${p.project_images.sort((a, b) => a.sort_order - b.sort_order).slice(0, 3).map(img => `
                    <img src="${img.url}" alt="" style="width:100%;aspect-ratio:4/3;object-fit:cover;
                      border:1px solid #e5e0d4;" />
                  `).join('')}
                </div>
              ` : ''}
            </div>
          `).join('')}
        </div>
      </div>`

    modalRef.current.style.opacity = '1'
    modalRef.current.style.pointerEvents = 'auto'
    document.getElementById('modal-close')?.addEventListener('click', closeModal)
  }

  function closeModal() {
    if (!modalRef.current) return
    modalRef.current.style.opacity = '0'
    modalRef.current.style.pointerEvents = 'none'
  }

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    let cleanup = () => {}

    function render() {
      if (!window.d3 || !window.topojson) { setTimeout(render, 50); return }
      if (!container) return
      const d3 = window.d3
      container.innerHTML = ''

      const W = Math.round(container.getBoundingClientRect().width) || document.documentElement.clientWidth || 1200
      const isMobile = W < 600
      const H = Math.round(W * (isMobile ? 0.85 : 0.52))

      const svg = d3.select(container).append('svg')
        .attr('viewBox', `0 0 ${W} ${H}`)
        .attr('preserveAspectRatio', 'xMidYMid meet')
        .style('display', 'block')
        .style('width', '100%')
        .style('height', 'auto')
        .style('touch-action', 'pan-y')

      const g = svg.append('g')
      const proj = d3.geoNaturalEarth1().scale(W / 6.3).translate([W / 2, H / 2])
      const path = d3.geoPath(proj)

      fetch('https://unpkg.com/world-atlas@2.0.2/countries-110m.json')
        .then(r => r.json())
        .then(world => {
          const countries = window.topojson.feature(world, world.objects.countries).features

          g.selectAll('path').data(countries).enter().append('path')
            .attr('d', (d: GeoFeature) => path(d as Parameters<typeof path>[0]) ?? '')
            .attr('fill', (d: GeoFeature) => {
              const a3 = ID_TO_A3[String(d.id).padStart(3, '0')]
              return a3 && byCountry[a3] ? accent : '#b8b3a3'
            })
            .attr('stroke', '#f5f2ea')
            .attr('stroke-width', 0.6)
            .style('cursor', (d: GeoFeature) => {
              const a3 = ID_TO_A3[String(d.id).padStart(3, '0')]
              return a3 && byCountry[a3] ? 'pointer' : 'default'
            })
            .style('transition', 'fill 0.15s')
            .on('mouseover', function (this: SVGPathElement, _: MouseEvent, d: GeoFeature) {
              const a3 = ID_TO_A3[String(d.id).padStart(3, '0')]
              if (a3 && byCountry[a3]) d3.select(this).attr('fill', '#0f2340')
            })
            .on('mouseout', function (this: SVGPathElement, _: MouseEvent, d: GeoFeature) {
              const a3 = ID_TO_A3[String(d.id).padStart(3, '0')]
              d3.select(this).attr('fill', a3 && byCountry[a3] ? accent : '#b8b3a3')
            })
            .on('click', (_: MouseEvent, d: GeoFeature) => {
              const a3 = ID_TO_A3[String(d.id).padStart(3, '0')]
              if (a3 && byCountry[a3]) openModal(a3)
            })

          const MARKER_R = 10
          const markersG = g.append('g')
          Object.entries(byCountry).forEach(([iso, ps]) => {
            const withCoords = ps.find(p => p.lat != null && p.lng != null)
            const coord: [number, number] | undefined = withCoords
              ? [withCoords.lng as number, withCoords.lat as number]
              : CENTROIDS[iso]
            if (!coord) return
            const [x, y] = proj(coord) ?? [0, 0]
            markersG.append('circle')
              .attr('cx', x).attr('cy', y).attr('r', MARKER_R)
              .attr('fill', '#ffffff').attr('stroke', '#1a1a1a').attr('stroke-width', 1.2)
            markersG.append('text')
              .attr('x', x).attr('y', y + 3.5)
              .attr('text-anchor', 'middle')
              .attr('font-family', SANS).attr('font-size', 10).attr('font-weight', 600)
              .attr('fill', '#1a1a1a')
              .attr('pointer-events', 'none')
              .text(ps.length)
            markersG.append('circle')
              .attr('cx', x).attr('cy', y).attr('r', MARKER_R + 2)
              .attr('fill', 'transparent').style('cursor', 'pointer')
              .on('click', () => openModal(iso))
          })

          const zoom = d3.zoom().scaleExtent([1, 20])
            .filter((evt: Event) => {
              if ((evt as TouchEvent).touches) return (evt as TouchEvent).touches.length >= 2
              return !(evt as MouseEvent).button
            })
            .on('zoom', (evt: { transform: { k: number } }) => {
              g.attr('transform', evt.transform)
              const k = evt.transform.k
              markersG.selectAll('circle:nth-child(3n+1)').attr('r', MARKER_R / k).attr('stroke-width', 1.2 / k)
              markersG.selectAll('text').attr('font-size', 10 / k)
              markersG.selectAll('circle:nth-child(3n+3)').attr('r', (MARKER_R + 2) / k)
            })
          svg.call(zoom)

          if (isMobile) {
            const europe = proj([10, 50]) ?? [W / 2, H / 2]
            const initialK = 2.5
            const tx = W / 2 - europe[0] * initialK
            const ty = H / 2 - europe[1] * initialK
            svg.call(zoom.transform, d3.zoomIdentity.translate(tx, ty).scale(initialK))
          }

          if (!container) return
          const zoomEl = document.createElement('div')
          zoomEl.style.cssText = 'position:absolute;top:12px;right:12px;display:flex;flex-direction:column;background:#ffffff;border:1px solid #1a1a1a;overflow:hidden;'
          const btn = 'width:32px;height:32px;background:#ffffff;border:none;cursor:pointer;font-size:16px;font-family:' + SANS + ';color:#1a1a1a;font-weight:500;padding:0;display:flex;align-items:center;justify-content:center;'
          zoomEl.innerHTML = `
            <button data-z="in" style="${btn}">+</button>
            <button data-z="out" style="${btn}border-top:1px solid #e5e0d4;">−</button>
            <button data-z="reset" style="${btn}border-top:1px solid #e5e0d4;font-size:13px;">↺</button>`
          container.appendChild(zoomEl)
          zoomEl.addEventListener('click', e => {
            const b = (e.target as HTMLElement).dataset.z
            if (b === 'in') svg.transition().call(zoom.scaleBy, 1.5)
            else if (b === 'out') svg.transition().call(zoom.scaleBy, 0.67)
            else svg.transition().call(zoom.transform, d3.zoomIdentity)
          })
        })
    }

    const timer = setTimeout(render, 0)
    const onResize = () => render()
    window.addEventListener('resize', onResize)
    cleanup = () => {
      clearTimeout(timer)
      window.removeEventListener('resize', onResize)
    }
    return cleanup
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projects, accent])

  return (
    <>
      <div ref={containerRef} style={{ position: 'relative', width: '100%', background: '#f5f2ea' }} />
      <div
        ref={modalRef}
        onClick={e => { if (e.target === modalRef.current) closeModal() }}
        style={{
          position: 'fixed', inset: 0, background: 'rgba(26,26,26,0.55)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 100, opacity: 0, pointerEvents: 'none', transition: 'opacity 0.2s',
        }}
      />
      <script src="https://unpkg.com/d3@7.8.5/dist/d3.min.js" async />
      <script src="https://unpkg.com/topojson-client@3.1.0/dist/topojson-client.min.js" async />
    </>
  )
}
