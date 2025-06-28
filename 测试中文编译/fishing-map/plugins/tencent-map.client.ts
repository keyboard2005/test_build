export default defineNuxtPlugin(() => {
  // 腾讯地图API Key 配置
  const config = useRuntimeConfig()
  
  // 在客户端动态加载腾讯地图 API
  if (process.client) {
    const script = document.createElement('script')
    script.type = 'text/javascript'
    script.src = `https://map.qq.com/api/gljs?v=1.exp&key=${config.public.tencentMapKey}`
    script.async = true
    
    script.onerror = (error) => {
      console.error('腾讯地图API加载失败:', error)
    }
    
    document.head.appendChild(script)
  }
})
