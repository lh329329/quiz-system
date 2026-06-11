const LoginPage = {
  data() {
    return {
      activeTab: "login",
      form: { username: "", password: "" },
      loading: false,
      error: "",
      floating: [],
      mouseX: -999,
      mouseY: -999
    }
  },
  mounted() {
    for (let i = 0; i < 20; i++) {
      this.floating.push({
        x: Math.random() * 100, y: Math.random() * 100,
        size: Math.random() * 6 + 2, delay: Math.random() * 8,
        duration: Math.random() * 8 + 6, opacity: Math.random() * 0.4 + 0.1
      })
    }
  },
  methods: {
    onMouseMove(e) { this.mouseX = e.clientX; this.mouseY = e.clientY },
    async submit() {
      if (!this.form.username || !this.form.password) { this.error = "请填写用户名和密码"; return }
      this.loading = true; this.error = ""
      try {
        const fn = this.activeTab === "login" ? api.login : api.register
        const res = await fn(this.form)
        if (res.data.token) { localStorage.setItem("token", res.data.token); this.$router.push("/generate") }
        else if (res.data.msg) { ElementPlus.ElMessage.success(res.data.msg); this.activeTab = "login" }
      } catch (e) { this.error = (e.response && e.response.data && e.response.data.detail) || "请求失败" }
      this.loading = false
    }
  },
  template: `<div class="login-bg" @mousemove="onMouseMove" @mouseleave="mouseX=-999">
      <div v-for="(f,i) in floating" :key="i" class="floating-circle"
        :style="{left:f.x+'%',top:f.y+'%',width:f.size+'px',height:f.size+'px',opacity:f.opacity,animationDelay:f.delay+'s',animationDuration:f.duration+'s'}" />
      <div class="login-glow" :style="{left:mouseX+'px',top:mouseY+'px'}" />
      <el-card class="login-card">
        <div class="login-logo">智能题目系统</div>
        <div class="login-desc">AI 驱动的题目生成与自动批改</div>
        <el-tabs v-model="activeTab" stretch class="login-tabs">
          <el-tab-pane label="登录" name="login" />
          <el-tab-pane label="注册" name="register" />
        </el-tabs>
        <el-form :model="form" label-position="top" @submit.prevent="submit">
          <el-form-item label="用户名">
            <el-input v-model="form.username" placeholder="请输入用户名" size="large" />
          </el-form-item>
          <el-form-item label="密码">
            <el-input v-model="form.password" type="password" placeholder="请输入密码" show-password size="large" />
          </el-form-item>
          <el-button type="primary" @click="submit" :loading="loading" block size="large" class="login-btn">
            {{ activeTab==="login"?"登 录":"注 册" }}
          </el-button>
        </el-form>
        <p v-if="error" class="login-error">{{ error }}</p>
      </el-card>
    </div>`
}
