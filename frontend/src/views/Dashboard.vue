<template>
  <div class="dashboard-container">
    <div class="welcome-banner animate__animated animate__fadeIn">
      <h1>你好，{{ user?.username }}</h1>
      <p>欢迎回到创作中心</p>
    </div>

    <el-row :gutter="24" class="dashboard-grid">
      <el-col :xs="24" :md="8">
        <el-card class="dashboard-card animate__animated animate__fadeInLeft">
          <template #header>
            <div class="card-header">
              <span><el-icon><User /></el-icon> 个人资料</span>
            </div>
          </template>
          <div class="profile-info">
            <el-avatar :size="80" :src="avatarSrc" class="profile-avatar" />
            <div class="avatar-actions">
              <input
                ref="fileInputRef"
                type="file"
                accept="image/*"
                class="hidden-file-input"
                @change="handleFileChange"
              />
              <el-button
                size="small"
                type="primary"
                text
                :loading="avatarUploading"
                @click="triggerFileSelect"
              >
                更换头像
              </el-button>
            </div>
            <div class="info-list">
              <p><strong>用户名：</strong> {{ user?.username }}</p>
              <p><strong>邮箱：</strong> {{ user?.email }}</p>
              <p><strong>角色：</strong> <el-tag size="small">{{ user?.role }}</el-tag></p>
            </div>
          </div>
        </el-card>
      </el-col>
      
      <el-col :xs="24" :md="16">
        <el-card class="dashboard-card animate__animated animate__fadeInRight">
          <template #header>
            <div class="card-header">
              <span><el-icon><Menu /></el-icon> 快捷操作</span>
            </div>
          </template>
          <div class="action-grid">
            <div class="action-item" @click="$router.push('/upload')">
              <div class="action-icon bg-blue">
                <el-icon><Upload /></el-icon>
              </div>
              <span>上传作品</span>
            </div>
            <div class="action-item">
              <div class="action-icon bg-green">
                <el-icon><List /></el-icon>
              </div>
              <span>我的任务</span>
            </div>
            <div class="action-item" @click="onMyPortfoliosClick">
              <div class="action-icon bg-orange">
                <el-icon><Star /></el-icon>
              </div>
              <span>我的作品</span>
            </div>
            <div class="action-item" @click="onFavoritesClick">
              <div class="action-icon bg-pink">
                <el-icon><Star /></el-icon>
              </div>
              <span>我的收藏</span>
            </div>
            <div class="action-item" @click="onSettingsClick">
              <div class="action-icon bg-purple">
                <el-icon><Setting /></el-icon>
              </div>
              <span>账号设置</span>
            </div>
          </div>
        </el-card>

        <el-card class="dashboard-card mt-20 animate__animated animate__fadeInUp">
          <template #header>
            <div class="card-header">
              <span><el-icon><DataAnalysis /></el-icon> 最近动态</span>
            </div>
          </template>
          <el-empty description="暂无动态" />
        </el-card>
      </el-col>
    </el-row>

    <el-dialog v-model="cropDialogVisible" title="裁剪头像" width="420px">
      <div v-if="cropImageUrl" class="avatar-cropper-wrapper">
        <div
          class="cropper-viewport"
          @mousedown="onCropMouseDown"
          @mousemove="onCropMouseMove"
          @mouseup="onCropMouseUp"
          @mouseleave="onCropMouseUp"
          @touchstart.stop.prevent="onCropTouchStart"
          @touchmove.stop.prevent="onCropTouchMove"
          @touchend="onCropTouchEnd"
          @touchcancel="onCropTouchEnd"
        >
          <img
            :src="cropImageUrl"
            class="cropper-image"
            :style="cropImageStyle"
            draggable="false"
          />
          <div class="cropper-frame"></div>
        </div>
        <div class="cropper-controls">
          <span class="cropper-label">缩放</span>
          <el-slider
            v-model="cropZoom"
            :min="1"
            :max="3"
            :step="0.01"
            @input="onCropZoomChange"
          />
        </div>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="onCropCancel">取消</el-button>
          <el-button type="primary" :loading="avatarUploading" @click="onCropConfirm">
            确定裁剪并上传
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { ElMessage } from 'element-plus';
import { useAuthStore } from '../stores/auth';
import { storeToRefs } from 'pinia';
import { User, Menu, Upload, List, Star, Setting, DataAnalysis } from '@element-plus/icons-vue';
import request from '../utils/request';

