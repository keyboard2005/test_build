<template>
    <div class="admin-panel p-6">
        <ClientOnly>
            <h1 class="text-2xl font-bold mb-6">钓点管理 - 待审核列表</h1>
            
            <!-- 加载状态 -->
            <div v-if="isInitializing" class="flex justify-center items-center h-64">
                <div class="text-gray-500">初始化中...</div>
            </div>
            
            <!-- 登录表单 -->
            <div v-else-if="!isLoggedIn" class="max-w-md mx-auto">
                <div class="bg-white rounded-lg shadow-md p-6">
                    <h2 class="text-xl font-semibold mb-4">管理员登录</h2>
                    <form @submit.prevent="handleLogin">
                        <div class="mb-4">
                            <label class="block text-sm font-medium mb-2">用户名</label>
                            <input 
                                v-model="loginForm.username" 
                                type="text" 
                                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="请输入用户名"
                                required
                            >
                        </div>
                        <div class="mb-6">
                            <label class="block text-sm font-medium mb-2">密码</label>
                            <input 
                                v-model="loginForm.password" 
                                type="password" 
                                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="请输入密码"
                                required
                            >
                        </div>
                        <button 
                            type="submit" 
                            class="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition-colors"
                            :disabled="isLoading"
                        >
                            {{ isLoading ? '登录中...' : '登录' }}
                        </button>
                    </form>
                    <div class="mt-4 text-sm text-gray-600">
                        <p>测试账号：</p>
                        <p>管理员 - 用户名: admin, 密码: admin123</p>
                        <p>普通用户 - 用户名: user1, 密码: user123</p>
                    </div>
                </div>
            </div>

            <!-- 管理面板 -->
            <div v-else>
                <div class="mb-4 flex justify-between items-center">
                    <div>
                        <span class="text-lg">欢迎，{{ user?.name }}</span>
                        <span v-if="user?.role === 'admin'" class="ml-2 px-2 py-1 bg-red-100 text-red-800 text-xs rounded">超级管理员</span>
                    </div>
                    <button 
                        @click="handleLogout"
                        class="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
                    >
                        退出登录
                    </button>
                </div>

                <!-- 管理员功能 -->
                <div v-if="user?.role === 'admin'">
                    <div class="bg-white rounded-lg shadow-md">
                        <div class="p-4 border-b">
                            <h2 class="text-xl font-semibold">待审核钓点 ({{ pendingSpots.length }})</h2>
                        </div>
                        
                        <div v-if="isLoading" class="p-8 text-center">
                            <div class="text-gray-500">加载中...</div>
                        </div>
                        
                        <div v-else-if="pendingSpots.length === 0" class="p-8 text-center">
                            <div class="text-gray-500">暂无待审核钓点</div>
                        </div>
                        
                        <div v-else class="divide-y">
                            <div v-for="spot in pendingSpots" :key="spot.id" class="p-4">
                                <div class="flex justify-between items-start">
                                    <div class="flex-1">
                                        <h3 class="text-lg font-medium mb-2">{{ spot.title }}</h3>
                                        <p class="text-gray-600 mb-2">{{ spot.description }}</p>
                                        <div class="text-sm text-gray-500 mb-2">
                                            <span>📍 位置: {{ spot.longitude.toFixed(6) }}, {{ spot.latitude.toFixed(6) }}</span>
                                        </div>
                                        <div class="text-sm text-gray-500 mb-2">
                                            <span>👤 提交者: {{ spot.createdByName || spot.createdBy }}</span>
                                            <span class="ml-4">🕐 提交时间: {{ formatDate(spot.createdAt) }}</span>
                                        </div>
                                        <div v-if="spot.tags?.length" class="flex flex-wrap gap-1 mb-2">
                                            <span 
                                                v-for="tag in spot.tags" 
                                                :key="tag"
                                                class="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded"
                                            >
                                                {{ tag }}
                                            </span>
                                        </div>
                                        <!-- 钓点图片展示 -->
                                        <div v-if="spot.images?.length" class="mb-3">
                                            <div class="text-sm text-gray-500 mb-2">📷 钓点图片 ({{ spot.images.length }}张):</div>
                                            <div class="flex flex-wrap gap-2">
                                                <div 
                                                    v-for="(image, index) in spot.images.slice(0, 6)" 
                                                    :key="index"
                                                    class="relative group cursor-pointer"
                                                    @click="openImagePreview(spot.images, index)"
                                                >
                                                    <img 
                                                        :src="`/uploads/fishing-spots/${image}`" 
                                                        :alt="`钓点图片 ${index + 1}`"
                                                        class="w-16 h-12 object-cover rounded border hover:shadow-lg transition-shadow"
                                                        @error="handleImageError"
                                                    />
                                                    <div class="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all rounded flex items-center justify-center">
                                                        <span class="text-white opacity-0 group-hover:opacity-100 text-xs">🔍</span>
                                                    </div>
                                                </div>
                                                <div 
                                                    v-if="spot.images.length > 6"
                                                    class="w-16 h-12 bg-gray-100 rounded border flex items-center justify-center text-xs text-gray-500 cursor-pointer hover:bg-gray-200 transition-colors"
                                                    @click="openImagePreview(spot.images, 6)"
                                                >
                                                    +{{ spot.images.length - 6 }}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="ml-4 flex flex-col gap-2">
                                        <button 
                                            @click="handleReview(spot.id, 'approve')"
                                            class="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
                                            :disabled="isLoading"
                                        >
                                            ✅ 通过
                                        </button>
                                        <button 
                                            @click="handleReview(spot.id, 'reject')"
                                            class="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                                            :disabled="isLoading"
                                        >
                                            ❌ 拒绝
                                        </button>
                                        <button 
                                            @click="viewOnMap(spot)"
                                            class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                                        >
                                            🗺️ 查看
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- 普通用户提示 -->
                <div v-else class="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <p class="text-yellow-800">您不是管理员，无法访问审核功能。</p>
                </div>
            </div>
            
            <template #fallback>
                <div class="flex justify-center items-center h-64">
                    <div class="text-gray-500">加载中...</div>
                </div>
            </template>
        </ClientOnly>
    </div>
