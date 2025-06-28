<template>
    <div>
        <!-- 搜索栏 -->
        <div class="loc-search">
            <input type="text" name="loc-input" id="location-input" placeholder="您在什么区域钓鱼?" />
            <button>
                <Icon name="material-symbols:search" size="2rem" style="color: #000;" />
            </button>
        </div>

        <!-- 地图组件 -->
        <Amap ref="mapRef" />

        <!-- 右侧工具栏 -->
        <div class="tools-list">
            <button class="tools-item" @click="handleLocationClick" title="定位">
                <Icon name="gis:position" size="2.3rem" style="color: pink;" />
            </button>
        </div>
    </div>
</template>

<script lang="ts" setup>
// 地图组件引用
const mapRef = ref()

// 钓点数据
const fishingSpots = ref<any[]>([])

// 加载钓点数据
const loadFishingSpots = async () => {
    try {
        // 模拟网络延迟
        await new Promise(resolve => setTimeout(resolve, 500))

        // 模拟已审核通过的钓点数据
        const mockApprovedSpots = [
            {
                id: 101,
                title: '梁子湖钓点',
                description: '水质清澈，鱼种丰富。主要有鲫鱼、鲤鱼、草鱼等。',
                longitude: 114.6326,
                latitude: 30.2464,
                status: 'approved',
                tags: ['鲫鱼', '鲤鱼', '草鱼'],
                images: []
            },
            {
                id: 102,
                title: '金银湖野钓区',
                description: '免费野钓点，环境自然。黑鱼、鲢鱼较多，适合早晚垂钓。',
                longitude: 114.1890,
                latitude: 30.6235,
                status: 'approved',
                tags: ['黑鱼', '鲢鱼', '免费', '野钓'],
                images: []
            },
            {
                id: 103,
                title: '木兰湖度假村钓台',
                description: '收费钓台，设施完善。有专业钓台和休息区，鱼情稳定。',
                longitude: 114.4123,
                latitude: 31.0567,
                status: 'approved',
                tags: ['收费', '设施完善', '度假村'],
                images: []
            },
            {
                id: 104,
                title: '府河湿地钓点',
                description: '湿地环境，生态丰富。有鲫鱼、白条、黄颡鱼等。',
                longitude: 114.2456,
                latitude: 30.7123,
                status: 'approved',
                tags: [],
                images: []
            },
            {
                id: 105,
                title: '后官湖公园钓区',
                description: '公园管理钓区，环境优美。适合休闲垂钓，有鲤鱼、鲫鱼。',
                longitude: 114.0789,
                latitude: 30.4890,
                status: 'approved',
                tags: ['公园', '鲤鱼', '鲫鱼', '休闲'],
                images: []
            },
            // 新增钓点 - 在指定经纬度附近
            {
                id: 201,
                title: '湘江野钓点',
                description: '湘江中游段，水流平缓，适合钓鲤鱼、草鱼。岸边有好的钓位。',
                longitude: 112.823377,
                latitude: 28.363617,
                status: 'approved',
                tags: ['湘江', '鲤鱼', '草鱼', '野钓'],
                images: []
            },
            {
                id: 202,
                title: '橘子洲头钓台',
                description: '著名景点附近的钓点，环境优美，有管理规范的钓台。',
                longitude: 112.820150,
                latitude: 28.365890,
                status: 'approved',
                tags: ['景点', '管理规范', '鲫鱼', '白条'],
                images: []
            },
            {
                id: 203,
                title: '湘江东岸休闲钓点',
                description: '东岸码头附近，交通便利，适合休闲垂钓。鱼种多样。',
                longitude: 112.826500,
                latitude: 28.361200,
                status: 'approved',
                tags: ['交通便利', '休闲', '鲫鱼', '鲤鱼', '黄颡鱼'],
                images: []
            },
            {
                id: 204,
                title: '天心阁附近水域',
                description: '城区内的钓点，水质较好，主要有鲫鱼和白条鱼。',
                longitude: 112.821800,
                latitude: 28.367400,
                status: 'approved',
                tags: ['城区', '鲫鱼', '白条', '交通便利'],
                images: []
            },
            {
                id: 205,
                title: '湘江夜钓基地',
                description: '专业夜钓点，有照明设施，夜晚鱼口较好，适合钓黄颡鱼。',
                longitude: 112.825600,
                latitude: 28.359800,
                status: 'approved',
                tags: ['夜钓', '照明设施', '黄颡鱼', '鲤鱼'],
                images: []
            },
            {
                id: 206,
                title: '猴子石大桥下',
                description: '桥墩附近水深较好，有鲤鱼、草鱼聚集。水流适中。',
                longitude: 112.819200,
                latitude: 28.365100,
                status: 'approved',
                tags: ['桥下', '深水', '鲤鱼', '草鱼'],
                images: []
            },
            {
                id: 207,
                title: '湘江西岸钓鱼村',
                description: '当地渔民推荐的钓点，鱼情稳定，有本地特色鱼种。',
                longitude: 112.818900,
                latitude: 28.361900,
                status: 'approved',
                tags: ['渔民推荐', '本地特色', '鲫鱼', '鳊鱼'],
                images: []
            }
        ]

        fishingSpots.value = mockApprovedSpots

        console.log('%c🎣 加载钓点数据', 'color: #10b981; font-weight: bold; font-size: 14px;')
        console.log(`%c📊 共加载 ${mockApprovedSpots.length} 个钓点`, 'color: #3b82f6;')

        // 调用地图组件的清除标记和添加标记方法
        if (mapRef.value) {
            mapRef.value.clearMarkers()

            // 添加钓点标记到地图
            mockApprovedSpots.forEach((spot: any) => {
                mapRef.value.addMarker({
                    position: [spot.longitude, spot.latitude],
                    type: 'fishingSpot',
                    infoWindow: {
                        title: spot.title,
                        content: spot.description
                    },
                    spotData: spot
                })
            })
        }
    } catch (error) {
        console.error('加载钓点数据失败:', error)
    }
}

