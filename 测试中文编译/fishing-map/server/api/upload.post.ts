import { createWriteStream } from 'fs'
import { mkdir } from 'fs/promises'
import { join } from 'path'
import { v4 as uuidv4 } from 'uuid'

export default defineEventHandler(async (event) => {
    try {
        const formData = await readMultipartFormData(event)

        if (!formData || formData.length === 0) {
            throw createError({
                statusCode: 400,
                statusMessage: 'No files uploaded'
            })
        }

        const uploadedFiles: string[] = []

        // 创建上传目录
        const uploadDir = join(process.cwd(), 'public', 'uploads')
        await mkdir(uploadDir, { recursive: true })

        for (const file of formData) {
            if (file.filename && file.data) {
                // 生成唯一文件名
                const fileExtension = file.filename.split('.').pop()
                const uniqueFilename = `${uuidv4()}.${fileExtension}`
                const filePath = join(uploadDir, uniqueFilename)

                // 写入文件
                const writeStream = createWriteStream(filePath)
                writeStream.write(file.data)
                writeStream.end()

                uploadedFiles.push(`/api/images/${uniqueFilename}`)
            }
        }

        return {
            success: true,
            message: '图片上传成功',
            data: {
                files: uploadedFiles
            }
        }
    } catch (error) {
        console.error('Upload error:', error)
        throw createError({
            statusCode: 500,
            statusMessage: 'Upload failed'
        })
    }
})
