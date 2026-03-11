# DashScope 文生图 API 接口文档

## 1. 接口基本信息

| 项目 | 内容 |
| --- | --- |
| 接口名称 | 多模态文生图生成接口 |
| 接口地址 | `https://dashscope.aliyuncs.com/api/v1/services/aigc/multimodal-generation/generation` |
| 请求方法 | POST                                                         |
| 内容类型 | application/json                                             |
| 授权方式 | Bearer Token（需替换为实际的 `DASHSCOPE_API_KEY`）           |
| 适用模型 | qwen-image-2.0-pro **（推荐）**当前与 qwen-image-2.0-pro-2026-03-03 能力相同 |

## 2. 请求头参数

| 参数名        | 必选 | 类型   | 说明                                                         |
| ------------- | ---- | ------ | ------------------------------------------------------------ |
| Content-Type  | 是   | string | 固定值：application/json                                     |
| Authorization | 是   | string | 格式：`Bearer ${DASHSCOPE_API_KEY}`，`${DASHSCOPE_API_KEY}` 为阿里云 API 密钥 |

## 3. 请求体参数

### 3.1 一级参数

| 参数名     | 必选 | 类型   | 说明                                       |
| ---------- | ---- | ------ | ------------------------------------------ |
| model      | 是   | string | 模型名称，固定值：qwen-image-max           |
| input      | 是   | object | 输入参数体，包含生成图片的文本描述         |
| parameters | 是   | object | 生成参数体，包含图片尺寸、负面提示词等配置 |

### 3.2 input 子参数

| 参数名   | 必选 | 类型  | 说明                                     |
| -------- | ---- | ----- | ---------------------------------------- |
| messages | 是   | array | 对话消息数组，仅需传入一条用户角色的消息 |

### 3.3 messages 数组元素参数

| 参数名  | 必选 | 类型   | 说明                       |
| ------- | ---- | ------ | -------------------------- |
| role    | 是   | string | 角色类型，固定值：user     |
| content | 是   | array  | 内容数组，包含文本描述对象 |

### 3.4 content 数组元素参数

| 参数名 | 必选 | 类型   | 说明                    |
| ------ | ---- | ------ | ----------------------- |
| text   | 是   | string | 文生图的文本描述 Prompt |

### 3.5 parameters 子参数

| 参数名          | 必选 | 类型    | 说明                                                         | 取值限制   |
| --------------- | ---- | ------- | ------------------------------------------------------------ | ---------- |
| negative_prompt | 否   | string  | 反向提示词，用于描述不希望在图像中出现的内容，对画面进行限制。 支持中英文，长度不超过500个字符，超出部分将自动截断。 示例值：低分辨率，低画质，肢体畸形，手指畸形，画面过饱和，蜡像感，人脸无细节，过度光滑，画面具有AI感。构图混乱。文字模糊，扭曲。 | 无         |
| prompt_extend   | 否   | boolean | 是否开启提示词扩展                                           | true/false |
| watermark       | 否   | boolean | 是否添加水印                                                 | true/false |
| size            | 是   | string  | 输出图像的分辨率，格式为宽*高。默认分辨率为1664X*928。可选的分辨率及其对应的图像宽高比例为：1664x928（默认值）：16:9。1472x1104：4:3 。1328x1328：1:1。1104x1472：3:4。928x1664：9:16。 |            |

## 4. 完整请求参数样例

```json
{
  "model": "qwen-image-2.0-pro",
  "input": {
    "messages": [
      {
        "role": "user",
        "content": [
          {
            "text": "一副典雅庄重的对联悬挂于厅堂之中，房间是个安静古典的中式布置，桌子上放着一些青花瓷，对联上左书“义本生知人机同道善思新”，右书“通云赋智乾坤启数高志远”， 横批“智启千问”，字体飘逸，在中间挂着一幅中国风的画作，内容是岳阳楼。"
          }
        ]
      }
    ]
  },
  "parameters": {
    "negative_prompt": "低分辨率，低画质，肢体畸形，手指畸形，画面过饱和，蜡像感，人脸无细节，过度光滑，画面具有AI感。构图混乱。文字模糊，扭曲。",
    "prompt_extend": true,
    "watermark": false,
    "size": "1024*1024"
  }
}
```

## 5、完整响应参数样例

~~~json
{
    "output": {
        "choices": [
            {
                "finish_reason": "stop",
                "message": {
                    "content": [
                        {
                            "image": "https://dashscope-result-sh.oss-cn-shanghai.aliyuncs.com/xxx.png?Expires=xxx"
                        }
                    ],
                    "role": "assistant"
                }
            }
        ]
    },
    "usage": {
        "height": 1024,
        "image_count": 1,
        "width": 1024
    },
    "request_id": "d0250a3d-b07f-49e1-bdc8-6793f4929xxx"
}
~~~