// 处理定位点击
const handleLocationClick = async () => {
    try {
        await mapRef.value.locateUserAndSetCenter(13)
    } catch (error) {
        console.error('定位失败:', error)
    }
}

// 添加新钓点
const addNewFishingSpot = async (spotData: {
    title: string,
    description: string,
    longitude: number,
    latitude: number,
    tags?: string[]
}) => {
    try {
        // 调用地图组件的添加钓点方法
        const result = await mapRef.value.addFishingSpot(spotData)
        console.log('钓点提交结果:', result)
        return result
    } catch (error) {
        console.error('添加钓点失败:', error)
        throw error
    }
}

// 页面加载完成后加载钓点数据
onMounted(async () => {
    // 等待地图组件初始化完成
    await nextTick()

    // 延迟加载钓点数据，确保地图已经初始化
    setTimeout(async () => {
        await loadFishingSpots()
    }, 1000)
})

// 暴露方法供其他组件调用
defineExpose({
    loadFishingSpots,
    addNewFishingSpot
})
</script>

<style lang="scss" scoped>
/* 搜索栏样式 */
.loc-search {
    position: fixed;
    z-index: 999999999;
    top: 10px;
    left: 50%;
    transform: translateX(-50%);
    width: 95%;
    background-color: #fff;
    color: #000;
    border-radius: .5rem;
    box-shadow: 0 0 10px rgba(0, 0, 0, .2);
    padding: .5rem;
    display: flex;
    align-items: center;

    input {
        width: 100%;
        height: 2rem;
        border: none;
        outline: none;
        padding: .5rem;
        font-size: 1rem;
        color: #000;
        background-color: #fff;
        border-radius: .5rem;
    }

    button {
        min-width: 2.5rem;
        height: 2.5rem;
        border-radius: .5rem;
        background-color: #fff;
        color: #000;
        border: none;
        outline: none;
        cursor: pointer;
        display: flex;
        justify-content: center;
        align-items: center;
        transition: all 0.2s ease;

        .iconify {
            pointer-events: none;
        }

        &:hover {
            background-color: #f5f5f5;
            transform: scale(1.05);
        }

        &:active {
            transform: scale(0.9);
        }
    }
}

/* 右侧工具栏样式 */
.tools-list {
    position: fixed;
    bottom: 20%;
    right: 0.5rem;
    background-color: transparent;
    display: flex;
    flex-direction: column;
    gap: 1rem;
    padding: .5rem;
    z-index: 999999;
    pointer-events: auto;

    .tools-item {
        width: 3.5rem;
        height: 3.5rem;
        border-radius: 50%;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        background-color: #fff;
        color: #000;
        box-shadow: 0 0 10px rgba(0, 0, 0, .2);
        cursor: pointer;
        border: none;
        outline: none;
        transition: all 0.3s ease;
        pointer-events: auto;

        .iconify {
            pointer-events: none;
        }

        &:hover {
            background-color: #f8f9fa;
            transform: scale(1.1);
            box-shadow: 0 4px 20px rgba(0, 0, 0, .3);
        }

        &:active {
            transform: scale(0.9);
            transition: all 0.1s ease;
        }
    }
}
</style>
