import { readFile } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

export default defineEventHandler(async (event) => {
    try {
        const filename = getRouterParam(event, 'filename')

        if (!filename) {
            throw createError({
                statusCode: 400,
                statusMessage: 'Filename is required'
            })
        }

        // 构建文件路径
        const filePath = join(process.cwd(), 'public', 'uploads', filename)

        // 检查文件是否存在
        if (!existsSync(filePath)) {
            throw createError({
                statusCode: 404,
                statusMessage: 'File not found'
            })
        }

        // 读取文件
        const fileBuffer = await readFile(filePath)

        // 获取文件扩展名来设置正确的 Content-Type
        const ext = filename.split('.').pop()?.toLowerCase()
        let contentType = 'application/octet-stream'

        switch (ext) {
            case 'jpg':
            case 'jpeg':
                contentType = 'image/jpeg'
                break
            case 'png':
                contentType = 'image/png'
                break
            case 'gif':
                contentType = 'image/gif'
                break
            case 'webp':
                contentType = 'image/webp'
                break
            case 'svg':
                contentType = 'image/svg+xml'
                break
        }

        // 设置响应头
        setHeader(event, 'Content-Type', contentType)
        setHeader(event, 'Cache-Control', 'public, max-age=31536000') // 缓存一年

        return fileBuffer
    } catch (error) {
        console.error('File serve error:', error)
        throw createError({
            statusCode: 500,
            statusMessage: 'Failed to serve file'
        })
    }
})
