const LoginPage = {
  data() {
    return {
      activeTab: "login",
      form: { username: "", password: "" },
      loading: false, error: "",
      spotX: -999, spotY: -999,
      tiltX: 0, tiltY: 0,
      sparkles: [],
      showWelcome: false, welcomeText: "",
    }
  },
  methods: {
    onMouseMove(e) {
      this.spotX = e.clientX; this.spotY = e.clientY
      const card = this.$el.querySelector('.login-card')
      if (card) {
        const r = card.getBoundingClientRect()
        const cx = r.left + r.width/2, cy = r.top + r.height/2
        this.tiltX = (e.clientY - cy) * 0.03
        this.tiltY = (e.clientX - cx) * -0.03
      }
    },
    spawnSparkles(x, y, count) {
      for (let i = 0; i < count; i++) {
        const angle = (Math.PI * 2 * i) / count
        const dist = 40 + Math.random() * 80
        this.sparkles.push({
          sx: Math.cos(angle) * dist + 'px',
          sy: Math.sin(angle) * dist + 'px',
          left: x + 'px', top: y + 'px',
          color: ['#e8983e','#3ba585','#d94a5d','#4b505e'][Math.floor(Math.random()*4)],
          delay: Math.random() * 0.15 + 's',
          id: Date.now() + i
        })
      }
      setTimeout(() => { this.sparkles = [] }, 1500)
    },
    async submit(e) {
      if (!this.form.username || !this.form.password) { this.error = "请填写用户名和密码"; return }
      this.loading = true; this.error = ""

      // Spawn sparkles at button position
      const btn = e.target.closest('button')
      if (btn) {
        const r = btn.getBoundingClientRect()
        this.spawnSparkles(r.left + r.width/2, r.top + r.height/2, 16)
      }

      try {
        const fn = this.activeTab === "login" ? api.login : api.register
        const res = await fn(this.form)
        if (res.data.token) {
          localStorage.setItem("token", res.data.token)
          // Show welcome
          this.welcomeText = this.activeTab === "login" ? "欢迎回来" : "注册成功"
          this.showWelcome = true
          setTimeout(() => {
            this.showWelcome = false
            this.$router.push("/generate")
          }, 1200)
        } else if (res.data.msg) {
          ElementPlus.ElMessage.success(res.data.msg)
          this.activeTab = "login"
          this.error = "注册成功！请登录"
        }
      } catch (e) {
        this.error = (e.response && e.response.data && e.response.data.detail) || "请求失败"
      }
      this.loading = false
    }
  },
  template: `<div class="login-bg" @mousemove="onMouseMove" @mouseleave="spotX=-999">
      <!-- Orbs -->
      <div class="login-orbs"><div class="login-orb"></div><div class="login-orb"></div><div class="login-orb"></div></div>
      <div class="login-spotlight" :style="{left:spotX+'px',top:spotY+'px'}"></div>
      <div class="login-shape"></div><div class="login-shape"></div><div class="login-shape"></div>

      <!-- Sparkles -->
      <div v-for="s in sparkles" :key="s.id" class="sparkle"
        :style="{left:s.left,top:s.top,'--sx':s.sx,'--sy':s.sy,backgroundColor:s.color,animationDelay:s.delay}" />

      <!-- Welcome overlay -->
      <div v-if="showWelcome" class="login-success-overlay">
        <div class="login-success-msg">&#127881; {{ welcomeText }}</div>
      </div>

      <!-- Card -->
      <el-card class="login-card" :style="{transform:'translateY(-2px) rotateX('+tiltX+'deg) rotateY('+tiltY+'deg)'}">
        <div class="login-logo"><span class="accent">&#9670;</span> QuizLab</div>
        <div class="login-desc">智能题目生成与自动批改平台</div>
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