</template>

<script setup lang="ts">
const isInitializing = ref(true)
const isLoggedIn = ref(false)
const isLoading = ref(false)
const user = ref<any>(null)
const pendingSpots = ref<any[]>([])

const loginForm = ref({
    username: '',
    password: ''
})

// 检查登录状态
const checkAuthStatus = async () => {
    try {
        const token = useCookie('auth-token')
        if (!token.value) {
            throw new Error('No token')
        }

        // 模拟API响应
        await new Promise(resolve => setTimeout(resolve, 500)) // 模拟网络延迟
        
        // 模拟用户数据
        user.value = {
            id: 1,
            username: 'admin',
            name: '管理员',
            role: 'admin'
        }
        isLoggedIn.value = true
        
        if (user.value.role === 'admin') {
            await loadPendingSpots()
        }
    } catch (error) {
        console.log('未登录或token无效')
        isLoggedIn.value = false
        user.value = null
    } finally {
        isInitializing.value = false
    }
}

// 登录
const handleLogin = async () => {
    isLoading.value = true
    try {
        // 模拟网络延迟
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        // 模拟登录验证
        const validUsers = [
            { username: 'admin', password: 'admin123', name: '管理员', role: 'admin' },
            { username: 'user1', password: 'user123', name: '普通用户', role: 'user' }
        ]
        
        const foundUser = validUsers.find(u => 
            u.username === loginForm.value.username && 
            u.password === loginForm.value.password
        )
        
        if (!foundUser) {
            throw new Error('用户名或密码错误')
        }
        
        // 模拟token
        const mockToken = `mock-token-${Date.now()}`
        
        // 保存token到cookie
        const token = useCookie('auth-token', {
            default: () => '',
            maxAge: 60 * 60 * 24 * 7 // 7天
        })
        token.value = mockToken
        
        user.value = foundUser
        isLoggedIn.value = true
        
        if (foundUser.role === 'admin') {
            await loadPendingSpots()
        }
        
        alert('登录成功！')
    } catch (error: any) {
        alert('登录失败: ' + (error.message || '用户名或密码错误'))
    } finally {
        isLoading.value = false
    }
}

