import { useEffect, useRef } from 'react'
import { Mesh, Program, Renderer, Triangle } from 'ogl'
import './GradientBlinds.css'

const rgb = (hex) => { const value = hex.replace('#', '').padEnd(6, '0'); return [0, 2, 4].map((i) => Number.parseInt(value.slice(i, i + 2), 16) / 255) }

export default function GradientBlinds({ className = '', dpr, paused = false, gradientColors = ['#FF9FFC', '#5227FF'], angle = 0, noise = .3, blindCount = 16, blindMinWidth = 60, mouseDampening = .15, spotlightRadius = .5, spotlightSoftness = 1, spotlightOpacity = 1, distortAmount = 0, shineDirection = 'left', mixBlendMode = 'lighten' }) {
  const ref = useRef(null)
  useEffect(() => {
    const container = ref.current; const renderer = new Renderer({ dpr: dpr ?? (window.devicePixelRatio || 1), alpha: true, antialias: true }); const { gl } = renderer; const canvas = gl.canvas; container.appendChild(canvas)
    const uniforms = { iResolution: { value: [1, 1, 1] }, iMouse: { value: [0, 0] }, iTime: { value: 0 }, uAngle: { value: angle * Math.PI / 180 }, uNoise: { value: noise }, uBlinds: { value: blindCount }, uRadius: { value: spotlightRadius }, uSoftness: { value: spotlightSoftness }, uOpacity: { value: spotlightOpacity }, uDistort: { value: distortAmount }, uFlip: { value: shineDirection === 'right' ? 1 : 0 }, uColorA: { value: rgb(gradientColors[0]) }, uColorB: { value: rgb(gradientColors[1] ?? gradientColors[0]) } }
    const program = new Program(gl, { uniforms, vertex: `attribute vec2 position;attribute vec2 uv;varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position,0.,1.);}`, fragment: `precision highp float;varying vec2 vUv;uniform vec3 iResolution,uColorA,uColorB;uniform vec2 iMouse;uniform float iTime,uAngle,uNoise,uBlinds,uRadius,uSoftness,uOpacity,uDistort,uFlip;float rand(vec2 p){return fract(sin(dot(p,vec2(12.9898,78.233)))*43758.5453);}void main(){vec2 p=vUv-.5;float c=cos(uAngle),s=sin(uAngle);p=mat2(c,-s,s,c)*p;p.x+=sin(p.y*6.)*.01*uDistort;vec3 base=mix(uColorA,uColorB,clamp(p.x+.5,0.,1.));float stripe=fract((p.x+.5)*max(uBlinds,1.));if(uFlip>.5)stripe=1.-stripe;vec2 m=iMouse/iResolution.xy;float dist=length(vUv-m)/max(uRadius,.0001);float spot=(1.-2.*pow(dist,uSoftness))*uOpacity;vec3 col=base+vec3(spot-stripe)+(rand(gl_FragCoord.xy+iTime)-.5)*uNoise;gl_FragColor=vec4(col,1.);}` })
    const mesh = new Mesh(gl, { geometry: new Triangle(gl), program }); let frame; let last = 0; const target = [0, 0]
    const resize = () => { const rect = container.getBoundingClientRect(); renderer.setSize(rect.width, rect.height); uniforms.iResolution.value = [gl.drawingBufferWidth, gl.drawingBufferHeight, 1]; uniforms.uBlinds.value = Math.max(1, Math.min(blindCount, Math.floor(rect.width / blindMinWidth))); target[0] = uniforms.iMouse.value[0] = gl.drawingBufferWidth / 2; target[1] = uniforms.iMouse.value[1] = gl.drawingBufferHeight / 2 }; const observer = new ResizeObserver(resize); observer.observe(container); resize()
    const move = (event) => { const rect = canvas.getBoundingClientRect(); const scale = renderer.dpr || 1; target[0] = (event.clientX - rect.left) * scale; target[1] = (rect.height - event.clientY + rect.top) * scale }; canvas.addEventListener('pointermove', move)
    const render = (time) => { frame = requestAnimationFrame(render); uniforms.iTime.value = time * .001; const f = 1 - Math.exp(-(time - last) / 1000 / Math.max(mouseDampening, .0001)); last = time; uniforms.iMouse.value[0] += (target[0] - uniforms.iMouse.value[0]) * f; uniforms.iMouse.value[1] += (target[1] - uniforms.iMouse.value[1]) * f; if (!paused) renderer.render({ scene: mesh }) }; frame = requestAnimationFrame(render)
    return () => { cancelAnimationFrame(frame); observer.disconnect(); canvas.removeEventListener('pointermove', move); canvas.remove() }
  }, [dpr, paused, gradientColors, angle, noise, blindCount, blindMinWidth, mouseDampening, spotlightRadius, spotlightSoftness, spotlightOpacity, distortAmount, shineDirection])
  return <div ref={ref} className={`gradient-blinds-container ${className}`} style={{ mixBlendMode }} />
}

