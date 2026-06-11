const { createApp } = Vue
const { createRouter, createWebHashHistory } = VueRouter

const routes = [
  { path: '/', redirect: '/login' },
  { path: '/login', component: LoginPage },
  { path: '/generate', component: GeneratePage },
  { path: '/answer', component: AnswerPage },
  { path: '/history', component: HistoryPage },
]

const router = createRouter({ history: createWebHashHistory(), routes })

router.beforeEach((to) => {
  const token = localStorage.getItem('token')
  if (to.path !== '/login' && !token) return '/login'
})

const app = createApp(App)
app.use(router)
app.use(ElementPlus)
app.mount('#app')
