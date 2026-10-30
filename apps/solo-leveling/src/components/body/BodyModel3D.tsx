import { useEffect, useRef, type KeyboardEvent } from 'react'
import * as THREE from 'three'
import type { MuscleLoad } from '@/domain/progress.ts'
import type { MuscleId, Sex } from '@/domain/types.ts'
import { muscleRgb } from './colors.ts'

export interface BodyModel3DProps {
  load: MuscleLoad
  selected: MuscleId | null
  onSelect: (muscle: MuscleId) => void
  onError: () => void
  sex: Sex
  build: number
  view: 'front' | 'back'
  onViewChange: (view: 'front' | 'back') => void
  reduceMotion: boolean
}

type Vec3 = [number, number, number]

interface MusclePart {
  muscle: MuscleId
  position: Vec3
  scale: Vec3
  rotation?: Vec3
}

const mirrored = (muscle: MuscleId, position: Vec3, scale: Vec3, rotation?: Vec3): MusclePart[] => [
  { muscle, position, scale, rotation },
  { muscle, position: [-position[0], position[1], position[2]], scale, rotation: rotation ? [rotation[0], -rotation[1], -rotation[2]] : undefined },
]

const MUSCLE_PARTS: MusclePart[] = [
  ...mirrored('chest', [0.085, 1.355, 0.105], [0.095, 0.07, 0.05]),
  ...[1.235, 1.155, 1.075].flatMap((y) => mirrored('abs', [0.038, y, 0.118], [0.034, 0.036, 0.026])),
  ...mirrored('obliques', [0.135, 1.13, 0.07], [0.04, 0.085, 0.05], [0, 0, 0.15]),
  ...mirrored('shoulders', [0.235, 1.425, 0], [0.072, 0.068, 0.075]),
  ...mirrored('biceps', [0.27, 1.25, 0.03], [0.042, 0.085, 0.038], [0, 0, 0.12]),
  ...mirrored('triceps', [0.27, 1.25, -0.03], [0.044, 0.09, 0.04], [0, 0, 0.12]),
  ...mirrored('forearms', [0.305, 0.99, 0], [0.04, 0.1, 0.042], [0, 0, 0.08]),
  { muscle: 'traps', position: [0, 1.47, -0.04], scale: [0.13, 0.05, 0.06] },
  ...mirrored('upperBack', [0.065, 1.33, -0.1], [0.06, 0.07, 0.035]),
  ...mirrored('lats', [0.125, 1.2, -0.085], [0.07, 0.13, 0.04], [0, 0, -0.12]),
  ...mirrored('lowerBack', [0.038, 1.04, -0.1], [0.038, 0.07, 0.03]),
  ...mirrored('glutes', [0.075, 0.9, -0.085], [0.08, 0.08, 0.06]),
  ...mirrored('quads', [0.1, 0.68, 0.045], [0.07, 0.15, 0.05]),
  ...mirrored('hamstrings', [0.1, 0.66, -0.045], [0.066, 0.15, 0.05]),
  ...mirrored('calves', [0.1, 0.3, -0.035], [0.05, 0.1, 0.045]),
]

const disposeObject = (root: THREE.Object3D) => {
  //
  root.traverse((child) => {
    if (child instanceof THREE.Mesh) {
      child.geometry.dispose()
      const materials = Array.isArray(child.material) ? child.material : [child.material]
      for (const material of materials) material.dispose()
    }
  })
}