const authStore = useAuthStore();
const { user } = storeToRefs(authStore);

const avatarSrc = computed(() => {
  if (user.value?.avatarUrl) {
    return user.value.avatarUrl;
  }
  const name = user.value?.username || 'user';
  return `https://i.pravatar.cc/150?u=${encodeURIComponent(name)}`;
});

const fileInputRef = ref<HTMLInputElement | null>(null);
const avatarUploading = ref(false);

const cropDialogVisible = ref(false);
const cropImageUrl = ref<string | null>(null);
const cropImageElement = ref<HTMLImageElement | null>(null);
const cropZoom = ref(1);
const cropX = ref(0);
const cropY = ref(0);
const cropDragging = ref(false);
const dragStartX = ref(0);
const dragStartY = ref(0);
const dragStartCropX = ref(0);
const dragStartCropY = ref(0);
const cropBaseScale = ref(1);
const cropTouchZooming = ref(false);
const cropInitialDistance = ref(0);
const cropInitialZoom = ref(1);

const CROP_SIZE = 300;

const cropDisplayedWidth = computed(() => {
  if (!cropImageElement.value) {
    return 0;
  }
  return cropImageElement.value.width * cropBaseScale.value * cropZoom.value;
});

const cropDisplayedHeight = computed(() => {
  if (!cropImageElement.value) {
    return 0;
  }
  return cropImageElement.value.height * cropBaseScale.value * cropZoom.value;
});

const cropImageStyle = computed(() => {
  const width = cropDisplayedWidth.value;
  const height = cropDisplayedHeight.value;
  return {
    width: width + 'px',
    height: height + 'px',
    transform: `translate(${cropX.value}px, ${cropY.value}px)`
  };
});

const onMyPortfoliosClick = () => {
  window.location.href = '/my-portfolios';
};

const onFavoritesClick = () => {
  window.location.href = '/favorites';
};

const onSettingsClick = () => {
  window.location.href = '/settings';
};

const validateAvatarFile = (file: File) => {
  const isImage = file.type.startsWith('image/');
  const isLt2M = file.size / 1024 / 1024 < 2;

  if (!isImage) {
    ElMessage.error('请上传图片文件');
  }
  if (!isLt2M) {
    ElMessage.error('头像大小不能超过 2MB');
  }

  return isImage && isLt2M;
};

const triggerFileSelect = () => {
  if (fileInputRef.value && !avatarUploading.value) {
    fileInputRef.value.value = '';
    fileInputRef.value.click();
  }
};

const clampCropPosition = () => {
  const width = cropDisplayedWidth.value;
  const height = cropDisplayedHeight.value;
  if (!width || !height) {
    return;
  }
  const minX = CROP_SIZE - width;
  const minY = CROP_SIZE - height;
  if (cropX.value < minX) {
    cropX.value = minX;
  }
  if (cropY.value < minY) {
    cropY.value = minY;
  }
  if (cropX.value > 0) {
    cropX.value = 0;
  }
  if (cropY.value > 0) {
    cropY.value = 0;
  }
};

const onCropMouseDown = (event: MouseEvent) => {
  if (!cropImageElement.value) {
    return;
  }
  cropDragging.value = true;
  dragStartX.value = event.clientX;
  dragStartY.value = event.clientY;
  dragStartCropX.value = cropX.value;
  dragStartCropY.value = cropY.value;
};

const onCropMouseMove = (event: MouseEvent) => {
  if (!cropDragging.value) {
    return;
  }
  const deltaX = event.clientX - dragStartX.value;
  const deltaY = event.clientY - dragStartY.value;
  cropX.value = dragStartCropX.value + deltaX;
  cropY.value = dragStartCropY.value + deltaY;
  clampCropPosition();
};

const onCropMouseUp = () => {
  cropDragging.value = false;
};

const getTouchDistance = (t1: Touch, t2: Touch) => {
  const dx = t2.clientX - t1.clientX;
  const dy = t2.clientY - t1.clientY;
  return Math.sqrt(dx * dx + dy * dy);
};

const onCropTouchStart = (event: TouchEvent) => {
  if (!cropImageElement.value) {
    return;
  }
  if (event.touches.length === 1) {
    cropTouchZooming.value = false;
    cropDragging.value = true;
    const touch = event.touches.item(0);
    if (!touch) {
      return;
    }
    dragStartX.value = touch.clientX;
    dragStartY.value = touch.clientY;
    dragStartCropX.value = cropX.value;
    dragStartCropY.value = cropY.value;
  } else if (event.touches.length === 2) {
    cropDragging.value = false;
    cropTouchZooming.value = true;
    const t1 = event.touches.item(0);
    const t2 = event.touches.item(1);
    if (!t1 || !t2) {
      return;
    }
    cropInitialDistance.value = getTouchDistance(t1, t2);
    cropInitialZoom.value = cropZoom.value;
  }
};

