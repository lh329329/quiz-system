const LoginPage = {
  data() {
    return {
      activeTab: "login",
      form: { username: "", password: "" },
      loading: false,
      error: "",
      spotX: -999, spotY: -999,
      inputFocused: false,
    }
  },
  methods: {
    onMouseMove(e) { this.spotX = e.clientX; this.spotY = e.clientY },
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
  template: `<div class="login-bg" @mousemove="onMouseMove" @mouseleave="spotX=-999">
      <div class="login-orbs">
        <div class="login-orb"></div>
        <div class="login-orb"></div>
        <div class="login-orb"></div>
      </div>
      <div class="login-spotlight" :style="{left:spotX+'px',top:spotY+'px'}"></div>
      <div class="login-shape"></div>
      <div class="login-shape"></div>
      <div class="login-shape"></div>

      <el-card class="login-card">
        <div class="login-logo"><span class="accent">&#9670;</span> QuizLab</div>
        <div class="login-desc">智能题目生成与自动批改平台</div>
        <el-tabs v-model="activeTab" stretch class="login-tabs">
          <el-tab-pane label="登录" name="login" />
          <el-tab-pane label="注册" name="register" />
        </el-tabs>
        <el-form :model="form" label-position="top" @submit.prevent="submit">
          <el-form-item label="用户名">
            <el-input v-model="form.username" placeholder="请输入用户名" size="large" @focus="inputFocused=true" @blur="inputFocused=false" />
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