// 退出登录
const handleLogout = () => {
    const token = useCookie('auth-token')
    token.value = ''
    
    isLoggedIn.value = false
    user.value = null
    pendingSpots.value = []
}

// 加载待审核钓点
const loadPendingSpots = async () => {
    isLoading.value = true
    try {
        // 模拟网络延迟
        await new Promise(resolve => setTimeout(resolve, 800))
        
        // 模拟待审核钓点数据
        const mockPendingSpots = [
            {
                id: 1,
                title: '东湖钓点',
                description: '水深约2-3米，鱼种丰富，有鲫鱼、草鱼等。周边环境优美，适合休闲垂钓。',
                longitude: 114.3726,
                latitude: 30.5464,
                tags: ['鲫鱼', '草鱼', '休闲'],
                createdBy: 'user123',
                createdByName: '钓鱼爱好者',
                createdAt: '2024-01-15T10:30:00Z',
                images: ['spot1_1.jpg', 'spot1_2.jpg', 'spot1_3.jpg']
            },
            {
                id: 2,
                title: '汤逊湖野钓点',
                description: '野生环境，鱼种多样。黑鱼、鲤鱼较多，适合夜钓。需要自备装备。',
                longitude: 114.3012,
                latitude: 30.4531,
                tags: ['黑鱼', '鲤鱼', '夜钓', '野钓'],
                createdBy: 'fisher456',
                createdByName: '夜钓达人',
                createdAt: '2024-01-16T14:20:00Z',
                images: ['spot2_1.jpg', 'spot2_2.jpg']
            },
            {
                id: 3,
                title: '沙湖公园钓台',
                description: '公园内收费钓台，环境整洁，有专人管理。适合新手，鱼情稳定。',
                longitude: 114.3156,
                latitude: 30.5789,
                tags: ['收费', '新手友好', '管理规范'],
                createdBy: 'newbie789',
                createdByName: '新手小白',
                createdAt: '2024-01-17T09:15:00Z',
                images: ['spot3_1.jpg']
            },
            // 新增湘江附近待审核钓点
            {
                id: 4,
                title: '湘江河心岛钓点',
                description: '河心小岛附近，水深适中，有大鲤鱼出没。需要小船前往。',
                longitude: 112.824500,
                latitude: 28.362800,
                tags: ['河心岛', '大鲤鱼', '需船只'],
                createdBy: 'riverking',
                createdByName: '江河钓手',
                createdAt: '2024-01-18T16:45:00Z',
                images: ['island1.jpg', 'island2.jpg']
            },
            {
                id: 5,
                title: '湘江码头夜钓点',
                description: '码头附近有路灯照明，夜钓条件好。主要钓黄颡鱼和鲫鱼。',
                longitude: 112.822100,
                latitude: 28.364900,
                tags: ['夜钓', '路灯照明', '黄颡鱼', '鲫鱼'],
                createdBy: 'nightfisher',
                createdByName: '夜钓专家',
                createdAt: '2024-01-19T20:30:00Z',
                images: ['wharf1.jpg']
            },
            {
                id: 6,
                title: '湘江大桥上游钓点',
                description: '大桥上游200米处，水流稳定，经常有钓友聚集。鱼种丰富。',
                longitude: 112.825800,
                latitude: 28.360500,
                tags: ['桥上游', '稳定水流', '钓友聚集'],
                createdBy: 'bridgefisher',
                createdByName: '桥梁钓客',
                createdAt: '2024-01-20T08:15:00Z',
                images: ['bridge1.jpg', 'bridge2.jpg', 'bridge3.jpg']
            }
        ]
        
        pendingSpots.value = mockPendingSpots
    } catch (error) {
        console.error('加载待审核钓点失败:', error)
        alert('加载失败，请重试')
    } finally {
        isLoading.value = false
    }
}