const onCropTouchMove = (event: TouchEvent) => {
  if (!cropImageElement.value) {
    return;
  }
  if (cropTouchZooming.value && event.touches.length >= 2) {
    const t1 = event.touches.item(0);
    const t2 = event.touches.item(1);
    if (!t1 || !t2) {
      return;
    }
    const distance = getTouchDistance(t1, t2);
    if (!cropInitialDistance.value) {
      return;
    }
    const factor = distance / cropInitialDistance.value;
    let nextZoom = cropInitialZoom.value * factor;
    if (nextZoom < 1) {
      nextZoom = 1;
    }
    if (nextZoom > 3) {
      nextZoom = 3;
    }
    onCropZoomChange(nextZoom);
  } else if (cropDragging.value && event.touches.length === 1) {
    const touch = event.touches.item(0);
    if (!touch) {
      return;
    }
    const deltaX = touch.clientX - dragStartX.value;
    const deltaY = touch.clientY - dragStartY.value;
    cropX.value = dragStartCropX.value + deltaX;
    cropY.value = dragStartCropY.value + deltaY;
    clampCropPosition();
  }
};

const onCropTouchEnd = () => {
  cropDragging.value = false;
  cropTouchZooming.value = false;
};

const onCropZoomChange = (value: number) => {
  if (!cropImageElement.value) {
    cropZoom.value = value;
    return;
  }
  const widthBefore = cropDisplayedWidth.value;
  const heightBefore = cropDisplayedHeight.value;
  cropZoom.value = value;
  const widthAfter = cropDisplayedWidth.value;
  const heightAfter = cropDisplayedHeight.value;
  const centerX = CROP_SIZE / 2;
  const centerY = CROP_SIZE / 2;
  if (!widthBefore || !heightBefore || !widthAfter || !heightAfter) {
    cropX.value = (CROP_SIZE - widthAfter) / 2;
    cropY.value = (CROP_SIZE - heightAfter) / 2;
  } else {
    const offsetX = cropX.value;
    const offsetY = cropY.value;
    const distX = centerX - offsetX;
    const distY = centerY - offsetY;
    const ratioX = distX / widthBefore;
    const ratioY = distY / heightBefore;
    cropX.value = centerX - widthAfter * ratioX;
    cropY.value = centerY - heightAfter * ratioY;
  }
  clampCropPosition();
};

const resetCropState = () => {
  cropImageUrl.value = null;
  cropImageElement.value = null;
  cropZoom.value = 1;
  cropX.value = 0;
  cropY.value = 0;
  cropDragging.value = false;
};

const handleFileChange = async (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files && target.files[0];
  if (!file) {
    return;
  }

  if (!validateAvatarFile(file)) {
    return;
  }

  try {
    const reader = new FileReader();
    const dataUrl = await new Promise<string>((resolve, reject) => {
      reader.onload = () => {
        resolve(reader.result as string);
      };
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(file);
    });

    const img = new Image();
    const loadedImage = await new Promise<HTMLImageElement>((resolve, reject) => {
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = dataUrl;
    });

    cropImageUrl.value = dataUrl;
    cropImageElement.value = loadedImage;
    cropZoom.value = 1;
    cropBaseScale.value = CROP_SIZE / Math.min(loadedImage.width, loadedImage.height);
    const width = cropDisplayedWidth.value;
    const height = cropDisplayedHeight.value;
    cropX.value = (CROP_SIZE - width) / 2;
    cropY.value = (CROP_SIZE - height) / 2;
    clampCropPosition();
    cropDialogVisible.value = true;
  } catch (error) {
    ElMessage.error('上传头像失败');
  }
};

const onCropCancel = () => {
  cropDialogVisible.value = false;
  resetCropState();
};

