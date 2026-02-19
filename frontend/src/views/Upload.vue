<template>
  <div class="upload-container animate__animated animate__fadeInUp">
    <div class="header-section">
      <h1>上传作品</h1>
      <p>分享你的精彩瞬间</p>
    </div>
    
    <el-card class="upload-card">
      <el-form label-position="top" size="large">
        <el-form-item label="作品标题">
          <el-input v-model="form.title" placeholder="给你的作品起个好听的名字" />
        </el-form-item>
        <el-form-item label="作品描述">
          <el-input v-model="form.description" type="textarea" placeholder="描述一下你的作品..." />
        </el-form-item>
        <el-form-item label="作品类型">
          <el-select v-model="form.type" placeholder="选择作品类型" style="width: 100%">
            <el-option label="摄影作品" value="photo" />
            <el-option label="视频创作" value="video" />
            <el-option label="后期修图" value="post_prod" />
          </el-select>
        </el-form-item>
        <el-form-item label="作品链接 (URL，可选)">
          <el-input v-model="form.url" placeholder="作品的外部链接 (如视频链接或高清图链接)" />
        </el-form-item>
        <el-form-item label="关联任务（可选）">
          <el-select
            v-model="form.taskId"
            placeholder="选择此次作品所属的任务（如有）"
            style="width: 100%"
            clearable
          >
            <el-option
              v-for="task in availableTasks"
              :key="task._id"
              :label="taskLabel(task)"
              :value="task._id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="作品文件上传（可选，本地上传）">
          <el-upload
            class="upload-demo"
            drag
            action="#"
            :http-request="customUploadRequest"
            :show-file-list="true"
            :limit="1"
            :on-exceed="handleMainExceed"
            :on-change="handleMainFileChange"
            :auto-upload="false"
            ref="mainUploadRef"
          >
            <el-icon class="el-icon--upload"><upload-filled /></el-icon>
            <div class="el-upload__text">
              将作品文件拖到此处，或 <em>点击上传</em>
            </div>
            <template #tip>
              <div class="el-upload__tip">
                支持图片或视频文件，作为实际作品内容
              </div>
            </template>
          </el-upload>
        </el-form-item>
        <el-form-item label="缩略图上传（可选）">
          <el-upload
            class="upload-demo"
            drag
            action="#"
            :http-request="customUploadRequest"
            :show-file-list="true"
            :limit="1"
            :on-exceed="handleThumbExceed"
            :on-change="handleThumbFileChange"
            :auto-upload="false"
            ref="uploadRef"
          >
            <el-icon class="el-icon--upload"><upload-filled /></el-icon>
            <div class="el-upload__text">
              将文件拖到此处，或 <em>点击上传</em>
            </div>
            <template #tip>
              <div class="el-upload__tip">
                支持 jpg/png 文件，用于展示封面
              </div>
            </template>
          </el-upload>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" size="large" :loading="loading" @click="onSubmit" style="width: 100%">提交作品</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, computed, onMounted } from 'vue';
import { UploadFilled } from '@element-plus/icons-vue';
import { ElMessage, type UploadInstance, type UploadProps } from 'element-plus';
import { useRouter } from 'vue-router';
import request from '../utils/request';

const router = useRouter();
const uploadRef = ref<UploadInstance>();
const mainUploadRef = ref<UploadInstance>();
const loading = ref(false);
const selectedThumbFile = ref<File | null>(null);
const selectedMainFile = ref<File | null>(null);

const form = reactive({
  title: '',
  description: '',
  type: '',
  url: '',
  taskId: ''
});

const myTasks = ref<any[]>([]);

const fetchMyTasks = async () => {
  try {
    const res = await request.get('/tasks/mine');
    myTasks.value = Array.isArray(res) ? res : [];
  } catch {
    // ignore
  }
};

const availableTasks = computed(() => {
  if (!form.type) return myTasks.value;
  return myTasks.value.filter((t) => !t.type || t.type === form.type || t.type === 'general');
});

