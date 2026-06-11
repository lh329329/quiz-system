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
  template: `<div class="page-wrap">
      <el-card v-if="!submitted" class="card-elevated">
        <div :class="['countdown-bar', timeWarning && 'warning']">
          <span style="font-size:20px">&#9201;</span>
          <span class="countdown-time" :style="{color:timeWarning?'var(--ruby)':'var(--ink-900)'}">{{ timeDisplay }}</span>
          <span class="countdown-label">{{ timeWarning ? '时间紧迫！' : '剩余答题时间' }}</span>
          <el-button size="small" @click="autoSubmit" :type="timeWarning?'danger':''">提前交卷</el-button>
        </div>
        <h3 style="font-size:18px;font-weight:700;margin-bottom:20px;color:var(--ink-900)">答题</h3>
        <div v-for="q in questions" :key="q.id" class="question-item">
          <div class="question-number">{{ q.id }}</div>
          <p style="font-weight:600;font-size:15px;margin-bottom:12px;color:var(--ink-900)">{{ q.content }}</p>
          <el-radio-group v-if="q.type==='choice'" v-model="answers[q.id]" style="display:flex;flex-direction:column;gap:10px">
            <el-radio v-for="(label,key) in q.options" :key="key" :value="key" size="large">{{ key }}. {{ label }}</el-radio>
          </el-radio-group>
          <el-radio-group v-if="q.type==='judge'" v-model="answers[q.id]">
            <el-radio value="正确" size="large">正确</el-radio>
            <el-radio value="错误" size="large" style="margin-left:20px">错误</el-radio>
          </el-radio-group>
          <el-input v-if="q.type==='short'" v-model="answers[q.id]" type="textarea" :rows="3" placeholder="请输入你的答案..." resize="none" />
        </div>
        <el-button type="primary" @click="submit" :loading="loading" block size="large">提交所有答案</el-button>
      </el-card>

      <el-card v-if="submitted && result" class="card-elevated" style="margin-top:20px">
        <div style="text-align:center;padding:28px 0">
          <div class="score-display" style="font-size:64px;font-weight:800;color:var(--ink-900);line-height:1">
            {{ result.total_score }}
            <span style="font-size:16px;font-weight:500;color:var(--ink-400)"> / 100</span>
          </div>
          <p style="color:var(--ink-400);margin-top:8px;font-size:14px">共 {{ result.details.length }} 题</p>
          <div style="margin-top:12px;display:inline-flex;align-items:center;gap:6px;padding:6px 16px;border-radius:100px;background:var(--ink-100);font-size:13px;color:var(--ink-600)">
            {{ result.total_score >= 80 ? '&#127881; 表现优秀' : result.total_score >= 60 ? '&#128170; 继续加油' : '&#128218; 多加练习' }}
          </div>
        </div>
        <el-divider />
        <div v-for="d in result.details" :key="d.question_id"
             :class="['result-item', d.is_correct===true?'correct':d.is_correct===false?'wrong':'short']">
          <div style="display:flex;justify-content:space-between;align-items:start">
            <div>
              <p style="font-weight:600;font-size:14px;margin-bottom:4px">第 {{ d.question_id }} 题</p>
              <p v-if="d.is_correct!==null" style="font-size:13px;color:var(--ink-600)">
                你的答案：<b :style="{color:d.is_correct?'var(--emerald)':'var(--ruby)'}">{{ d.user_answer }}</b>
                <span v-if="!d.is_correct" style="margin-left:8px;color:var(--ink-400)">正确：{{ d.correct_answer }}</span>
              </p>
              <p v-if="d.is_correct===null" style="font-size:13px;color:var(--ink-600)">
                得分：<b style="color:var(--amber)">{{ d.score }}</b> &middot; {{ d.feedback }}
              </p>
            </div>
            <el-tag v-if="d.is_correct===true" type="success" size="small">正确</el-tag>
            <el-tag v-else-if="d.is_correct===false" type="danger" size="small">错误</el-tag>
            <el-tag v-else type="warning" size="small">{{ d.score }}分</el-tag>
          </div>
          <p v-if="d.analysis" style="color:var(--ink-400);font-size:12px;margin-top:6px">{{ d.analysis }}</p>
        </div>
        <el-row :gutter="12" style="margin-top:16px">
          <el-col :span="8"><el-button @click="retry" block size="large">再测一次</el-button></el-col>
          <el-col :span="8"><el-button type="primary" @click="goHistory" block size="large">查看历史</el-button></el-col>
          <el-col :span="8"><el-button @click="savePDF" block size="large" style="border-color:var(--emerald);color:var(--emerald)">导出 PDF</el-button></el-col>
        </el-row>
      </el-card>
    </div>`,
  methods: {
    retry() { clearInterval(this.timer); this.submitted = false; this.answers = {}; this.result = null; this.$router.push("/generate") },
    goHistory() { this.$router.push("/history") },
    autoSubmit() { if (!this.submitted) this.submit() },
    savePDF() {
      const win = window.open('', '_blank', 'width=800,height=600')
      win.document.write('<html><head><meta charset=UTF-8><title>成绩单</title><style>body{font-family:sans-serif;padding:40px;max-width:600px;margin:auto}h1{color:#1a1d27}p{line-height:1.6}div{margin:8px 0;padding:12px;border-radius:8px}.c{border-left:3px solid #3ba585;background:#edf8f4}.w{border-left:3px solid #d94a5d;background:#fdf0f2}.s{border-left:3px solid #e8983e;background:#fef7ee}</style></head><body><h1>成绩单</h1>')
      win.document.write('<h2 style="font-size:48px;color:#1a1d27">' + this.result.total_score + '<small style="font-size:14px;color:#7f8493"> 分</small></h2>')
      this.result.details.forEach(d => {
        const cls = d.is_correct === true ? 'c' : d.is_correct === false ? 'w' : 's'
        win.document.write('<div class=' + cls + '><p><b>第' + d.question_id + '题</b></p>')
        if (d.is_correct !== null) win.document.write('<p>答案：' + d.user_answer + ' | 正确：' + d.correct_answer + '</p>')
        else win.document.write('<p>得分：' + d.score + ' | ' + d.feedback + '</p>')
        win.document.write('<p><small>' + (d.analysis || '') + '</small></p></div>')
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