const buildBody = (sex: Sex, build: number) => {
  //
  const group = new THREE.Group()
  const skin = new THREE.MeshStandardMaterial({ color: 0x1b1b26, roughness: 0.55, metalness: 0.15 })
  const shoulderScale = sex === 'female' ? 1.1 : 1.28
  const hipScale = sex === 'female' ? 1.18 : 1.05
  const girth = 1 + (build - 1) * 0.5

  const add = (geometry: THREE.BufferGeometry, position: Vec3, scale: Vec3 = [1, 1, 1], rotation: Vec3 = [0, 0, 0]) => {
    const mesh = new THREE.Mesh(geometry, skin)
    mesh.position.set(...position)
    mesh.scale.set(...scale)
    mesh.rotation.set(...rotation)
    group.add(mesh)
    return mesh
  }

  add(new THREE.SphereGeometry(0.105, 32, 24), [0, 1.62, 0], [0.92, 1.08, 1])
  add(new THREE.CylinderGeometry(0.05, 0.06, 0.1, 16), [0, 1.51, 0])
  add(new THREE.CapsuleGeometry(0.165, 0.3, 8, 24), [0, 1.24, 0], [shoulderScale * girth, 1, 0.68 * girth])
  add(new THREE.SphereGeometry(0.16, 24, 16), [0, 0.95, 0], [hipScale * girth, 0.62, 0.7 * girth])
  for (const side of [1, -1]) {
    add(new THREE.CapsuleGeometry(0.042, 0.24, 6, 16), [side * 0.27, 1.25, 0], [girth, 1, girth], [0, 0, side * 0.12])
    add(new THREE.CapsuleGeometry(0.035, 0.22, 6, 16), [side * 0.305, 0.99, 0], [girth, 1, girth], [0, 0, side * 0.08])
    add(new THREE.SphereGeometry(0.038, 16, 12), [side * 0.322, 0.83, 0.005], [0.8, 1.1, 0.6])
    add(new THREE.CapsuleGeometry(0.072, 0.32, 6, 16), [side * 0.1, 0.67, 0], [girth, 1, girth])
    add(new THREE.CapsuleGeometry(0.052, 0.3, 6, 16), [side * 0.1, 0.28, 0], [girth, 1, girth])
    add(new THREE.BoxGeometry(0.08, 0.04, 0.17), [side * 0.1, 0.03, 0.035])
  }

  const muscleMeshes = new Map<MuscleId, THREE.Mesh[]>()
  const sphere = new THREE.SphereGeometry(1, 28, 20)
  for (const part of MUSCLE_PARTS) {
    const material = new THREE.MeshStandardMaterial({ color: 0x2a2a38, roughness: 0.4, metalness: 0.1, emissive: 0x000000 })
    const mesh = new THREE.Mesh(sphere, material)
    const widen = part.muscle === 'chest' || part.muscle === 'lats' || part.muscle === 'traps' ? shoulderScale / 1.28 : 1
    mesh.position.set(part.position[0] * girth * widen, part.position[1], part.position[2] * girth)
    mesh.scale.set(part.scale[0] * girth, part.scale[1], part.scale[2] * girth)
    if (part.rotation) mesh.rotation.set(...part.rotation)
    mesh.userData.muscle = part.muscle
    mesh.userData.baseScale = mesh.scale.clone()
    group.add(mesh)
    const list = muscleMeshes.get(part.muscle) ?? []
    list.push(mesh)
    muscleMeshes.set(part.muscle, list)
  }
  group.position.y = -0.88
  return { group, muscleMeshes }
}

