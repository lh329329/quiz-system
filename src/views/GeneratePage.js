const GeneratePage = {
  data() {
    return { text: "", count: 5, types: ["choice", "judge", "short"], loading: false, file: null, fileName: "", dragOver: false }
  },
  template: `<div style="max-width:700px;margin:60px auto;padding:0 20px">
      <el-card class="hover-card" style="border-radius:12px">
        <h3 style="margin-bottom:20px">生成题目</h3>
        <el-form label-position="top">
          <el-row :gutter="16">
            <el-col :span="12"><el-form-item label="题目数量"><el-input-number v-model="count" :min="1" :max="20" /></el-form-item></el-col>
            <el-col :span="12"><el-form-item label="题型选择">
              <el-checkbox-group v-model="types">
                <el-checkbox label="choice">选择题</el-checkbox>
                <el-checkbox label="judge">判断题</el-checkbox>
                <el-checkbox label="short">简答题</el-checkbox>
              </el-checkbox-group></el-form-item></el-col>
          </el-row>
          <el-form-item label="知识点文本（输入文本 或 上传文件）">
            <el-input v-model="text" type="textarea" :rows="4" placeholder="输入知识点内容，如：牛顿三大定律是经典力学的基础..." />
          </el-form-item>
          <el-form-item label="或上传文件（支持 .txt / .docx / .pdf）">
            <div :class="['upload-zone', dragOver && 'active']"
                 @click="$refs.fileInput.click()"
                 @dragover.prevent="dragOver=true"
                 @dragleave="dragOver=false"
                 @drop.prevent="onDrop">
              <input ref="fileInput" type="file" accept=".txt,.docx,.pdf,.doc" style="display:none" @change="onFileChange" />
              <div v-if="!fileName" style="color:#909399">
                <div style="font-size:32px;margin-bottom:8px">📁</div>
                <div>点击选择文件 或 拖拽文件到此处</div>
              </div>
              <div v-else style="color:#409EFF;font-weight:600">
                📄 {{ fileName }} <el-button text size="small" @click.stop="file=null;fileName=''">移除</el-button>
              </div>
            </div>
          </el-form-item>
          <el-button type="primary" @click="generate" :loading="loading" block size="large">生成题目</el-button>
        </el-form>
      </el-card>
    </div>`,
  methods: {
    onDrop(e) { this.dragOver = false; if (e.dataTransfer.files.length) this.setFile(e.dataTransfer.files[0]) },
    onFileChange(e) { if (e.target.files.length) this.setFile(e.target.files[0]) },
    setFile(f) { this.file = f; this.fileName = f.name },
    async generate() {
      if (!this.text.trim() && !this.file) { ElementPlus.ElMessage.warning("请输入知识点内容或上传文件"); return }
      this.loading = true
      try {
        const fd = new FormData()
        if (this.file) fd.append("file", this.file)
        if (this.text.trim()) fd.append("text", this.text)
        fd.append("count", this.count)
        fd.append("types", this.types.join(","))
        const res = await api.generate(fd)
        localStorage.setItem("questions", JSON.stringify(res.data.questions))
        this.$router.push("/answer")
      } catch (e) { ElementPlus.ElMessage.error("生成失败") }
      this.loading = false
    }
  }
}
