<template>
    <div class="h-full w-full" style="height: 100vh">
        <client-only>
            <div :id="tmapId" class="h-full w-full"></div>
        </client-only>
    </div>
</template>

<script setup lang="ts">
import { shallowRef } from '@vue/reactivity'

// 地图实例
const map = shallowRef()
const tmapId = computed(() => {
    return `tmap_${Date.now()}`
})

// 统一的缩放级别配置
const DEFAULT_ZOOM_LEVEL = 13

// 设置地图中心点
const setMapCenter = (lng: number, lat: number, zoom: number = DEFAULT_ZOOM_LEVEL) => {
    if (!map.value) {
        console.warn('地图未初始化')
        return
    }
    
    console.log('设置腾讯地图中心:', { lng, lat, zoom })
    
    // 设置地图中心点和缩放级别
    const center = new (window as any).TMap.LatLng(lat, lng)
    map.value.setCenter(center)
    map.value.setZoom(zoom)
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

// 初始化腾讯地图
const initTencentMap = async () => {
    await nextTick()
    
    // 等待腾讯地图API加载完成
    let retryCount = 0
    const maxRetries = 50 // 最多等待5秒
    
    const waitForTMapAPI = () => {
        return new Promise<void>((resolve, reject) => {
            const checkAPI = () => {
                if ((window as any).TMap && (window as any).TMap.Map) {
                    resolve()
                } else if (retryCount < maxRetries) {
                    retryCount++
                    setTimeout(checkAPI, 100)
                } else {
                    reject(new Error('腾讯地图API加载超时'))
                }
            }
            checkAPI()
        })
    }
    
    try {
        await waitForTMapAPI()
        console.log("初始化腾讯地图")
        
        // 创建地图实例
        map.value = new (window as any).TMap.Map(tmapId.value, {
            center: new (window as any).TMap.LatLng(28.2282, 112.9388), // 默认中心点：长沙
            zoom: DEFAULT_ZOOM_LEVEL
        })
        
        console.log('腾讯地图初始化完成')
        
    } catch (error) {
        console.error('腾讯地图初始化失败:', error)
    }
}

// 挂载
onMounted(() => {
    if (process.client) {
        initTencentMap()
    }
})

// 卸载
onUnmounted(() => {
    if (map.value && map.value.destroy) {
        map.value.destroy()
    }
})
</script>
