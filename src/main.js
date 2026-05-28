import { createApp } from 'vue'
import { createRouter, createWebHashHistory } from 'vue-router'
import App from './App.vue'
import './style.css'

const TextbookHome = () => import('./textbook/TextbookHome.vue')
const BookSelect = () => import('./textbook/BookSelect.vue')
const ChapterList = () => import('./textbook/ChapterList.vue')
const SectionContent = () => import('./textbook/SectionContent.vue')

const routes = [
  { path: '/', name: 'home', component: TextbookHome },
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
