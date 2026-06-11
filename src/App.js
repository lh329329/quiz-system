const App = {
  template: `<div>
      <header v-if="showNav" class="nav-header">
        <div class="nav-brand"><span>&#9670;</span>QuizLab</div>
        <div class="nav-links">
          <el-button text :class="{active:$route.path==='/generate'}" @click="$router.push('/generate')">生成</el-button>
          <el-button text :class="{active:$route.path==='/answer'}" @click="$router.push('/answer')">答题</el-button>
          <el-button text :class="{active:$route.path==='/history'}" @click="$router.push('/history')">历史</el-button>
          <el-button text @click="logout" style="color:var(--ruby) !important">退出</el-button>
        </div>
      </header>
      <main><router-view></router-view></main>
    </div>`,
  computed: {
    showNav() { return this.$route.path !== '/login' }
  },
  methods: {
    logout() { localStorage.removeItem('token'); this.$router.push('/login') }
  }
}
