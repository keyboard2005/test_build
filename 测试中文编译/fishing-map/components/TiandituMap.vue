<template>
    <div class="h-full w-full" style="height: 100vh">
        <client-only>
            <div :id="tiandituId" class="h-full w-full"></div>
        </client-only>
    </div>
</template>

<script setup lang="ts">
import { shallowRef } from '@vue/reactivity'

// 地图实例
const map = shallowRef()
const tiandituId = computed(() => {
    return `tianditu_${Date.now()}`
})

// 统一的缩放级别配置
const DEFAULT_ZOOM_LEVEL = 13

// 设置地图中心点
const setMapCenter = (lng: number, lat: number, zoom: number = DEFAULT_ZOOM_LEVEL) => {
    if (!map.value) {
        console.warn('地图未初始化')
        return
    }
    
    console.log('设置天地图中心:', { lng, lat, zoom })
    
    // 设置地图中心点和缩放级别
    const center = new (window as any).T.LngLat(lng, lat)
    map.value.centerAndZoom(center, zoom)
}

// 浏览器原生定位（兼容性最好）
const getBrowserLocation = () => {
    return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
            reject(new Error('您的浏览器不支持地理定位功能'))
            return
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                console.log('浏览器定位成功:', position)
                const result = {
                    longitude: position.coords.longitude,
                    latitude: position.coords.latitude,
                    accuracy: position.coords.accuracy || 1000,
                    provider: '浏览器定位'
                }
                resolve(result)
            },
            (error) => {
                console.error('浏览器定位失败:', error)
                reject(new Error(error.message || '定位失败'))
            },
            {
                enableHighAccuracy: true,
                timeout: 15000,
                maximumAge: 60000
            }
        )
    })
}

// 暴露方法给父组件
defineExpose({
    setMapCenter,
    getLocation: getBrowserLocation
})

// 初始化天地图
const initTiandituMap = async () => {
    await nextTick()
    
    // 等待天地图API加载完成
    let retryCount = 0
    const maxRetries = 50 // 最多等待5秒
    
    const waitForTiandituAPI = () => {
        return new Promise<void>((resolve, reject) => {
            const checkAPI = () => {
                if ((window as any).T && (window as any).T.Map) {
                    resolve()
                } else if (retryCount < maxRetries) {
                    retryCount++
                    setTimeout(checkAPI, 100)
                } else {
                    reject(new Error('天地图API加载超时'))
                }
            }
            checkAPI()
        })
    }
    
    try {
        await waitForTiandituAPI()
        console.log("初始化天地图")
        
        // 创建地图实例
        map.value = new (window as any).T.Map(tiandituId.value)
        map.value.centerAndZoom(new (window as any).T.LngLat(112.9388, 28.2282), DEFAULT_ZOOM_LEVEL) // 默认中心点：长沙
        
        console.log('天地图初始化完成')
        
    } catch (error) {
        console.error('天地图初始化失败:', error)
    }
}

// 挂载
onMounted(() => {
    if (process.client) {
        initTiandituMap()
    }
})

// 卸载
onUnmounted(() => {
    if (map.value && map.value.destroy) {
        map.value.destroy()
    }
})
</script>
