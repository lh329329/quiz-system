const HistoryPage = {
  data() { return { records: [], wrongQuestions: [], activeTab: "records" } },
  async mounted() {
    try {
      const [r, w] = await Promise.all([api.getRecords(), api.getWrong()])
      this.records = r.data.records
      this.wrongQuestions = w.data.wrong_questions
    } catch (e) { ElementPlus.ElMessage.error("加载失败") }
  },
  template: `<div class="page-wrap">
      <h3 style="font-size:18px;font-weight:700;margin-bottom:24px;color:var(--ink-900)">&#128202; 历史记录</h3>
      <el-card class="card-elevated">
        <el-tabs v-model="activeTab">
          <el-tab-pane label="成绩记录" name="records">
            <el-table v-if="records.length" :data="records" stripe style="width:100%" :header-cell-style="{color:'var(--ink-600)',fontWeight:'600',fontSize:'12px'}">
              <el-table-column prop="record_id" label="编号" width="70" />
              <el-table-column prop="total_score" label="总分" width="90">
                <template #default="scope">
                  <el-tag :type="scope.row.total_score>=80?'success':scope.row.total_score>=60?'warning':'danger'" effect="light">
                    {{ scope.row.total_score }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column prop="question_count" label="题数" width="70" />
              <el-table-column prop="created_at" label="完成时间" />
            </el-table>
            <div v-else class="empty-state">
              <div class="emoji">&#128203;</div>
              <p>还没有成绩记录</p>
              <el-button type="primary" @click="$router.push('/generate')" style="margin-top:16px" text>开始答题</el-button>
            </div>
          </el-tab-pane>
          <el-tab-pane label="错题本" name="wrong">
            <div v-if="wrongQuestions.length">
              <div v-for="q in wrongQuestions" :key="q.id" style="padding:16px;margin-bottom:8px;border-radius:10px;background:var(--ruby-bg);border:1px solid rgba(217,74,93,0.12)">
                <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px">
                  <el-tag size="small" effect="light" :type="q.type==='choice'?'':'q.type===\'judge\'?\'info\':\'warning\'">
                    {{ q.type==="choice"?"选择题":q.type==="judge"?"判断题":"简答题" }}
                  </el-tag>
                  <span style="font-weight:600;font-size:14px;color:var(--ink-900)">{{ q.content }}</span>
                </div>
                <p style="color:var(--emerald);font-size:13px">&#10003; 正确答案：{{ q.correct_answer }}</p>
                <p v-if="q.analysis" style="color:var(--ink-400);font-size:12px;margin-top:4px">{{ q.analysis }}</p>
              </div>
            </div>
            <div v-else class="empty-state">
              <div class="emoji">&#127881;</div>
              <p>没有错题！全部正确</p>
            </div>
          </el-tab-pane>
        </el-tabs>
      </el-card>
    </div>`
}
