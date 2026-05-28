import { createApp } from 'vue'
import { createRouter, createWebHashHistory } from 'vue-router'
import App from './App.vue'
import './style.css'

const TextbookHome = () => import('./textbook/TextbookHome.vue')
const BookSelect = () => import('./textbook/BookSelect.vue')
const ChapterList = () => import('./textbook/ChapterList.vue')
const SectionContent = () => import('./textbook/SectionContent.vue')
const SandboxApp = () => import('./sandbox/SandboxApp.vue')
const Earth3D = () => import('./sandbox/Earth3D.vue')

const routes = [
  { path: '/', name: 'home', component: TextbookHome },
  { path: '/sandbox', name: 'sandbox', component: SandboxApp },
  { path: '/earth3d', name: 'earth3d', component: Earth3D },
  { path: '/textbook', redirect: '/' },
  { path: '/:grade', name: 'grade', component: BookSelect },
  { path: '/:grade/:book', name: 'book', component: ChapterList },
  { path: '/:grade/:book/:chapter/:section', name: 'section', component: SectionContent },
]

const router = createRouter({
  history: createWebHashHistory(),
  routes,
})

createApp(App).use(router).mount('#app')