const onCropConfirm = async () => {
  if (!cropImageElement.value) {
    cropDialogVisible.value = false;
    resetCropState();
    return;
  }
  avatarUploading.value = true;
  try {
    const canvas = document.createElement('canvas');
    canvas.width = CROP_SIZE;
    canvas.height = CROP_SIZE;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Canvas not supported');
    }
    const scale = cropBaseScale.value * cropZoom.value;
    const sxRaw = (0 - cropX.value) / scale;
    const syRaw = (0 - cropY.value) / scale;
    const sSize = CROP_SIZE / scale;
    let sx = sxRaw;
    let sy = syRaw;
    if (sx < 0) {
      sx = 0;
    }
    if (sy < 0) {
      sy = 0;
    }
    if (sx + sSize > cropImageElement.value.width) {
      sx = cropImageElement.value.width - sSize;
    }
    if (sy + sSize > cropImageElement.value.height) {
      sy = cropImageElement.value.height - sSize;
    }
    ctx.drawImage(
      cropImageElement.value,
      sx,
      sy,
      sSize,
      sSize,
      0,
      0,
      CROP_SIZE,
      CROP_SIZE
    );
    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob((b) => {
        if (!b) {
          reject(new Error('Failed to create image blob'));
          return;
        }
        resolve(b);
      }, 'image/png');
    });
    const formData = new FormData();
    formData.append('avatar', blob, 'avatar.png');
    const response: any = await request.post('/users/me/avatar', formData);
    if (response && response.avatarUrl && user.value) {
      user.value.avatarUrl = response.avatarUrl;
      localStorage.setItem('user', JSON.stringify(user.value));
    }
    ElMessage.success('头像已更新');
    cropDialogVisible.value = false;
    resetCropState();
  } catch (error) {
    ElMessage.error('上传头像失败');
  } finally {
    avatarUploading.value = false;
  }
};
</script>

<style scoped>
.dashboard-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 20px;
}

.welcome-banner {
  background: linear-gradient(135deg, #409EFF, #36cfc9);
  padding: 40px;
  border-radius: 16px;
  color: white;
  margin-bottom: 30px;
  box-shadow: 0 10px 20px rgba(64, 158, 255, 0.2);
}

.welcome-banner h1 {
  margin: 0 0 10px 0;
  font-size: 2rem;
}

.welcome-banner p {
  margin: 0;
  opacity: 0.9;
  font-size: 1.1rem;
}

.dashboard-card {
  border-radius: 12px;
  border: none;
  box-shadow: 0 4px 12px rgba(0,0,0,0.05);
  height: 100%;
}

.card-header {
  display: flex;
  align-items: center;
  font-weight: 600;
  font-size: 1.1rem;
}

.card-header .el-icon {
  margin-right: 8px;
  font-size: 1.2rem;
  color: var(--primary-color);
}

.profile-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 20px 0;
}

.profile-avatar {
  margin-bottom: 20px;
  border: 4px solid #f0f2f5;
}

.avatar-actions {
  margin-bottom: 10px;
}

.hidden-file-input {
  display: none;
}

.avatar-cropper-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.cropper-viewport {
  width: 300px;
  height: 300px;
  position: relative;
  overflow: hidden;
  border-radius: 8px;
  background-color: #000;
  cursor: grab;
  touch-action: none;
}

.cropper-viewport:active {
  cursor: grabbing;
}

.cropper-image {
  position: absolute;
  top: 0;
  left: 0;
  user-select: none;
}

.cropper-frame {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.9);
  pointer-events: none;
}

.cropper-viewport::after {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(circle at center, rgba(0, 0, 0, 0) 55%, rgba(0, 0, 0, 0.6) 85%);
  pointer-events: none;
}

.cropper-controls {
  width: 100%;
  max-width: 360px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.cropper-label {
  white-space: nowrap;
  font-size: 14px;
  color: #606266;
}

.info-list p {
  margin: 10px 0;
  color: #606266;
}

.action-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 20px;
  padding: 10px 0;
}

.action-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  padding: 15px;
  border-radius: 8px;
  transition: background-color 0.3s;
}

.action-item:hover {
  background-color: #f5f7fa;
}

.action-icon {
  width: 50px;
  height: 50px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.5rem;
  margin-bottom: 10px;
  transition: transform 0.3s;
}

.action-item:hover .action-icon {
  transform: scale(1.1);
}

.bg-blue { background: linear-gradient(135deg, #409EFF, #0056b3); }
.bg-green { background: linear-gradient(135deg, #67C23A, #4e9628); }
.bg-orange { background: linear-gradient(135deg, #E6A23C, #b87b22); }
.bg-purple { background: linear-gradient(135deg, #909399, #606266); }

.mt-20 {
  margin-top: 20px;
}
</style>
