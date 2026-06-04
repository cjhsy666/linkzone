# 智能家居

LinkZone 内置智能家居控制模块，通过 Home Assistant 控制设备，支持设备发现、状态监控、自动化控制和场景联动。

## 前置条件

1. 部署 [Home Assistant](https://www.home-assistant.io/) 并完成设备接入
2. 通过 API 配置 Home Assistant 连接信息

## 配置

通过 API 配置 Home Assistant 连接：

```bash
curl -X POST http://localhost:8080/api/v1/admin/smarthome/config/hass \
  -H "Authorization: Bearer your-admin-token" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "http://192.168.1.100:8123",
    "token": "your-long-lived-access-token"
  }'
```

获取长期访问令牌：Home Assistant → 个人资料 → 安全 → 长期访问令牌 → 创建令牌

## 支持的设备类型

| 域 | 设备类型 | 说明 |
|-----|---------|------|
| `light` | 灯光 | 开关、亮度、色温、颜色 |
| `switch` | 开关/插座 | 通断控制 |
| `climate` | 空调/温控 | 温度、模式、风速 |
| `cover` | 窗帘/遮阳 | 开合度控制 |
| `fan` | 风扇/新风 | 开关、风速、摆动 |
| `media_player` | 媒体播放器 | 电视、音箱、投影仪等 |
| `lock` | 门锁 | 锁定/解锁 |
| `camera` | 摄像头/门铃 | 监控 |
| `vacuum` | 扫地机 | 清扫控制 |
| `humidifier` | 加湿器/除湿机 | 湿度控制 |
| `water_heater` | 热水器 | 温度控制 |
| `siren` | 警报器 | 报警 |
| `valve` | 阀门 | 水阀/气阀控制 |
| `alarm_control_panel` | 安防面板 | 安防报警 |
| `lawn_mower` | 割草机 | 割草控制 |
| `kitchen` | 厨房设备 | 破壁机、电饭煲、烤箱等 |
| `sensor` | 传感器 | 数据读取（只读） |
| `binary_sensor` | 二值传感器 | 开/关状态（只读） |
| `weather` | 天气 | 天气数据（只读） |
| `input_boolean` | 布尔输入 | 虚拟开关 |
| `number` / `input_number` | 数值输入 | 参数调节 |
| `select` / `input_select` | 选择输入 | 选项切换 |
| `button` / `input_button` | 按钮 | 按压触发 |
| `script` | 脚本 | 执行 Home Assistant 脚本 |
| `automation` | 自动化 | 触发 Home Assistant 自动化 |

## 控制设备

### 通过聊天

在启用了智能家居的群组中，直接用自然语言控制：

```
用户：把客厅灯打开
用户：空调温度调到26度
用户：关全屋灯
用户：窗帘开到50%
```

框架会自动识别设备名称和操作意图，支持模糊匹配。

### 通过 API

```bash
# 控制设备
curl -X POST http://localhost:8080/api/v1/admin/smarthome/devices/light.living_room/control \
  -H "Authorization: Bearer your-admin-token" \
  -H "Content-Type: application/json" \
  -d '{"action": "turn_on", "data": {"brightness": 200}}'

# 获取设备状态
curl http://localhost:8080/api/v1/admin/smarthome/devices/light.living_room \
  -H "Authorization: Bearer your-admin-token"

# 获取所有设备
curl http://localhost:8080/api/v1/admin/smarthome/devices \
  -H "Authorization: Bearer your-admin-token"

# 发现设备
curl -X POST http://localhost:8080/api/v1/admin/smarthome/discover \
  -H "Authorization: Bearer your-admin-token"

# 按区域获取设备
curl http://localhost:8080/api/v1/admin/smarthome/devices-grouped \
  -H "Authorization: Bearer your-admin-token"
```

## 区域管理

```bash
# 获取区域列表
curl http://localhost:8080/api/v1/admin/smarthome/areas \
  -H "Authorization: Bearer your-admin-token"

# 创建区域
curl -X POST http://localhost:8080/api/v1/admin/smarthome/areas \
  -H "Authorization: Bearer your-admin-token" \
  -H "Content-Type: application/json" \
  -d '{"name": "客厅", "icon": "mdi:sofa"}'

# 开启区域所有设备
curl -X POST http://localhost:8080/api/v1/admin/smarthome/areas/{id}/on \
  -H "Authorization: Bearer your-admin-token"

# 关闭区域所有设备
curl -X POST http://localhost:8080/api/v1/admin/smarthome/areas/{id}/off \
  -H "Authorization: Bearer your-admin-token"
```

## 自动化

```bash
# 获取自动化规则
curl http://localhost:8080/api/v1/admin/smarthome/automations \
  -H "Authorization: Bearer your-admin-token"

# 创建自动化规则
curl -X POST http://localhost:8080/api/v1/admin/smarthome/automations \
  -H "Authorization: Bearer your-admin-token" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "晚上自动开灯",
    "trigger": {"platform": "time", "at": "18:00"},
    "action": {"service": "light.turn_on", "target": {"entity_id": "light.living_room"}}
  }'

# 手动触发自动化
curl -X POST http://localhost:8080/api/v1/admin/smarthome/automations/{id}/trigger \
  -H "Authorization: Bearer your-admin-token"
```

## 场景

```bash
# 获取场景列表
curl http://localhost:8080/api/v1/admin/smarthome/scenes \
  -H "Authorization: Bearer your-admin-token"

# 创建场景
curl -X POST http://localhost:8080/api/v1/admin/smarthome/scenes \
  -H "Authorization: Bearer your-admin-token" \
  -H "Content-Type: application/json" \
  -d '{"name": "观影模式", "actions": [...]}'

# 激活场景
curl -X POST http://localhost:8080/api/v1/admin/smarthome/scenes/{id}/activate \
  -H "Authorization: Bearer your-admin-token"
```

## 健康监控

```bash
# 获取设备健康状态
curl http://localhost:8080/api/v1/admin/smarthome/health \
  -H "Authorization: Bearer your-admin-token"

# 获取不健康设备
curl http://localhost:8080/api/v1/admin/smarthome/health/unhealthy \
  -H "Authorization: Bearer your-admin-token"

# 重置设备健康状态
curl -X POST http://localhost:8080/api/v1/admin/smarthome/health/{entity_id}/reset \
  -H "Authorization: Bearer your-admin-token"
```

## QQ 智能家居面板

内置 `qq_smarthome_panel` 插件，在 QQ 中提供可视化的设备控制面板，支持按区域浏览和操作设备。
