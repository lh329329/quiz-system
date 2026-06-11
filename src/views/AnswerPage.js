const AnswerPage = {
  data() {
    const raw = localStorage.getItem("questions")
    const questions = raw ? JSON.parse(raw) : []
    return {
      questions, answers: {}, submitted: false, result: null, loading: false,
      timeLeft: questions.length * 120, timer: null,
    }
  },
  computed: {
    timeDisplay() {
      const m = Math.floor(this.timeLeft / 60), s = this.timeLeft % 60
      return `${m}:${String(s).padStart(2, '0')}`
    },
    timeWarning() { return this.timeLeft < 60 }
  },
  mounted() {
    this.timer = setInterval(() => {
      if (this.timeLeft > 0 && !this.submitted) this.timeLeft--
      if (this.timeLeft <= 0 && !this.submitted) this.autoSubmit()
    }, 1000)
  },
  beforeUnmount() { clearInterval(this.timer) },
  template: `<div style="max-width:800px;margin:40px auto;padding:0 20px">
      <el-card v-if="!submitted" class="hover-card" style="border-radius:12px">
        <div :class="['countdown-bar', timeWarning && 'warning']">
          <span style="font-size:18px">⏱</span>
          <span style="font-weight:600;font-size:16px" :style="{color:timeWarning?'#f56c6c':'#303133'}">{{ timeDisplay }}</span>
          <span style="color:#909399;font-size:13px;flex:1">{{ timeWarning ? '时间快到了！' : '剩余时间' }}</span>
          <el-button size="small" @click="autoSubmit">提前交卷</el-button>
        </div>
        <h3 style="margin-bottom:20px">答题</h3>
        <div v-for="q in questions" :key="q.id" style="margin-bottom:20px;padding:16px;background:#fafafa;border-radius:8px">
          <p style="font-weight:600;margin-bottom:10px">{{ q.id }}. {{ q.content }}</p>
          <el-radio-group v-if="q.type==='choice'" v-model="answers[q.id]" style="display:flex;flex-direction:column;gap:8px">
            <el-radio v-for="(label,key) in q.options" :key="key" :value="key">{{ key }}. {{ label }}</el-radio>
          </el-radio-group>
          <el-radio-group v-if="q.type==='judge'" v-model="answers[q.id]">
            <el-radio value="正确">正确</el-radio>
            <el-radio value="错误" style="margin-left:16px">错误</el-radio>
          </el-radio-group>
          <el-input v-if="q.type==='short'" v-model="answers[q.id]" type="textarea" :rows="3" placeholder="请输入你的答案..." />
        </div>
        <el-button type="primary" @click="submit" :loading="loading" block size="large">提交所有答案</el-button>
      </el-card>

      <el-card v-if="submitted && result" class="hover-card" style="border-radius:12px;margin-top:20px">
        <div style="text-align:center;padding:20px 0">
          <h2 class="score-num" style="font-size:56px;color:#409EFF;margin:0">{{ result.total_score }}<span style="font-size:16px;color:#999"> 分</span></h2>
          <p style="color:#999;margin-top:8px">共 {{ result.details.length }} 题</p>
        </div>
        <el-divider />
        <div v-for="d in result.details" :key="d.question_id" style="margin-bottom:16px;padding:12px;background:#fafafa;border-radius:8px;border-left:4px solid" :style="{borderColor: d.is_correct===true?'#67c23a':d.is_correct===false?'#f56c6c':'#e6a23c'}">
          <p style="font-weight:600">第 {{ d.question_id }} 题</p>
          <p v-if="d.is_correct!==null">你的答案：<span :style="{color:d.is_correct?'#67c23a':'#f56c6c'}">{{ d.user_answer }}</span> | 正确答案：{{ d.correct_answer }}</p>
          <p v-if="d.is_correct===null">得分：{{ d.score }} | {{ d.feedback }}</p>
          <p style="color:#888;font-size:13px;margin-top:4px">{{ d.analysis || d.feedback }}</p>
        </div>
        <el-row :gutter="12">
          <el-col :span="8"><el-button @click="retry" block>再测一次</el-button></el-col>
          <el-col :span="8"><el-button type="primary" @click="goHistory" block>查看历史</el-button></el-col>
          <el-col :span="8"><el-button type="success" @click="savePDF" block>导出 PDF</el-button></el-col>
        </el-row>
      </el-card>
    </div>`,
  methods: {
    retry() { clearInterval(this.timer); this.submitted = false; this.answers = {}; this.result = null; this.$router.push("/generate") },
    goHistory() { this.$router.push("/history") },
    autoSubmit() { if (!this.submitted) this.submit() },
    savePDF() {
      const card = this.$el.querySelector('.el-card:last-child')
      const win = window.open('', '_blank', 'width=800,height=600')
      win.document.write('<html><head><meta charset=UTF-8><title>成绩单</title><style>body{font-family:sans-serif;padding:20px;max-width:600px;margin:auto}h1{text-align:center;color:#409EFF}p{line-height:1.6}div{margin:10px 0;padding:10px;background:#f5f5f5;border-radius:6px}.correct{border-left:4px solid #67c23a}.wrong{border-left:4px solid #f56c6c}.short{border-left:4px solid #e6a23c}</style></head><body><h1>成绩单</h1>')
      win.document.write('<h2 style=text-align:center;font-size:48px;color:#409EFF>' + this.result.total_score + ' 分</h2>')
      this.result.details.forEach(d => {
        const cls = d.is_correct === true ? 'correct' : d.is_correct === false ? 'wrong' : 'short'
        win.document.write('<div class=' + cls + '><p><b>第' + d.question_id + '题</b></p>')
        if (d.is_correct !== null) win.document.write('<p>你的答案：' + d.user_answer + ' | 正确答案：' + d.correct_answer + '</p>')
        else win.document.write('<p>得分：' + d.score + ' | ' + d.feedback + '</p>')
        win.document.write('<p><small>' + (d.analysis || d.feedback || '') + '</small></p></div>')
      })
      win.document.write('</body></html>')
      win.document.close()
      setTimeout(() => win.print(), 500)
    },
    async submit() {
      clearInterval(this.timer)
      this.loading = true
      const answers = this.questions.map(q => ({ question_id: q.id, answer: this.answers[q.id] || "" }))
      try { const res = await api.submit({ answers }); this.result = res.data; this.submitted = true }
      catch (e) { ElementPlus.ElMessage.error("提交失败") }
      this.loading = false
    }
  }
}
