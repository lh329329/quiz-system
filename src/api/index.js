const http = axios.create({ baseURL: 'http://localhost:8000', timeout: 10000 })

http.interceptors.request.use(config => {
  const token = localStorage.getItem('token')
  if (token) config.headers.Authorization = 'Bearer ' + token
  return config
})

http.interceptors.response.use(
  res => res,
  err => {
    if (err.response && err.response.status === 401) {
      localStorage.removeItem('token')
      window.location.hash = '#/login'
    }
    return Promise.reject(err)
  }
)

const USE_MOCK = true

const mockLogin = () => ({ token: 'mock_token_abc123', user_id: 1 })
const mockRegister = () => ({ msg: '注册成功', user_id: 1 })
const mockQuestions = [
  { id:1, type:'choice', content:'牛顿第一定律描述的是什么？', options:{A:'力是运动的原因',B:'物体保持静止或匀速运动状态',C:'力越大加速度越大',D:'作用力等于反作用力'} },
  { id:2, type:'judge', content:'力是维持物体运动的原因。', options:null },
  { id:3, type:'short', content:'简述牛顿第二定律的内容。', options:null },
  { id:4, type:'choice', content:'F=ma 描述的是哪个定律？', options:{A:'第一定律',B:'第二定律',C:'第三定律',D:'万有引力定律'} },
  { id:5, type:'judge', content:'加速度与物体所受合力成正比。', options:null },
]
const mockSubmit = () => ({
  total_score: 85, record_id: Date.now(),
  details: [
    { question_id:1, is_correct:true, user_answer:'B', correct_answer:'B', analysis:'牛顿第一定律又称惯性定律。' },
    { question_id:2, is_correct:true, user_answer:'错误', correct_answer:'错误', analysis:'力是改变运动状态的原因。' },
    { question_id:3, is_correct:null, score:7, feedback:'答对核心公式F=ma，但未提及方向关系。' },
    { question_id:4, is_correct:true, user_answer:'B', correct_answer:'B', analysis:'牛顿第二定律 F=ma。' },
    { question_id:5, is_correct:false, user_answer:'错误', correct_answer:'正确', analysis:'F=ma 说明加速度与合力成正比。' },
  ]
})
const mockRecords = [
  { record_id:12, total_score:85, question_count:5, created_at:'2024-05-01 14:30:00' },
  { record_id:11, total_score:70, question_count:10, created_at:'2024-04-30 10:20:00' },
]
const mockWrong = [
  { id:5, type:'judge', content:'加速度与物体所受合力成正比。', correct_answer:'正确', analysis:'牛顿第二定律 F=ma。' },
]

const api = {
  register(data) { return USE_MOCK ? Promise.resolve({data:mockRegister()}) : http.post('/api/register', data) },
  login(data) { return USE_MOCK ? Promise.resolve({data:mockLogin()}) : http.post('/api/login', data) },
  generate(fd) { return USE_MOCK ? Promise.resolve({data:{questions:mockQuestions}}) : http.post('/api/generate', fd) },
  submit(data) { return USE_MOCK ? Promise.resolve({data:mockSubmit()}) : http.post('/api/submit', data) },
  getRecords() { return USE_MOCK ? Promise.resolve({data:{records:mockRecords}}) : http.get('/api/records') },
  getWrong() { return USE_MOCK ? Promise.resolve({data:{wrong_questions:mockWrong}}) : http.get('/api/wrong') },
}
