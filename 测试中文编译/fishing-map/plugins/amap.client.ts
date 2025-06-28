// plugins/amap.client.ts
// 引入 AMapLoader 依赖包
import AMapLoader from '@amap/amap-jsapi-loader';
export default defineNuxtPlugin(async (nuxtApp) => {
    return {
        provide: {
            _AMap: await AMapLoader.load({
                key: '99508a6ed793f9c623ba7a607dc682ef',
                version: '2.0',
                plugins: ["AMap.Geolocation"],
            })
        }
    }
})