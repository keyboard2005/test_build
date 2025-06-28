export default defineNuxtPlugin(() => {
  // 天地图API Key 配置
  const config = useRuntimeConfig()
  
  // 在客户端动态加载天地图 API
  if (process.client) {
    const script = document.createElement('script')
    script.type = 'text/javascript'
    script.src = `https://api.tianditu.gov.cn/api?v=4.0&tk=${config.public.tiandituKey}`
    script.async = true
    
    script.onerror = (error) => {
      console.error('天地图API加载失败:', error)
    }
    
    document.head.appendChild(script)
  }
})
