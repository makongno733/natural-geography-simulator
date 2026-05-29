import { createApp, h, onMounted } from 'vue'
import { createRouter, createWebHashHistory, useRoute, useRouter } from 'vue-router'
import App from './App.vue'
import './style.css'
import { getChapter } from './textbook/data/catalogLoader.js'

const TextbookHome = () => import('./textbook/TextbookHome.vue')
const BookSelect = () => import('./textbook/BookSelect.vue')
const ChapterList = () => import('./textbook/ChapterList.vue')
const SectionContent = () => import('./textbook/SectionContent.vue')
const Earth3D = () => import('./sandbox/Earth3D.vue')
const DisasterSandbox = () => import('./sandbox/DisasterSandbox.vue')

const ChapterRedirect = {
  name: 'ChapterRedirect',
  setup() {
    const route = useRoute()
    const router = useRouter()

    onMounted(async () => {
      const { grade, book, chapter } = route.params
      const chapterData = await getChapter(grade, book, chapter)
      const firstSection = chapterData?.sections?.[0]

      if (!firstSection) {
        router.replace({ name: 'book', params: { grade, book } })
        return
      }

      router.replace({
        name: 'section',
        params: { grade, book, chapter, section: firstSection.id }
      })
    })

    return () => h('div', { class: 'page-shell route-loading' }, '正在进入章节...')
  }
}

const routes = [
  { path: '/', name: 'home', component: TextbookHome },
  { path: '/earth3d', name: 'earth3d', component: Earth3D },
  { path: '/disasters', name: 'disasters', component: DisasterSandbox },
  { path: '/textbook', redirect: '/' },
  { path: '/:grade', name: 'grade', component: BookSelect },
  { path: '/:grade/:book', name: 'book', component: ChapterList },
  { path: '/:grade/:book/:chapter', name: 'chapter', component: ChapterRedirect },
  { path: '/:grade/:book/:chapter/:section', name: 'section', component: SectionContent },
]

const router = createRouter({
  history: createWebHashHistory(),
  routes,
})

createApp(App).use(router).mount('#app')
