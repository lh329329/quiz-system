const App = {
  template: `<el-container>
      <el-header v-if="showNav" style="background:#fff;border-bottom:1px solid #e8e8e8;display:flex;align-items:center;justify-content:space-between;padding:0 24px;height:56px">
        <h3 style="margin:0;color:#409EFF;font-size:18px">智能题目系统</h3>
        <div>
          <el-button text @click="goGenerate">生成题目</el-button>
          <el-button text @click="goHistory">历史记录</el-button>
          <el-button text @click="logout" style="color:#f56c6c">退出</el-button>
        </div>
      </el-header>
      <el-main style="padding:0"><router-view></router-view></el-main>
    </el-container>`,
  computed: { showNav() { return this.$route.path !== "/login" } },
  methods: {
    goGenerate() { this.$router.push("/generate") },
    goHistory() { this.$router.push("/history") },
    logout() { localStorage.removeItem("token"); this.$router.push("/login") }
  }
}
