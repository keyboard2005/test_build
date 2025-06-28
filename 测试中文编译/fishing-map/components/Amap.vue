<template>
    <div class="h-full w-full" style="height: 100vh">
        <client-only>
            <div :id="amapId" class="h-full w-full"></div>
        </client-only>
    </div>
</template>
<script setup lang="ts">
import '@amap/amap-jsapi-types'
import { shallowRef } from '@vue/reactivity'

// 获取运行时配置
const config = useRuntimeConfig()

// 地图实例
const map = shallowRef()
const markers = shallowRef<any[]>([]) // 存储所有标记
const amapId = computed(() => {
    return `amap_${Date.now()}`
})

// 加载钓点数据（现在只是为了保持接口兼容性）
const loadFishingSpots = async () => {
    console.log('%c🎣 地图组件loadFishingSpots被调用', 'color: #f59e0b; font-weight: bold; font-size: 14px;')
    console.log('%c� 钓点数据加载逻辑已移至父组件', 'color: #6b7280;')
}

// 清除所有标记
const clearMarkers = () => {
    markers.value.forEach(marker => {
        map.value?.remove(marker)
    })
    markers.value = []
}

// 模拟添加新钓点
const addFishingSpot = async (spotData: {
    title: string,
    description: string,
    longitude: number,
    latitude: number,
    tags?: string[]
}) => {
    try {
        // 模拟网络延迟
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        // 模拟提交成功的响应
        const mockResponse = {
            success: true,
            message: '钓点提交成功，等待管理员审核',
            data: {
                id: Date.now(), // 使用时间戳作为临时ID
                ...spotData,
                status: 'pending',
                createdAt: new Date().toISOString()
            }
        }
        
        console.log('%c✅ 钓点提交成功', 'color: #10b981; font-weight: bold; font-size: 14px;')
        console.log('%c⏳ 等待管理员审核', 'color: #f59e0b;')
        
        return mockResponse
    } catch (error) {
        console.error('提交钓点失败:', error)
        throw error
    }
}

// 定位用户并设置地图中心
const locateUserAndSetCenter = async (zoom: number = 16) => {
    if (!map.value) {
        console.warn('地图未初始化')
        return
    }

    // 加载定位插件
    AMap.plugin('AMap.Geolocation', function () {
        // @ts-ignore
        const geolocation = new AMap.Geolocation({
            enableHighAccuracy: true, // 是否使用高精度定位，默认：true
            timeout: 10000,          // 超过10秒后停止定位，默认：5s
            buttonPosition: 'RB',    // 定位按钮的停靠位置
            buttonOffset: new AMap.Pixel(10, 20), // 定位按钮与设置的停靠位置的偏移量
            zoomToAccuracy: true,    // 定位成功后是否自动调整地图视野到定位点
        })

        // 添加定位控件到地图
        map.value.addControl(geolocation)

        // 开始定位
        geolocation.getCurrentPosition(function (status: string, result: any) {
            if (status === 'complete') {
                onComplete(result)
            } else {
                onError(result)
            }
        })

        function onComplete(data: any) {
            console.log('%c🎯 定位成功', 'color: #10b981; font-weight: bold; font-size: 14px;')

            // 安全检查 position 数据
            if (data.position && Array.isArray(data.position) && data.position.length >= 2) {
                console.log(`%c📍 位置: [${data.position[0].toFixed(6)}, ${data.position[1].toFixed(6)}]`, 'color: #3b82f6;')
                console.log(`%c🏷️ 定位类别: ${data.location_type}`, 'color: #06b6d4;')
                console.log(`%c🔄 是否经过偏移: ${data.isConverted ? '是' : '否'}`, 'color: #84cc16;')

                // 设置地图中心到定位点
                map.value.setCenter(data.position)
                map.value.setZoom(zoom)
            }

            if (data.accuracy) {
                console.log(`%c🎯 精度: ${data.accuracy}米`, 'color: #8b5cf6;')
            }
        }

        function onError(data: any) {
            console.log('%c❌ 定位失败', 'color: #ef4444; font-weight: bold; font-size: 14px;')
            console.log(`%c💡 ${data.message}`, 'color: #f59e0b;')
        }
    })
}

