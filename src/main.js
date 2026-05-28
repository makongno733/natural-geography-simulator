import { createApp } from 'vue'
import { createRouter, createWebHashHistory } from 'vue-router'
import App from './App.vue'
import './style.css'

import TextbookHome from './textbook/TextbookHome.vue'
import BookSelect from './textbook/BookSelect.vue'
import ChapterList from './textbook/ChapterList.vue'
import SectionContent from './textbook/SectionContent.vue'

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
