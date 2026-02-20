<template>
  <div class="admin-dashboard animate__animated animate__fadeIn">
    <div class="header-section">
      <h1>后台管理系统</h1>
      <p>管理社团成员与内容</p>
    </div>

    <el-tabs type="border-card" class="admin-tabs" v-model="activeTab" @tab-change="handleTabChange">
      <el-tab-pane label="用户管理" name="users">
        <div class="table-actions">
          <el-button type="primary" size="small" @click="openCreateUserDialog">新增用户</el-button>
        </div>
        <el-table :data="users" style="width: 100%" stripe>
          <el-table-column label="头像" width="100">
            <template #default="scope">
              <el-avatar
                :size="40"
                :src="resolveImageUrl(scope.row.avatarUrl || '')"
              >
                {{ scope.row.username?.[0] || '用' }}
              </el-avatar>
            </template>
          </el-table-column>
          <el-table-column prop="username" label="用户名" />
          <el-table-column prop="email" label="邮箱" />
          <el-table-column prop="role" label="角色">
            <template #default="scope">
              <el-tag
                :type="scope.row.role === 'admin' ? 'danger' : (scope.row.role === 'member' ? 'success' : 'info')"
              >
                {{ formatRole(scope.row.role) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="260">
            <template #default="scope">
              <el-button size="small" @click="openRoleDialog(scope.row)">设置角色</el-button>
              <el-button size="small" @click="openAvatarDialog(scope.row)">设置头像</el-button>
              <el-button size="small" type="danger" plain @click="handleDelete(scope.row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>
      
      <el-tab-pane label="作品管理" name="portfolios">
        <div class="table-actions">
           <el-button type="primary" size="small" @click="fetchPortfolios">刷新列表</el-button>
        </div>
        <el-table :data="portfolios.filter(p => p.status === 'approved')" style="width: 100%" stripe v-loading="loadingPortfolios">
          <el-table-column prop="thumbnailUrl" label="封面" width="120">
            <template #default="scope">
              <img
                v-if="scope.row.thumbnailUrl"
                :src="resolveImageUrl(scope.row.thumbnailUrl)"
                style="width: 80px; height: 50px; object-fit: cover; border-radius: 4px"
              />
              <span v-else>无封面</span>
            </template>
          </el-table-column>
          <el-table-column prop="title" label="标题" />
          <el-table-column prop="type" label="类型">
             <template #default="scope">
               <el-tag>{{ formatType(scope.row.type) }}</el-tag>
             </template>
          </el-table-column>
          <el-table-column prop="user.username" label="作者" />
          <el-table-column prop="createdAt" label="上传时间">
            <template #default="scope">
              {{ formatDate(scope.row.createdAt) }}
            </template>
          </el-table-column>
          <el-table-column prop="status" label="状态" width="100">
            <template #default="scope">
              <el-tag :type="scope.row.status === 'approved' ? 'success' : 'warning'">
                {{ scope.row.status === 'approved' ? '已发布' : '待审核' }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="260">
            <template #default="scope">
              <el-button
                size="small"
                @click="$router.push(`/portfolio/${scope.row._id}`)"
              >
                查看
              </el-button>
              <el-button
                v-if="scope.row.status !== 'approved'"
                size="small"
                type="success"
                plain
                @click="handleApprovePortfolio(scope.row._id)"
              >
                通过
              </el-button>
              <el-button size="small" type="danger" plain @click="handleDeletePortfolio(scope.row._id)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>

      <el-tab-pane label="任务管理" name="tasks">
        <div class="table-actions" style="margin-bottom: 15px;">
           <el-button type="primary" @click="openTaskDialog">发布新任务</el-button>
           <el-button size="small" @click="fetchTasks">刷新</el-button>
        </div>
        <el-table :data="tasks" style="width: 100%" stripe v-loading="loadingTasks">
          <el-table-column prop="title" label="任务标题" />
          <el-table-column prop="type" label="类型" width="120">
            <template #default="scope">
              <el-tag>{{ formatTaskType(scope.row.type) }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="description" label="描述" show-overflow-tooltip />
          <el-table-column prop="deadline" label="截止日期" width="140">
            <template #default="scope">
              {{ formatDate(scope.row.deadline) }}
            </template>
          </el-table-column>
          <el-table-column prop="createdBy.username" label="发布人" width="140" />
          <el-table-column label="指派对象" min-width="180">
            <template #default="scope">
              <div v-if="scope.row.assignees && scope.row.assignees.length">
                <el-tag
                  v-for="a in scope.row.assignees"
                  :key="a.user?._id || a.user"
                  size="small"
                  style="margin-right: 4px; margin-bottom: 4px"
                >
                  {{ a.user?.username || findUsername(a.user) }}
                </el-tag>
              </div>
              <span v-else>未指定</span>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="260">
            <template #default="scope">
              <el-button
                size="small"
                @click="$router.push({ path: '/portfolio', query: { taskId: scope.row._id } })"
              >
                查看作品合集
              </el-button>
              <el-button size="small" @click="openAssignDialog(scope.row)">指派</el-button>
              <el-button size="small" type="danger" plain @click="handleDeleteTask(scope.row._id)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>

      <el-tab-pane label="内容审核" name="audit">
        <div class="table-actions">
          <el-button type="primary" size="small" @click="fetchPortfolios">刷新列表</el-button>
        </div>

        <h3 style="margin: 10px 0;">普通作品审核</h3>
        <el-table
          :data="pendingNormalPortfolios"
          style="width: 100%"
          stripe
          v-loading="loadingPortfolios"
        >
          <el-table-column prop="thumbnailUrl" label="封面" width="120">
            <template #default="scope">
              <img
                v-if="scope.row.thumbnailUrl"
                :src="resolveImageUrl(scope.row.thumbnailUrl)"
                style="width: 80px; height: 50px; object-fit: cover; border-radius: 4px"
              />
              <span v-else>无封面</span>
            </template>
          </el-table-column>
          <el-table-column prop="title" label="标题" />
          <el-table-column prop="type" label="类型" width="120">
            <template #default="scope">
              <el-tag>{{ formatType(scope.row.type) }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="user.username" label="作者" />
          <el-table-column prop="createdAt" label="上传时间" width="160">
            <template #default="scope">
              {{ formatDate(scope.row.createdAt) }}
            </template>
          </el-table-column>
          <el-table-column label="操作" width="220">
            <template #default="scope">
              <el-button
                size="small"
                type="primary"
                plain
                @click="$router.push(`/portfolio/${scope.row._id}`)"
              >
                查看详情
              </el-button>
              <el-button
                size="small"
                type="success"
                plain
                @click="handleApprovePortfolio(scope.row._id)"
              >
                通过
              </el-button>
              <el-button
                size="small"
                type="danger"
                plain
                @click="handleDeletePortfolio(scope.row._id)"
              >
                删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>

        <h3 style="margin: 20px 0 10px;">任务作品审核</h3>
        <el-table
          :data="pendingTaskPortfolios"
          style="width: 100%"
          stripe
          v-loading="loadingPortfolios"
        >
          <el-table-column prop="thumbnailUrl" label="封面" width="120">
            <template #default="scope">
              <img
                v-if="scope.row.thumbnailUrl"
                :src="resolveImageUrl(scope.row.thumbnailUrl)"
                style="width: 80px; height: 50px; object-fit: cover; border-radius: 4px"
              />
              <span v-else>无封面</span>
            </template>
          </el-table-column>
          <el-table-column prop="title" label="标题" />
          <el-table-column prop="type" label="类型" width="120">
            <template #default="scope">
              <el-tag>{{ formatType(scope.row.type) }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="task.title" label="所属任务" />
          <el-table-column prop="user.username" label="作者" />
          <el-table-column prop="createdAt" label="上传时间" width="160">
            <template #default="scope">
              {{ formatDate(scope.row.createdAt) }}
            </template>
          </el-table-column>
          <el-table-column label="操作" width="220">
            <template #default="scope">
              <el-button
                size="small"
                type="primary"
                plain
                @click="$router.push(`/portfolio/${scope.row._id}`)"
              >
                查看详情
              </el-button>
              <el-button
                size="small"
                type="success"
                plain
                @click="handleApprovePortfolio(scope.row._id)"
              >
                通过
              </el-button>
              <el-button
                size="small"
                type="danger"
                plain
                @click="handleDeletePortfolio(scope.row._id)"
              >
                删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>
      <el-tab-pane label="数据统计" name="stats">
        <div class="stats-grid">
          <div class="stat-card">
            <h3>总用户数</h3>
            <p class="stat-number">{{ users.length }}</p>
          </div>
          <div class="stat-card">
            <h3>作品总数</h3>
            <p class="stat-number">{{ portfolios.length }}</p>
          </div>
        </div>
      </el-tab-pane>
      <el-tab-pane label="网页设置" name="settings">
        <div class="settings-section">
          <h3>首页轮播图设置</h3>
          <el-button type="primary" size="small" @click="addCarouselItem" style="margin-bottom: 15px">添加轮播图</el-button>
          
          <el-table :data="carouselItems" style="width: 100%" border>
            <el-table-column label="图片预览" width="180">
              <template #default="scope">
                <img :src="scope.row.image" style="width: 150px; height: 85px; object-fit: cover; border-radius: 4px" />
              </template>
            </el-table-column>
            <el-table-column prop="title" label="标题" />
            <el-table-column prop="subtitle" label="副标题" />
            <el-table-column label="操作" width="180">
              <template #default="scope">
                <el-button size="small" @click="editCarouselItem(scope.$index, scope.row)">编辑</el-button>
                <el-button size="small" type="danger" @click="deleteCarouselItem(scope.$index)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>

          <div style="margin-top: 20px; text-align: right">
            <el-button type="success" @click="saveSettings">保存更改</el-button>
          </div>
        </div>

        <el-divider />

        <div class="settings-section">
          <h3>首页精选视频设置</h3>
          <p class="section-desc">在此处添加要展示在首页的精选视频，支持外部链接。</p>
          <el-button type="primary" size="small" @click="addFeaturedVideo" style="margin-bottom: 15px">添加精选视频</el-button>
          
          <el-table :data="featuredVideos" style="width: 100%" border>
             <el-table-column label="封面预览" width="180">
              <template #default="scope">
                <img :src="scope.row.thumbnail" style="width: 150px; height: 85px; object-fit: cover; border-radius: 4px" />
              </template>
            </el-table-column>
            <el-table-column prop="title" label="标题" />
            <el-table-column prop="url" label="视频链接" show-overflow-tooltip />
            <el-table-column label="操作" width="180">
              <template #default="scope">
                <el-button size="small" @click="editFeaturedVideo(scope.$index, scope.row)">编辑</el-button>
                <el-button size="small" type="danger" @click="deleteFeaturedVideo(scope.$index)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>

          <div style="margin-top: 20px; text-align: right">
            <el-button type="success" @click="saveSettings">保存更改</el-button>
          </div>
        </div>

        <el-divider />

        <div class="settings-section">
          <h3>首页社团成员展示</h3>
          <p class="section-desc">选择要展示在首页的社团成员。</p>
          
          <el-select
            v-model="selectedMembers"
            multiple
            filterable
            placeholder="请选择要在首页展示的成员"
            style="width: 100%"
          >
            <el-option
              v-for="user in users"
              :key="user._id"
              :label="user.username"
              :value="user._id"
            />
          </el-select>

          <div style="margin-top: 20px; text-align: right">
            <el-button type="success" @click="saveSettings">保存更改</el-button>
          </div>
        </div>

        <el-divider />

        <div class="settings-section">
          <h3>底部联系信息</h3>
          <el-form label-width="100px" style="max-width: 600px">
            <el-form-item label="联系邮箱">
              <el-input v-model="contactEmail" />
            </el-form-item>
            <el-form-item label="联系地址">
              <el-input v-model="contactAddress" />
            </el-form-item>
          </el-form>
          <div style="margin-top: 20px; text-align: right">
            <el-button type="success" @click="saveSettings">保存更改</el-button>
          </div>
        </div>

        <el-divider />

        <div class="settings-section">
          <h3>社团概况设置</h3>
          <el-form label-width="100px">
            <el-form-item label="概况内容">
              <el-input 
                v-model="aboutContent" 
                type="textarea" 
                :rows="10" 
                placeholder="请输入社团概况内容，支持简单文本换行" 
              />
            </el-form-item>
          </el-form>
          <div style="margin-top: 20px; text-align: right">
            <el-button type="success" @click="saveSettings">保存更改</el-button>
          </div>
        </div>

      </el-tab-pane>
    </el-tabs>

    <!-- Carousel Edit Dialog -->
    <el-dialog v-model="dialogVisible" :title="dialogTitle">
      <el-form :model="currentCarousel" label-width="80px">
        <el-form-item label="图片">
          <el-upload
            class="avatar-uploader"
            action="#"
            :show-file-list="false"
            :http-request="customUploadRequest"
            :on-success="handleImageSuccess"
            :before-upload="beforeImageUpload"
          >
            <img v-if="currentCarousel.image" :src="currentCarousel.image" class="avatar" />
            <el-icon v-else class="avatar-uploader-icon"><Plus /></el-icon>
          </el-upload>
          <div style="margin-top: 10px; width: 100%">
            <el-input v-model="currentCarousel.image" placeholder="或输入图片URL" />
          </div>
        </el-form-item>
        <el-form-item label="标题">
          <el-input v-model="currentCarousel.title" />
        </el-form-item>
        <el-form-item label="副标题">
          <el-input v-model="currentCarousel.subtitle" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="currentCarousel.description" type="textarea" />
        </el-form-item>
        <el-form-item label="跳转链接">
          <el-input v-model="currentCarousel.link" placeholder="/portfolio 或 https://..." />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="confirmCarouselEdit">确定</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- Task Assign Dialog -->
    <el-dialog v-model="assignDialogVisible" title="指派任务" width="480px">
      <div v-if="currentTaskForAssign">
        <p style="margin-bottom: 12px;">
          当前任务：<strong>{{ currentTaskForAssign.title }}</strong>
        </p>
        <el-form label-width="80px">
          <el-form-item label="指派给">
            <el-select
              v-model="selectedAssignees"
              multiple
              filterable
              placeholder="请选择要指派的社员"
              style="width: 100%"
            >
              <el-option
                v-for="u in users"
                :key="u._id"
                :label="`${u.username}（${formatRole(u.role)}）`"
                :value="u._id"
              />
            </el-select>
          </el-form-item>
        </el-form>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="assignDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitAssign">保存</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- Featured Video Edit Dialog -->
    <el-dialog v-model="videoDialogVisible" :title="videoDialogTitle">
      <el-form :model="currentVideo" label-width="80px">
        <el-form-item label="封面">
          <el-upload
            class="avatar-uploader"
            action="#"
            :show-file-list="false"
            :http-request="customVideoThumbUploadRequest"
            :on-success="handleVideoThumbSuccess"
            :before-upload="beforeImageUpload"
          >
            <img v-if="currentVideo.thumbnail" :src="currentVideo.thumbnail" class="avatar" />
            <el-icon v-else class="avatar-uploader-icon"><Plus /></el-icon>
          </el-upload>
          <div style="margin-top: 10px; width: 100%">
            <el-input v-model="currentVideo.thumbnail" placeholder="或输入封面URL" />
          </div>
        </el-form-item>
        <el-form-item label="标题">
          <el-input v-model="currentVideo.title" />
        </el-form-item>
        <el-form-item label="视频链接">
          <el-input v-model="currentVideo.url" placeholder="https://..." />
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="currentVideo.description" type="textarea" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="videoDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="confirmVideoEdit">确定</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- Task Create Dialog -->
    <el-dialog v-model="taskDialogVisible" title="发布新任务">
      <el-form :model="newTask" label-width="80px">
        <el-form-item label="任务标题">
          <el-input v-model="newTask.title" placeholder="请输入任务标题" />
        </el-form-item>
        <el-form-item label="任务类型">
          <el-select v-model="newTask.type" placeholder="请选择任务类型">
            <el-option label="摄影作品" value="photo" />
            <el-option label="视频创作" value="video" />
            <el-option label="后期修图" value="post_prod" />
            <el-option label="通用任务" value="general" />
          </el-select>
        </el-form-item>
        <el-form-item label="任务描述">
          <el-input v-model="newTask.description" type="textarea" rows="4" placeholder="请输入详细的任务描述" />
        </el-form-item>
        <el-form-item label="截止日期">
          <el-date-picker
            v-model="newTask.deadline"
            type="date"
            placeholder="选择截止日期"
            style="width: 100%"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="taskDialogVisible = false">取消</el-button>
          <el-button type="primary" :loading="creatingTask" @click="submitTask">发布</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- User Avatar Dialog -->
    <el-dialog v-model="avatarDialogVisible" title="设置用户头像" width="420px">
      <div v-if="avatarUser">
        <div style="text-align: center; margin-bottom: 20px">
          <el-avatar
            :size="100"
            :src="avatarUser.avatarUrl ? resolveImageUrl(avatarUser.avatarUrl) : ''"
          >
            {{ avatarUser.username?.[0] || '用' }}
          </el-avatar>
          <div style="margin-top: 10px">{{ avatarUser.username }}</div>
        </div>
        <input
          ref="adminFileInputRef"
          type="file"
          accept="image/*"
          class="hidden-file-input"
          @change="handleAdminFileChange"
        />
        <el-button type="primary" :loading="adminAvatarUploading" @click="triggerAdminFileSelect">
          选择图片
        </el-button>
        <div v-if="adminCropImageUrl" class="avatar-cropper-wrapper" style="margin-top: 20px">
          <div
            class="cropper-viewport"
            @mousedown="onAdminCropMouseDown"
            @mousemove="onAdminCropMouseMove"
            @mouseup="onAdminCropMouseUp"
            @mouseleave="onAdminCropMouseUp"
            @touchstart.stop.prevent="onAdminCropTouchStart"
            @touchmove.stop.prevent="onAdminCropTouchMove"
            @touchend="onAdminCropTouchEnd"
            @touchcancel="onAdminCropTouchEnd"
          >
            <img
              :src="adminCropImageUrl"
              class="cropper-image"
              :style="adminCropImageStyle"
              draggable="false"
            />
            <div class="cropper-frame"></div>
          </div>
          <div class="cropper-controls">
            <span class="cropper-label">缩放</span>
            <el-slider
              v-model="adminCropZoom"
              :min="1"
              :max="3"
              :step="0.01"
              @input="onAdminCropZoomChange"
            />
          </div>
        </div>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="handleAdminAvatarDialogClose">取消</el-button>
          <el-button type="primary" :loading="adminAvatarUploading" @click="handleAdminCropConfirm">
            确定裁剪并上传
          </el-button>
        </span>
      </template>
    </el-dialog>

    <!-- Create User Dialog -->
    <el-dialog v-model="createUserDialogVisible" title="新增用户" width="420px">
      <el-form :model="createUserForm" label-width="90px">
        <el-form-item label="用户名">
          <el-input v-model="createUserForm.username" />
        </el-form-item>
        <el-form-item label="邮箱">
          <el-input v-model="createUserForm.email" />
        </el-form-item>
        <el-form-item label="初始密码">
          <el-input v-model="createUserForm.password" type="password" show-password />
        </el-form-item>
        <el-form-item label="角色">
          <el-select v-model="createUserForm.role" placeholder="请选择角色">
            <el-option label="社员" value="member" />
            <el-option label="管理员" value="admin" />
            <el-option label="游客" value="guest" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="createUserDialogVisible = false">取消</el-button>
          <el-button type="primary" :loading="creatingUser" @click="submitCreateUser">确定</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- Set Role Dialog -->
    <el-dialog v-model="roleDialogVisible" title="设置用户角色" width="360px">
      <div v-if="currentUserForRole">
        <p style="margin-bottom: 12px;">
          当前用户：<strong>{{ currentUserForRole.username }}</strong>
        </p>
        <el-radio-group v-model="roleForm.role">
          <el-radio label="guest">游客</el-radio>
          <el-radio label="member">社员</el-radio>
          <el-radio label="admin">管理员</el-radio>
        </el-radio-group>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="roleDialogVisible = false">取消</el-button>
          <el-button type="primary" :loading="updatingRole" @click="submitRoleChange">保存</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive, computed } from 'vue';
import { ElMessage, ElMessageBox, type UploadProps } from 'element-plus';
import { useSiteSettingsStore, type CarouselItem, type FeaturedVideo } from '../stores/siteSettings';
import { storeToRefs } from 'pinia';
import { Plus } from '@element-plus/icons-vue';
import request from '../utils/request';

const siteSettingsStore = useSiteSettingsStore();
const { carouselItems, featuredVideos, featuredMembers, contactEmail, contactAddress, aboutContent } = storeToRefs(siteSettingsStore);
const activeTab = ref('users');

const users = ref<any[]>([]);
const avatarDialogVisible = ref(false);
const avatarUser = ref<any | null>(null);
const adminFileInputRef = ref<HTMLInputElement | null>(null);
const adminAvatarUploading = ref(false);
const adminCropImageUrl = ref<string | null>(null);
const adminCropImageElement = ref<HTMLImageElement | null>(null);
const adminCropZoom = ref(1);
const adminCropX = ref(0);
const adminCropY = ref(0);
const adminCropDragging = ref(false);
const adminDragStartX = ref(0);
const adminDragStartY = ref(0);
const adminDragStartCropX = ref(0);
const adminDragStartCropY = ref(0);
const adminCropBaseScale = ref(1);
const adminCropTouchZooming = ref(false);
const adminCropInitialDistance = ref(0);
const adminCropInitialZoom = ref(1);

const ADMIN_CROP_SIZE = 300;

const resolveImageUrl = (url: string) => {
  if (!url) return '';
  const uploadsIndex = url.indexOf('/uploads/');
  if (uploadsIndex !== -1) {
    const path = url.substring(uploadsIndex);
    const isNetlify = window.location.hostname.endsWith('netlify.app');
    return isNetlify ? `/.netlify/functions/proxy${path}` : `http://112.124.10.28${path}`;
  }
  return url;
};

// --- Users Management ---
const fetchUsers = async () => {
  try {
    const res: any = await request.get('/users');
    if (Array.isArray(res)) {
       users.value = res;
    }
  } catch (error) {
    console.error(error);
  }
};

const formatRole = (role: string) => {
  if (role === 'admin') return '管理员';
  if (role === 'member') return '社员';
  return '游客';
};

const createUserDialogVisible = ref(false);
const creatingUser = ref(false);
const createUserForm = reactive({
  username: '',
  email: '',
  password: '',
  role: 'member'
});

const openCreateUserDialog = () => {
  createUserForm.username = '';
  createUserForm.email = '';
  createUserForm.password = '';
  createUserForm.role = 'member';
  createUserDialogVisible.value = true;
};

const submitCreateUser = async () => {
  if (!createUserForm.username || !createUserForm.email || !createUserForm.password) {
    ElMessage.warning('请填写完整的用户信息');
    return;
  }
  creatingUser.value = true;
  try {
    await request.post('/users', createUserForm);
    ElMessage.success('用户创建成功');
    createUserDialogVisible.value = false;
    fetchUsers();
  } catch (error: any) {
    const msg = error?.response?.data?.message || '创建失败';
    ElMessage.error(msg);
  } finally {
    creatingUser.value = false;
  }
};

const roleDialogVisible = ref(false);
const updatingRole = ref(false);
const currentUserForRole = ref<any | null>(null);
const roleForm = reactive({
  role: 'guest'
});

const openRoleDialog = (row: any) => {
  currentUserForRole.value = row;
  roleForm.role = row.role;
  roleDialogVisible.value = true;
};

const submitRoleChange = async () => {
  if (!currentUserForRole.value) return;
  updatingRole.value = true;
  try {
    await request.put(`/users/${currentUserForRole.value._id}/role`, {
      role: roleForm.role
    });
    ElMessage.success('角色已更新');
    roleDialogVisible.value = false;
    fetchUsers();
  } catch (error: any) {
    const msg = error?.response?.data?.message || '更新失败';
    ElMessage.error(msg);
  } finally {
    updatingRole.value = false;
  }
};

// --- Featured Members ---
const selectedMembers = ref<string[]>([]);

// --- Featured Videos Management ---
const videoDialogVisible = ref(false);
const videoDialogTitle = ref('添加精选视频');
const editingVideoIndex = ref(-1);
const currentVideo = ref<FeaturedVideo>({
  thumbnail: '',
  title: '',
  url: '',
  description: ''
});

const handleVideoThumbSuccess: UploadProps['onSuccess'] = (response) => {
  currentVideo.value.thumbnail = response.imageUrl;
};

const customVideoThumbUploadRequest = async (options: any) => {
  try {
    const imageUrl = await siteSettingsStore.uploadImage(options.file);
    options.onSuccess({ imageUrl });
  } catch (error) {
    options.onError(error);
  }
};

const addFeaturedVideo = () => {
  videoDialogTitle.value = '添加精选视频';
  editingVideoIndex.value = -1;
  currentVideo.value = { thumbnail: '', title: '', url: '', description: '' };
  videoDialogVisible.value = true;
};

const editFeaturedVideo = (index: number, item: FeaturedVideo) => {
  videoDialogTitle.value = '编辑精选视频';
  editingVideoIndex.value = index;
  currentVideo.value = { ...item };
  videoDialogVisible.value = true;
};

const deleteFeaturedVideo = (index: number) => {
  ElMessageBox.confirm('确定删除这个视频吗？', '提示', { type: 'warning' })
    .then(() => {
      featuredVideos.value.splice(index, 1);
    })
    .catch(() => {});
};

const confirmVideoEdit = () => {
  if (editingVideoIndex.value === -1) {
    featuredVideos.value.push({ ...currentVideo.value });
  } else {
    featuredVideos.value[editingVideoIndex.value] = { ...currentVideo.value };
  }
  videoDialogVisible.value = false;
};

// --- Portfolios Management ---
const portfolios = ref<any[]>([]);
const loadingPortfolios = ref(false);

const pendingNormalPortfolios = computed(() =>
  portfolios.value.filter((p: any) => p.status !== 'approved' && !p.task)
);

const pendingTaskPortfolios = computed(() =>
  portfolios.value.filter((p: any) => p.status !== 'approved' && p.task)
);

const fetchPortfolios = async () => {
  loadingPortfolios.value = true;
  try {
    const res = await request.get('/portfolios/admin');
    portfolios.value = res as any;
  } catch (error) {
    console.error(error);
    ElMessage.error('获取作品列表失败');
  } finally {
    loadingPortfolios.value = false;
  }
};

const handleApprovePortfolio = (id: string) => {
  ElMessageBox.confirm('确定通过这个作品的审核吗？', '提示', { type: 'info' })
    .then(async () => {
      try {
        await request.post(`/portfolios/${id}/approve`);
        ElMessage.success('已通过审核');
        fetchPortfolios();
      } catch (error) {
        ElMessage.error('操作失败');
      }
    })
    .catch(() => {});
};

const handleDeletePortfolio = (id: string) => {
  ElMessageBox.confirm('确定要删除这个作品吗？', '警告', { type: 'warning' })
    .then(async () => {
      try {
        await request.delete(`/portfolios/${id}`);
        ElMessage.success('删除成功');
        fetchPortfolios();
      } catch (error) {
        ElMessage.error('删除失败');
      }
    })
    .catch(() => {});
};

const formatType = (type: string) => {
  const map: Record<string, string> = {
    photo: '摄影作品',
    video: '视频创作',
    post_prod: '后期修图'
  };
  return map[type] || type;
};

const formatDate = (dateStr: string) => {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleDateString();
};

// --- Tasks Management ---
const tasks = ref<any[]>([]);
const loadingTasks = ref(false);
const taskDialogVisible = ref(false);
const creatingTask = ref(false);
const newTask = reactive({
  title: '',
  description: '',
  deadline: '',
  type: 'general'
});

const assignDialogVisible = ref(false);
const currentTaskForAssign = ref<any | null>(null);
const selectedAssignees = ref<string[]>([]);

const openAssignDialog = (task: any) => {
  currentTaskForAssign.value = task;
  selectedAssignees.value = Array.isArray(task.assignees)
    ? task.assignees.map((a: any) => (a.user?._id || a.user))
    : [];
  assignDialogVisible.value = true;
};

const submitAssign = async () => {
  if (!currentTaskForAssign.value) return;
  try {
    await request.put(`/tasks/${currentTaskForAssign.value._id}/assignees`, {
      assigneeIds: selectedAssignees.value
    });
    ElMessage.success('指派成功');
    assignDialogVisible.value = false;
    fetchTasks();
  } catch (error) {
    ElMessage.error('指派失败');
  }
};

const findUsername = (userId: string) => {
  const user = users.value.find((u: any) => u._id === userId);
  return user ? user.username : '未知成员';
};

const formatTaskType = (type: string) => {
  const map: Record<string, string> = {
    photo: '摄影作品',
    video: '视频创作',
    post_prod: '后期修图',
    general: '通用任务'
  };
  return map[type] || '通用任务';
};

const fetchTasks = async () => {
  loadingTasks.value = true;
  try {
    const res = await request.get('/tasks');
    tasks.value = res as any;
  } catch (error) {
    console.error(error);
    ElMessage.error('获取任务列表失败');
  } finally {
    loadingTasks.value = false;
  }
};

const openTaskDialog = () => {
  newTask.title = '';
  newTask.description = '';
  newTask.deadline = '';
  newTask.type = 'general';
  taskDialogVisible.value = true;
};

const submitTask = async () => {
  if (!newTask.title) {
    ElMessage.warning('请输入任务标题');
    return;
  }
  
  creatingTask.value = true;
  try {
    await request.post('/tasks', newTask);
    ElMessage.success('任务发布成功');
    taskDialogVisible.value = false;
    fetchTasks();
  } catch (error) {
    ElMessage.error('发布失败');
  } finally {
    creatingTask.value = false;
  }
};

const handleDeleteTask = (id: string) => {
  ElMessageBox.confirm('确定要删除这个任务吗？', '警告', { type: 'warning' })
    .then(async () => {
      try {
        await request.delete(`/tasks/${id}`);
        ElMessage.success('删除成功');
        fetchTasks();
      } catch (error) {
        ElMessage.error('删除失败');
      }
    })
    .catch(() => {});
};

const handleTabChange = (tab: string) => {
  if (tab === 'portfolios' || tab === 'audit') {
    fetchPortfolios();
  } else if (tab === 'tasks') {
    fetchTasks();
  }
};

// Carousel Editing Logic
const dialogVisible = ref(false);
const dialogTitle = ref('添加轮播图');
const editingIndex = ref(-1);
const currentCarousel = ref<CarouselItem>({
  image: '',
  title: '',
  subtitle: '',
  description: '',
  link: ''
});

const handleImageSuccess: UploadProps['onSuccess'] = (response) => {
  currentCarousel.value.image = response.imageUrl;
};

const beforeImageUpload: UploadProps['beforeUpload'] = (rawFile) => {
  if (rawFile.size / 1024 / 1024 > 5) {
    ElMessage.error('Avatar picture must not exceed 5MB!');
    return false;
  }
  return true;
};

const customUploadRequest = async (options: any) => {
  try {
    const imageUrl = await siteSettingsStore.uploadImage(options.file);
    options.onSuccess({ imageUrl });
  } catch (error) {
    options.onError(error);
  }
};

const addCarouselItem = () => {
  dialogTitle.value = '添加轮播图';
  editingIndex.value = -1;
  currentCarousel.value = { image: '', title: '', subtitle: '', description: '', link: '' };
  dialogVisible.value = true;
};

const editCarouselItem = (index: number, item: CarouselItem) => {
  dialogTitle.value = '编辑轮播图';
  editingIndex.value = index;
  currentCarousel.value = { ...item };
  dialogVisible.value = true;
};

const deleteCarouselItem = (index: number) => {
  ElMessageBox.confirm('确定删除这张轮播图吗？', '提示', { type: 'warning' })
    .then(() => {
      carouselItems.value.splice(index, 1);
    })
    .catch(() => {});
};

const confirmCarouselEdit = () => {
  if (editingIndex.value === -1) {
    carouselItems.value.push({ ...currentCarousel.value });
  } else {
    carouselItems.value[editingIndex.value] = { ...currentCarousel.value };
  }
  dialogVisible.value = false;
};

const openAvatarDialog = (row: any) => {
  avatarUser.value = row;
  avatarDialogVisible.value = true;
};

const triggerAdminFileSelect = () => {
  if (adminFileInputRef.value && !adminAvatarUploading.value) {
    adminFileInputRef.value.value = '';
    adminFileInputRef.value.click();
  }
};

const adminCropDisplayedWidth = computed(() => {
  if (!adminCropImageElement.value) {
    return 0;
  }
  return adminCropImageElement.value.width * adminCropBaseScale.value * adminCropZoom.value;
});

const adminCropDisplayedHeight = computed(() => {
  if (!adminCropImageElement.value) {
    return 0;
  }
  return adminCropImageElement.value.height * adminCropBaseScale.value * adminCropZoom.value;
});

const adminCropImageStyle = computed(() => {
  const width = adminCropDisplayedWidth.value;
  const height = adminCropDisplayedHeight.value;
  return {
    width: width + 'px',
    height: height + 'px',
    transform: `translate(${adminCropX.value}px, ${adminCropY.value}px)`
  };
});

const clampAdminCropPosition = () => {
  const width = adminCropDisplayedWidth.value;
  const height = adminCropDisplayedHeight.value;
  if (!width || !height) {
    return;
  }
  const minX = ADMIN_CROP_SIZE - width;
  const minY = ADMIN_CROP_SIZE - height;
  if (adminCropX.value < minX) {
    adminCropX.value = minX;
  }
  if (adminCropY.value < minY) {
    adminCropY.value = minY;
  }
  if (adminCropX.value > 0) {
    adminCropX.value = 0;
  }
  if (adminCropY.value > 0) {
    adminCropY.value = 0;
  }
};

const onAdminCropMouseDown = (event: MouseEvent) => {
  if (!adminCropImageElement.value) {
    return;
  }
  adminCropDragging.value = true;
  adminDragStartX.value = event.clientX;
  adminDragStartY.value = event.clientY;
  adminDragStartCropX.value = adminCropX.value;
  adminDragStartCropY.value = adminCropY.value;
};

const onAdminCropMouseMove = (event: MouseEvent) => {
  if (!adminCropDragging.value) {
    return;
  }
  const deltaX = event.clientX - adminDragStartX.value;
  const deltaY = event.clientY - adminDragStartY.value;
  adminCropX.value = adminDragStartCropX.value + deltaX;
  adminCropY.value = adminDragStartCropY.value + deltaY;
  clampAdminCropPosition();
};

const onAdminCropMouseUp = () => {
  adminCropDragging.value = false;
};

const getAdminTouchDistance = (t1: Touch, t2: Touch) => {
  const dx = t2.clientX - t1.clientX;
  const dy = t2.clientY - t1.clientY;
  return Math.sqrt(dx * dx + dy * dy);
};

const onAdminCropTouchStart = (event: TouchEvent) => {
  if (!adminCropImageElement.value) {
    return;
  }
  if (event.touches.length === 1) {
    adminCropTouchZooming.value = false;
    adminCropDragging.value = true;
    const touch = event.touches.item(0);
    if (!touch) {
      return;
    }
    adminDragStartX.value = touch.clientX;
    adminDragStartY.value = touch.clientY;
    adminDragStartCropX.value = adminCropX.value;
    adminDragStartCropY.value = adminCropY.value;
  } else if (event.touches.length === 2) {
    adminCropDragging.value = false;
    adminCropTouchZooming.value = true;
    const t1 = event.touches.item(0);
    const t2 = event.touches.item(1);
    if (!t1 || !t2) {
      return;
    }
    adminCropInitialDistance.value = getAdminTouchDistance(t1, t2);
    adminCropInitialZoom.value = adminCropZoom.value;
  }
};

const onAdminCropTouchMove = (event: TouchEvent) => {
  if (!adminCropImageElement.value) {
    return;
  }
  if (adminCropTouchZooming.value && event.touches.length >= 2) {
    const t1 = event.touches.item(0);
    const t2 = event.touches.item(1);
    if (!t1 || !t2) {
      return;
    }
    const distance = getAdminTouchDistance(t1, t2);
    if (!adminCropInitialDistance.value) {
      return;
    }
    const factor = distance / adminCropInitialDistance.value;
    let nextZoom = adminCropInitialZoom.value * factor;
    if (nextZoom < 1) {
      nextZoom = 1;
    }
    if (nextZoom > 3) {
      nextZoom = 3;
    }
    onAdminCropZoomChange(nextZoom);
  } else if (adminCropDragging.value && event.touches.length === 1) {
    const touch = event.touches.item(0);
    if (!touch) {
      return;
    }
    const deltaX = touch.clientX - adminDragStartX.value;
    const deltaY = touch.clientY - adminDragStartY.value;
    adminCropX.value = adminDragStartCropX.value + deltaX;
    adminCropY.value = adminDragStartCropY.value + deltaY;
    clampAdminCropPosition();
  }
};

const onAdminCropTouchEnd = () => {
  adminCropDragging.value = false;
  adminCropTouchZooming.value = false;
};

const onAdminCropZoomChange = (value: number) => {
  if (!adminCropImageElement.value) {
    adminCropZoom.value = value;
    return;
  }
  const widthBefore = adminCropDisplayedWidth.value;
  const heightBefore = adminCropDisplayedHeight.value;
  adminCropZoom.value = value;
  const widthAfter = adminCropDisplayedWidth.value;
  const heightAfter = adminCropDisplayedHeight.value;
  const centerX = ADMIN_CROP_SIZE / 2;
  const centerY = ADMIN_CROP_SIZE / 2;
  if (!widthBefore || !heightBefore || !widthAfter || !heightAfter) {
    adminCropX.value = (ADMIN_CROP_SIZE - widthAfter) / 2;
    adminCropY.value = (ADMIN_CROP_SIZE - heightAfter) / 2;
  } else {
    const offsetX = adminCropX.value;
    const offsetY = adminCropY.value;
    const distX = centerX - offsetX;
    const distY = centerY - offsetY;
    const ratioX = distX / widthBefore;
    const ratioY = distY / heightBefore;
    adminCropX.value = centerX - widthAfter * ratioX;
    adminCropY.value = centerY - heightAfter * ratioY;
  }
  clampAdminCropPosition();
};

const resetAdminCropState = () => {
  adminCropImageUrl.value = null;
  adminCropImageElement.value = null;
  adminCropZoom.value = 1;
  adminCropX.value = 0;
  adminCropY.value = 0;
  adminCropDragging.value = false;
};

const handleAdminFileChange = async (event: Event) => {
  if (!avatarUser.value || !avatarUser.value._id) {
    return;
  }
  const target = event.target as HTMLInputElement;
  const file = target.files && target.files[0];
  if (!file) {
    return;
  }

  if (file.size / 1024 / 1024 > 5) {
    ElMessage.error('头像图片不能超过 5MB');
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

    adminCropImageUrl.value = dataUrl;
    adminCropImageElement.value = loadedImage;
    adminCropZoom.value = 1;
    adminCropBaseScale.value = ADMIN_CROP_SIZE / Math.min(loadedImage.width, loadedImage.height);
    const width = adminCropDisplayedWidth.value;
    const height = adminCropDisplayedHeight.value;
    adminCropX.value = (ADMIN_CROP_SIZE - width) / 2;
    adminCropY.value = (ADMIN_CROP_SIZE - height) / 2;
    clampAdminCropPosition();
  } catch (error) {
    ElMessage.error('加载图片失败');
  }
};

const handleAdminAvatarDialogClose = () => {
  avatarDialogVisible.value = false;
  resetAdminCropState();
};

const handleAdminCropConfirm = async () => {
  if (!avatarUser.value || !avatarUser.value._id || !adminCropImageElement.value) {
    avatarDialogVisible.value = false;
    resetAdminCropState();
    return;
  }
  adminAvatarUploading.value = true;
  try {
    const canvas = document.createElement('canvas');
    canvas.width = ADMIN_CROP_SIZE;
    canvas.height = ADMIN_CROP_SIZE;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Canvas not supported');
    }
    const scale = adminCropBaseScale.value * adminCropZoom.value;
    const sxRaw = (0 - adminCropX.value) / scale;
    const syRaw = (0 - adminCropY.value) / scale;
    const sSize = ADMIN_CROP_SIZE / scale;
    let sx = sxRaw;
    let sy = syRaw;
    if (sx < 0) {
      sx = 0;
    }
    if (sy < 0) {
      sy = 0;
    }
    if (sx + sSize > adminCropImageElement.value.width) {
      sx = adminCropImageElement.value.width - sSize;
    }
    if (sy + sSize > adminCropImageElement.value.height) {
      sy = adminCropImageElement.value.height - sSize;
    }
    ctx.drawImage(
      adminCropImageElement.value,
      sx,
      sy,
      sSize,
      sSize,
      0,
      0,
      ADMIN_CROP_SIZE,
      ADMIN_CROP_SIZE
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
    await request.post(`/users/${avatarUser.value._id}/avatar`, formData);
    ElMessage.success('头像已更新');
    avatarDialogVisible.value = false;
    resetAdminCropState();
    fetchUsers();
  } catch (error) {
    ElMessage.error('上传头像失败');
  } finally {
    adminAvatarUploading.value = false;
  }
};

const saveSettings = async () => {
  try {
    // featuredMembers.value needs to be updated with selectedMembers.value (IDs)
    // The store action will send the IDs to backend
    
    const payload = {
      carouselItems: carouselItems.value,
      featuredVideos: featuredVideos.value,
      featuredMembers: selectedMembers.value,
      contactEmail: contactEmail.value,
      contactAddress: contactAddress.value,
      aboutContent: aboutContent.value
    };
    
    await siteSettingsStore.updateSettings(payload);
    ElMessage.success('设置已保存');
  } catch (error) {
    console.error(error);
    ElMessage.error('保存失败');
  }
};

const handleDelete = (row: any) => {
  ElMessageBox.confirm(
    `确定要删除用户 ${row.username} 吗?`,
    '警告',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    }
  )
    .then(() => {
      ElMessage.success('删除成功');
    })
    .catch(() => {
      ElMessage.info('取消删除');
    });
};

onMounted(async () => {
  await fetchUsers();
  await siteSettingsStore.fetchSettings();
  
  // Sync store featuredMembers to local selectedMembers for el-select
  // The store stores objects (populated) or IDs? 
  // Backend populates featuredMembers.
  // We need to map them to IDs for the select component if they are objects.
  if (featuredMembers.value && featuredMembers.value.length > 0) {
    selectedMembers.value = featuredMembers.value.map((m: any) => typeof m === 'string' ? m : m._id);
  }
});
</script>

<style scoped>
.admin-dashboard {
  max-width: 1200px;
  margin: 0 auto;
  padding: 40px 20px;
}

.header-section {
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

.admin-tabs {
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.05);
  border: none;
}

:deep(.el-tabs__header) {
  background-color: #f5f7fa;
  border-bottom: 1px solid #e4e7ed;
  border-radius: 8px 8px 0 0;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
}

.stat-card {
  background: #f9f9f9;
  padding: 20px;
  border-radius: 8px;
  text-align: center;
}

.stat-number {
  font-size: 2.5rem;
  font-weight: bold;
  color: var(--primary-color);
  margin-top: 10px;
}

.settings-section {
  padding: 20px;
}

.avatar-uploader .el-upload {
  border: 1px dashed var(--el-border-color);
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: var(--el-transition-duration-fast);
}

.avatar-uploader .el-upload:hover {
  border-color: var(--el-color-primary);
}

.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 178px;
  height: 178px;
  text-align: center;
}

.avatar {
  width: 178px;
  height: 178px;
  display: block;
  object-fit: cover;
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
</style>
