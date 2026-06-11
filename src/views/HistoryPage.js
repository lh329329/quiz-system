const HistoryPage = {
  data() { return { records: [], wrongQuestions: [], activeTab: "records" } },
  async mounted() {
    try {
      const [r, w] = await Promise.all([api.getRecords(), api.getWrong()])
      this.records = r.data.records
      this.wrongQuestions = w.data.wrong_questions
    } catch (e) { ElementPlus.ElMessage.error("加载失败") }
  },
  template: `<div style="max-width:800px;margin:40px auto;padding:0 20px">
      <el-card style="border-radius:12px">
        <h3 style="margin-bottom:16px">历史记录</h3>
        <el-tabs v-model="activeTab">
          <el-tab-pane label="成绩记录" name="records">
            <el-table :data="records" stripe style="width:100%">
              <el-table-column prop="record_id" label="ID" width="80" />
              <el-table-column prop="total_score" label="总分" width="100">
                <template #default="scope"><el-tag :type="scope.row.total_score>=80?'success':scope.row.total_score>=60?'warning':'danger'">{{ scope.row.total_score }}</el-tag></template>
              </el-table-column>
              <el-table-column prop="question_count" label="题数" width="80" />
              <el-table-column prop="created_at" label="时间" />
            </el-table>
            <el-empty v-if="!records.length" description="暂无记录" />
          </el-tab-pane>
          <el-tab-pane label="错题本" name="wrong">
            <div v-for="q in wrongQuestions" :key="q.id" style="padding:12px;margin-bottom:8px;background:#fff5f5;border-radius:8px;border:1px solid #fde2e2">
              <el-tag size="small" style="margin-right:8px">{{ q.type==="choice"?"选择题":q.type==="judge"?"判断题":"简答题" }}</el-tag>
              <span style="font-weight:600">{{ q.content }}</span>
              <p style="color:#888;font-size:13px;margin-top:4px">正确答案：{{ q.correct_answer }}</p>
              <p style="color:#999;font-size:12px">{{ q.analysis }}</p>
            </div>
            <el-empty v-if="!wrongQuestions.length" description="没有错题！" />
          </el-tab-pane>
        </el-tabs>
      </el-card>
    </div>`
}