const taskLabel = (task: any) => {
  const typeMap: Record<string, string> = {
    photo: '摄影',
    video: '视频',
    post_prod: '后期',
    general: '通用'
  };
  const typeText = typeMap[task.type] || '通用';
  return `${task.title}（${typeText}）`;
};

const handleThumbExceed: UploadProps['onExceed'] = (files) => {
  if (!uploadRef.value) return;
  uploadRef.value.clearFiles();
  const file = files[0];
  uploadRef.value.handleStart(file as any);
};

const handleThumbFileChange: UploadProps['onChange'] = (uploadFile) => {
  selectedThumbFile.value = uploadFile.raw as File;
};

const handleMainExceed: UploadProps['onExceed'] = (files) => {
  if (!mainUploadRef.value) return;
  mainUploadRef.value.clearFiles();
  const file = files[0];
  mainUploadRef.value.handleStart(file as any);
};

const handleMainFileChange: UploadProps['onChange'] = (uploadFile) => {
  selectedMainFile.value = uploadFile.raw as File;
};

const customUploadRequest = () => {};

const createVideoThumbnail = (file: File): Promise<File> => {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    const url = URL.createObjectURL(file);
    video.src = url;
    video.muted = true;
    video.playsInline = true as any;
    video.preload = 'metadata';
    const cleanup = () => {
      URL.revokeObjectURL(url);
    };
    video.onloadeddata = () => {
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        cleanup();
        reject(new Error('Canvas not supported'));
        return;
      }
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      canvas.toBlob((blob) => {
        cleanup();
        if (!blob) {
          reject(new Error('Failed to create thumbnail'));
          return;
        }
        const thumbFile = new File([blob], 'thumbnail.png', { type: 'image/png' });
        resolve(thumbFile);
      }, 'image/png');
    };
    video.onerror = () => {
      cleanup();
      reject(new Error('Failed to load video'));
    };
  });
};

const ensureVideoThumbnail = async () => {
  if (
    form.type === 'video' &&
    selectedMainFile.value &&
    !selectedThumbFile.value &&
    selectedMainFile.value.type.startsWith('video/')
  ) {
    try {
      const thumbFile = await createVideoThumbnail(selectedMainFile.value);
      selectedThumbFile.value = thumbFile;
    } catch {
      ElMessage.warning('自动生成视频封面失败，请尝试手动上传封面');
    }
  }
};

const onSubmit = async () => {
  if (!form.title || !form.type) {
    ElMessage.warning('请填写标题和作品类型');
    return;
  }

  if (!form.url && !selectedMainFile.value) {
    ElMessage.warning('请填写作品链接或上传作品文件');
    return;
  }

  loading.value = true;
  try {
    await ensureVideoThumbnail();
    const formData = new FormData();
    formData.append('title', form.title);
    formData.append('description', form.description);
    formData.append('type', form.type);
    formData.append('url', form.url);
    if (form.taskId) {
      formData.append('taskId', form.taskId);
    }

    if (selectedMainFile.value) {
      formData.append('file', selectedMainFile.value);
    }

    if (selectedThumbFile.value) {
      formData.append('thumbnail', selectedThumbFile.value);
    }

    await request.post('/portfolios', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });

    ElMessage.success('作品上传成功！');
    setTimeout(() => {
      router.push('/portfolio');
    }, 1000);
  } catch (error: any) {
    ElMessage.error(error.message || '上传失败，请重试');
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchMyTasks();
});
</script>

<style scoped>
.upload-container {
  max-width: 800px;
  margin: 40px auto;
  padding: 0 20px;
}

.header-section {
  text-align: center;
  margin-bottom: 30px;
}

.header-section h1 {
  font-size: 2rem;
  margin-bottom: 10px;
  color: #333;
}

.header-section p {
  color: #666;
  font-size: 1.1rem;
}

.upload-card {
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.05);
}

.upload-demo {
  width: 100%;
}

:deep(.el-upload-dragger) {
  border-radius: 8px;
}
</style>
