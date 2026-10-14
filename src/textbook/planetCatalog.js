import earth from '../assets/geo-verified/blue-marble-bathymetry-july-2048.jpg?url'
import mercury from '../assets/solar-system/mercury.jpg?url'
import venus from '../assets/solar-system/venus_atmosphere.jpg?url'
import mars from '../assets/solar-system/mars.jpg?url'
import jupiter from '../assets/solar-system/jupiter.jpg?url'
import saturn from '../assets/solar-system/saturn.jpg?url'
import saturnRing from '../assets/solar-system/saturn_ring.png?url'
import uranus from '../assets/solar-system/uranus.jpg?url'
import neptune from '../assets/solar-system/neptune.jpg?url'
import pluto from '../assets/solar-system/pluto.jpg?url'

export const saturnRingTexture = saturnRing

// 展示半径经过视觉调整，不表示真实大小比例。
export const planets = [
  { id: 'mercury', name: '水星', english: 'MERCURY', kind: '类地行星', description: '布满撞击坑的岩石世界，也是离太阳最近的行星。', accent: '#bdad99', texture: mercury, radius: 1.20, yaw: 1.2 },
  { id: 'venus', name: '金星', english: 'VENUS', kind: '类地行星', description: '厚重的云层遮住地表，展示的是可见的大气外观。', accent: '#e7c99b', texture: venus, radius: 1.40, yaw: 0.7 },
  { id: 'earth', name: '地球', english: 'EARTH', kind: '类地行星', description: '从宇宙回望蓝色家园，再走近中国的山川与大地。', accent: '#79c7ff', texture: earth, radius: 1.50, yaw: 2.4, pitch: 0.55 },
  { id: 'mars', name: '火星', english: 'MARS', kind: '类地行星', description: '氧化铁染红地表，峡谷、火山与古老水迹仍可辨认。', accent: '#e98c72', texture: mars, radius: 1.35, yaw: 1.4 },
  { id: 'jupiter', name: '木星', english: 'JUPITER', kind: '巨行星', description: '云带层层环绕，巨大的风暴在大气中持续旋转。', accent: '#e9ba91', texture: jupiter, radius: 1.62, yaw: 0.4 },
  { id: 'saturn', name: '土星', english: 'SATURN', kind: '巨行星', description: '宽阔的环由冰与岩石碎块组成，是最醒目的行星轮廓。', accent: '#e5d1a9', texture: saturn, radius: 1.28, yaw: 0.4, distance: 6.4 },
  { id: 'uranus', name: '天王星', english: 'URANUS', kind: '冰巨行星', description: '浅青色大气与几乎横躺的自转轴，构成独特的世界。', accent: '#9ce1e5', texture: uranus, radius: 1.46, yaw: 0.1 },
  { id: 'neptune', name: '海王星', english: 'NEPTUNE', kind: '冰巨行星', description: '深蓝色大气中的强风，来自太阳系遥远的边缘。', accent: '#7099f5', texture: neptune, radius: 1.45, yaw: 0.6 },
  { id: 'pluto', name: '冥王星', english: 'PLUTO', kind: '矮行星', description: '“新视野”号拍下心形冰原；南部暗区尚缺完整影像。', accent: '#d9b8a7', texture: pluto, radius: 1.16, yaw: -1.57, pitch: 0.9 },
]