// 内置图标配置
const markerIcons = {
    fishingSpot: {
        icon: 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent('<svg width="32" height="32" xmlns="http://www.w3.org/2000/svg"><circle cx="16" cy="16" r="15" fill="#4A90E2" stroke="#2E5C8A" stroke-width="2"/><text x="16" y="22" font-family="Arial, sans-serif" font-size="18" font-weight="bold" fill="white" text-anchor="middle">鱼</text></svg>'),
        size: [32, 32]
    }
}

// 添加点标记方法
const addMarker = (options: {
    position: [number, number], // 经纬度数组 [经度, 纬度]
    type: 'fishingSpot', // 图标类型
    title?: string,
    content?: string,
    infoWindow?: {
        title: string,
        content: string
    },
    spotData?: any // 钓点完整数据
}) => {
    if (!map.value) {
        console.warn('地图未初始化')
        return null
    }

    const { position, type, title, content, infoWindow, spotData } = options

    // 获取对应类型的图标配置
    const iconConfig = markerIcons[type]
    if (!iconConfig) {
        console.warn(`未知的标记类型: ${type}`)
        return null
    }

    // 创建标记配置
    const markerOptions: any = {
        position: position,
        icon: new AMap.Icon({
            image: iconConfig.icon,
            size: new AMap.Size(iconConfig.size[0], iconConfig.size[1]),
            imageSize: new AMap.Size(iconConfig.size[0], iconConfig.size[1])
        }),
        // 设置锚点为图标中心

        /*
        'top-left'：左上角（默认）
        'top-center'：顶部中心
        'top-right'：右上角
        'middle-left'：左侧中心
        'center'：中心点
        'middle-right'：右侧中心
        'bottom-left'：左下角
        'bottom-center'：底部中心
        'bottom-right'：右下角
        */
        anchor: 'center'
    }

    // 只有在提供了 title 或 content 时才设置
    if (title) {
        markerOptions.title = title
    }
    if (content) {
        markerOptions.content = content
    }

    // 创建标记
    const marker = new AMap.Marker(markerOptions)

    // 如果提供了信息窗口配置，添加点击事件
    if (infoWindow) {
        // 构建标签显示
        const tagsHtml = spotData?.tags && Array.isArray(spotData.tags) && spotData.tags.length > 0
            ? `<div style="margin: 8px 0;">
                ${spotData.tags.map((tag: string) => 
                    `<span style="
                        display: inline-block;
                        background: #e1f5fe;
                        color: #0277bd;
                        padding: 2px 6px;
                        border-radius: 12px;
                        font-size: 11px;
                        margin: 0 4px 4px 0;
                    ">${tag}</span>`
                ).join('')}
            </div>`
            : ''

        // 构建图片显示
        const imagesHtml = spotData?.images && Array.isArray(spotData.images) && spotData.images.length > 0
            ? `<div style="margin: 8px 0;">
                <div style="
                    display: flex;
                    gap: 4px;
                    overflow-x: auto;
                    max-width: 220px;
                    padding-bottom: 4px;
                ">
                    ${spotData.images.slice(0, 3).map((filename: string) => 
                        `<img 
                            src="/uploads/fishing-spots/${filename}" 
                            alt="钓点图片"
                            style="
                                width: 60px;
                                height: 45px;
                                object-fit: cover;
                                border-radius: 4px;
                                border: 1px solid #ddd;
                                flex-shrink: 0;
                                cursor: pointer;
                            "
                            onclick="window.open('/uploads/fishing-spots/${filename}', '_blank')"
                        />`
                    ).join('')}
                    ${spotData.images.length > 3 
                        ? `<div style="
                            width: 60px;
                            height: 45px;
                            background: #f5f5f5;
                            border: 1px solid #ddd;
                            border-radius: 4px;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            font-size: 10px;
                            color: #666;
                            flex-shrink: 0;
                        ">+${spotData.images.length - 3}</div>`
                        : ''
                    }
                </div>
            </div>`
            : ''

        // 创建信息窗口内容
        const infoWindowContent = `
            <div style="
                padding: 0; 
                width: 230px; 
                box-sizing: border-box;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            ">
                <h4 style="
                    margin: 0 0 8px 0; 
                    color: #333; 
                    font-size: 16px; 
                    font-weight: bold;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                ">
                    ${infoWindow.title}
                </h4>
                <p style="
                    margin: 0 0 8px 0; 
                    color: #666; 
                    font-size: 14px; 
                    line-height: 1.5;
                    word-wrap: break-word;
                ">
                    ${infoWindow.content}
                </p>
                ${tagsHtml}
                ${imagesHtml}
                <div style="
                    margin: 0 0 8px 0;
                    padding-top: 6px;
                    border-top: 1px solid #eee;
                    font-size: 12px; 
                    color: #999;
                    white-space: nowrap;
                ">
                    📍 ${position[0].toFixed(6)}, ${position[1].toFixed(6)}
                </div>
                <button 
                    onclick="window.open('https://uri.amap.com/navigation?to=${position[0]},${position[1]}&mode=car&policy=1&src=myapp&coordinate=gaode', '_blank')"
                    style="
                        width: 100%;
                        padding: 8px 12px;
                        background: #4A90E2;
                        color: white;
                        border: none;
                        border-radius: 4px;
                        font-size: 14px;
                        font-weight: 500;
                        cursor: pointer;
                        transition: background-color 0.2s;
                    "
                    onmouseover="this.style.background='#357ABD'"
                    onmouseout="this.style.background='#4A90E2'"
                >
                    🧭 立即导航
                </button>
            </div>
        `

        // 创建信息窗口
        const info = new AMap.InfoWindow({
            content: infoWindowContent,
            offset: new AMap.Pixel(0, -30), // 窗口偏移，避免遮挡标记
            closeWhenClickMap: true, // 点击地图时关闭窗口
            size: new AMap.Size(250, 0), // 设置固定宽度
            autoMove: true // 自动移动以保持在视野内
        })

        // 添加点击事件
        marker.on('click', function(e: any) {
            console.log('%c🎯 点击钓鱼点标记', 'color: #10b981; font-weight: bold; font-size: 14px;')
            info.open(map.value, position)
        })
    }

    // 添加到地图
    map.value.add(marker)
    
    // 将标记添加到数组中以便管理
    markers.value.push(marker)

    return marker
}

// 暴露方法给父组件
defineExpose({
    locateUserAndSetCenter,
    addMarker,
    loadFishingSpots,
    addFishingSpot,
    clearMarkers
})

// 初始化地图
const initMap = async () => {
    await nextTick()

    // 根据环境变量设置初始中心点
    let center: [number, number] = [112.823377, 28.363617] // 默认中心点 - 湘江附近
    if (config.public.forceLocation && config.public.forceLatitude && config.public.forceLongitude) {
        const latitude = parseFloat(config.public.forceLatitude)
        const longitude = parseFloat(config.public.forceLongitude)
        center = [longitude, latitude]
        console.log('使用固定位置初始化地图:', { latitude, longitude })
    }

    map.value = new AMap.Map(amapId.value, {
        zoom: 14,
        mapStyle: 'amap://styles/macaron',
        center: center,
    })

    // 添加地图点击事件监听器
    map.value.on('click', function (e: any) {
        const lng = e.lnglat.getLng()
        const lat = e.lnglat.getLat()
        console.log('%c🎯 地图点击位置', 'color: #10b981; font-weight: bold; font-size: 14px;')
        console.log(`%c📍 经度: ${lng.toFixed(6)}`, 'color: #3b82f6;')
        console.log(`%c📍 纬度: ${lat.toFixed(6)}`, 'color: #3b82f6;')
        console.log(`%c📍 经纬度: [${lng.toFixed(6)}, ${lat.toFixed(6)}]`, 'color: #8b5cf6;')
    })
}

// 挂载
onMounted(async () => {
    if (process.client) {
        await initMap()
    }
})

// 卸载
onUnmounted(() => {
    map.value?.destroy()
})
</script>