// 审核钓点
const handleReview = async (spotId: number, action: 'approve' | 'reject') => {
    let reason = ''
    if (action === 'reject') {
        reason = prompt('请输入拒绝原因:') || ''
        if (!reason.trim()) return
    }
    
    isLoading.value = true
    try {
        // 模拟网络延迟
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        // 模拟审核操作成功
        console.log(`审核钓点 ${spotId}:`, action, reason)
        
        alert(action === 'approve' ? '审核通过！' : '已拒绝该钓点')
        
        // 从列表中移除已审核的钓点
        pendingSpots.value = pendingSpots.value.filter(spot => spot.id !== spotId)
    } catch (error: any) {
        alert('操作失败，请重试')
    } finally {
        isLoading.value = false
    }
}

// 在地图上查看
const viewOnMap = (spot: any) => {
    const url = `/?lng=${spot.longitude}&lat=${spot.latitude}&zoom=16`
    window.open(url, '_blank')
}

// 格式化日期
const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('zh-CN')
}

// 图片预览
const openImagePreview = (images: string[], startIndex: number = 0) => {
    if (!images || images.length === 0) return
    
    // 简单的图片预览 - 在新窗口中打开
    const imageUrl = `/uploads/fishing-spots/${images[startIndex]}`
    window.open(imageUrl, '_blank')
}

// 图片加载错误处理
const handleImageError = (event: Event) => {
    const img = event.target as HTMLImageElement
    if (img) {
        img.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNDgiIHZpZXdCb3g9IjAgMCA2NCA0OCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjY0IiBoZWlnaHQ9IjQ4IiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0zMiAyNEMzMi44ODM3IDI0IDMzLjcxNTggMjMuNjQ4OSAzNC4zNDA5IDIzLjAyNDNMMzkuMzQwOSAxOC4wMjQzQzM5Ljk2NTUgMTcuMzk5MyA0MC4zMTY2IDE2LjU2NzIgNDAuMzE2NiAxNS42ODM1QzQwLjMxNjYgMTQuNzk5OCAzOS45NjU1IDE0LjE2NzggMzkuMzQwOSAxMy41NDI4TDM0LjM0MDkgOC41NDI4NEMzMy43MTU4IDcuOTE3ODcgMzIuODgzNyA3LjU2Njc0IDMyIDcuNTY2NzRDMzEuMTE2MyA3LjU2Njc0IDMwLjI4NDIgNy45MTc4NyAyOS42NTkxIDguNTQyODRMMjQuNjU5MSAxMy41NDI4QzI0LjAzNDUgMTQuMTY3OCAyMy42ODMzIDE0Ljk5OTggMjMuNjgzMyAxNS44ODM1QzIzLjY4MzMgMTYuNzY3MiAyNC4wMzQ1IDE3LjU5OTMgMjQuNjU5MSAxOC4yMjQzTDI5LjY1OTEgMjMuMjI0M0MzMC4yODQyIDIzLjg0ODkgMzEuMTE2MyAyNCAzMiAyNFoiIGZpbGw9IiM5Q0EzQUYiLz4KPHBhdGggZD0iTTMyIDMwQzMzLjEwNDYgMzAgMzQgMjkuMTA0NiAzNCAyOEMzNCAyNi44OTU0IDMzLjEwNDYgMjYgMzIgMjZDMzAuODk1NCAyNiAzMCAyNi44OTU0IDMwIDI4QzMwIDI5LjEwNDYgMzAuODk1NCAzMCAzMiAzMFoiIGZpbGw9IiM5Q0EzQUYiLz4KPC9zdmc+'
        img.alt = '图片加载失败'
        img.classList.add('opacity-50')
    }
}

// 页面加载时检查登录状态（仅在客户端执行）
onMounted(() => {
    checkAuthStatus()
})

// 设置页面标题
useHead({
    title: '钓点管理 - 钓鱼地图'
})
</script>

<style scoped>
.admin-panel {
    min-height: 100vh;
    background-color: #f5f5f5;
}
</style>