export default function BodyModel3D({ load, selected, onSelect, onError, sex, build, view, onViewChange, reduceMotion }: BodyModel3DProps) {
  //
  const hostRef = useRef<HTMLDivElement>(null)
  const meshesRef = useRef<Map<MuscleId, THREE.Mesh[]>>(new Map())
  const targetRef = useRef(view === 'front' ? 0 : Math.PI)
  const callbacksRef = useRef({ onSelect, onError, onViewChange })
  callbacksRef.current = { onSelect, onError, onViewChange }
  const motionRef = useRef(reduceMotion)
  motionRef.current = reduceMotion

  useEffect(() => {
    const host = hostRef.current
    if (!host) return undefined
    let renderer: THREE.WebGLRenderer
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'low-power' })
    } catch {
      callbacksRef.current.onError()
      return undefined
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.outputColorSpace = THREE.SRGBColorSpace
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    host.appendChild(renderer.domElement)
    renderer.domElement.style.touchAction = 'pan-y'
    renderer.domElement.style.position = 'absolute'
    renderer.domElement.style.inset = '0'
    renderer.domElement.style.display = 'block'
    renderer.domElement.setAttribute('aria-hidden', 'true')

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 20)
    camera.position.set(0, -0.02, 4.1)

    scene.add(new THREE.AmbientLight(0xffffff, 0.45))
    const key = new THREE.DirectionalLight(0xffffff, 1.6)
    key.position.set(1.5, 2.5, 3)
    scene.add(key)
    const rim = new THREE.DirectionalLight(0xa855f7, 2.2)
    rim.position.set(-2, 1.5, -2.5)
    scene.add(rim)
    const fill = new THREE.PointLight(0xef4444, 1.1, 6)
    fill.position.set(2.2, -0.4, 0.5)
    scene.add(fill)

    const floor = new THREE.Mesh(
      new THREE.RingGeometry(0.25, 0.42, 64),
      new THREE.MeshBasicMaterial({ color: 0x8b5cf6, transparent: true, opacity: 0.25, side: THREE.DoubleSide }),
    )
    floor.rotation.x = -Math.PI / 2
    floor.position.y = -0.87
    scene.add(floor)

    const { group, muscleMeshes } = buildBody(sex, build)
    scene.add(group)
    meshesRef.current = muscleMeshes
    group.rotation.y = targetRef.current

    const resize = () => {
      const { clientWidth, clientHeight } = host
      if (clientWidth === 0 || clientHeight === 0) return
      renderer.setSize(clientWidth, clientHeight, false)
      renderer.domElement.style.width = '100%'
      renderer.domElement.style.height = '100%'
      camera.aspect = clientWidth / clientHeight
      camera.updateProjectionMatrix()
    }
    resize()
    const resizeObserver = new ResizeObserver(resize)
    resizeObserver.observe(host)

    const raycaster = new THREE.Raycaster()
    const pointer = new THREE.Vector2()
    let dragging = false
    let moved = 0
    let lastX = 0
    let velocity = 0

    const pick = (event: PointerEvent) => {
      const rect = renderer.domElement.getBoundingClientRect()
      pointer.set(((event.clientX - rect.left) / rect.width) * 2 - 1, -((event.clientY - rect.top) / rect.height) * 2 + 1)
      raycaster.setFromCamera(pointer, camera)
      const hits = raycaster.intersectObjects(group.children, false)
      const hit = hits[0]
      return hit ? (hit.object.userData.muscle as MuscleId | undefined) : undefined
    }

    const onDown = (event: PointerEvent) => {
      dragging = true
      moved = 0
      lastX = event.clientX
      velocity = 0
      renderer.domElement.setPointerCapture(event.pointerId)
    }
    const onMove = (event: PointerEvent) => {
      if (!dragging) {
        renderer.domElement.style.cursor = pick(event) ? 'pointer' : 'grab'
        return
      }
      const dx = event.clientX - lastX
      lastX = event.clientX
      moved += Math.abs(dx)
      velocity = dx * 0.012
      group.rotation.y += velocity
      targetRef.current = group.rotation.y
    }
    const onUp = (event: PointerEvent) => {
      if (!dragging) return
      dragging = false
      if (renderer.domElement.hasPointerCapture(event.pointerId)) renderer.domElement.releasePointerCapture(event.pointerId)
      if (moved < 6) {
        const muscle = pick(event)
        if (muscle) callbacksRef.current.onSelect(muscle)
        return
      }
      const normalized = ((group.rotation.y % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2)
      const facingBack = normalized > Math.PI / 2 && normalized < (Math.PI * 3) / 2
      callbacksRef.current.onViewChange(facingBack ? 'back' : 'front')
    }
    renderer.domElement.addEventListener('pointerdown', onDown)
    renderer.domElement.addEventListener('pointermove', onMove)
    renderer.domElement.addEventListener('pointerup', onUp)
    renderer.domElement.addEventListener('pointercancel', onUp)

    let visible = true
    const intersection = new IntersectionObserver(([entry]) => {
      visible = Boolean(entry?.isIntersecting)
    })
    intersection.observe(host)

    const clock = new THREE.Clock()
    let frame = 0
    const tick = () => {
      frame = requestAnimationFrame(tick)
      if (!visible || document.hidden) return
      const delta = Math.min(clock.getDelta(), 0.05)
      if (!dragging) {
        if (Math.abs(velocity) > 0.0005 && !motionRef.current) {
          group.rotation.y += velocity
          velocity *= 0.92
          targetRef.current = group.rotation.y
        } else {
          const diff = targetRef.current - group.rotation.y
          group.rotation.y += motionRef.current ? diff : diff * Math.min(1, delta * 8)
        }
      }
      const pulse = motionRef.current ? 0 : Math.sin(clock.elapsedTime * 2.4) * 0.5 + 0.5
      for (const list of meshesRef.current.values()) {
        for (const mesh of list) {
          const material = mesh.material as THREE.MeshStandardMaterial
          const strength = (mesh.userData.strength as number | undefined) ?? 0
          material.emissiveIntensity = strength > 0 ? 0.35 + strength * 0.9 + pulse * strength * 0.35 : 0
        }
      }
      floor.material.opacity = 0.18 + pulse * 0.12
      renderer.render(scene, camera)
    }
    tick()

    return () => {
      cancelAnimationFrame(frame)
      resizeObserver.disconnect()
      intersection.disconnect()
      renderer.domElement.removeEventListener('pointerdown', onDown)
      renderer.domElement.removeEventListener('pointermove', onMove)
      renderer.domElement.removeEventListener('pointerup', onUp)
      renderer.domElement.removeEventListener('pointercancel', onUp)
      disposeObject(scene)
      renderer.dispose()
      renderer.domElement.remove()
    }
  }, [sex, build])

  useEffect(() => {
    for (const [muscle, list] of meshesRef.current.entries()) {
      const value = load[muscle] ?? 0
      const [r, g, b] = muscleRgb(value)
      const isSelected = selected === muscle
      for (const mesh of list) {
        const material = mesh.material as THREE.MeshStandardMaterial
        material.color.setRGB(r / 255, g / 255, b / 255, THREE.SRGBColorSpace)
        material.emissive.setRGB(r / 255, g / 255, b / 255, THREE.SRGBColorSpace)
        mesh.userData.strength = isSelected ? Math.max(value, 0.8) : value
        const base = mesh.userData.baseScale as THREE.Vector3
        mesh.scale.copy(base).multiplyScalar(isSelected ? 1.12 : 1)
      }
    }
  }, [load, selected, sex, build])

  useEffect(() => {
    const current = targetRef.current
    const wantBack = view === 'back'
    const turns = Math.round(current / (Math.PI * 2))
    const base = turns * Math.PI * 2
    const candidate = base + (wantBack ? Math.PI : 0)
    const options = [candidate - Math.PI * 2, candidate, candidate + Math.PI * 2]
    targetRef.current = options.reduce((best, item) => (Math.abs(item - current) < Math.abs(best - current) ? item : best), candidate)
  }, [view])

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault()
      targetRef.current += event.key === 'ArrowLeft' ? -Math.PI / 8 : Math.PI / 8
    }
  }

  return (
    <div
      ref={hostRef}
      tabIndex={0}
      role="img"
      aria-label="Aylantiriladigan 3D tana modeli. Chap va o‘ng strelkalar bilan aylantiring; mushaklar ro‘yxati quyida."
      onKeyDown={onKeyDown}
      className="relative h-full w-full cursor-grab rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-volt-3"
    />
  )
}
