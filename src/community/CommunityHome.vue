<template>
  <div class="community-page">
    <section class="community-hero" aria-labelledby="community-title">
      <div class="community-tides" aria-hidden="true"><span></span><span></span><span></span></div>
      <div class="community-wrap community-hero-inner">
        <div class="community-intro">
          <p class="community-hero-badge">地理共同体 · 观察 · 实证 · 讨论</p>
          <h1 id="community-title">从一个真实地理问题，开始对照与讨论</h1>

          <!-- 首屏核心实验直达卡（桌面与 390×844 手机首屏均可一键开始） -->
          <div class="flagship-compare-card" role="region" aria-label="3分钟城市内涝对照实验入口">
            <div class="flagship-card-body">
              <div class="flagship-card-badges">
                <span class="flagship-tag-main">🌧 3 分钟互动对照实验</span>
                <span class="flagship-tag-sim">教学仿真，非现场实测</span>
              </div>
              <h2 class="flagship-question">同一场雨，哪种路面积水更严重？</h2>
              <p class="flagship-desc">
                固定 <strong>50 mm/h</strong> 暴雨、历时 <strong>60 分钟</strong>：并排切换「水泥/沥青（峰值 <strong>44.4 m³/s</strong>）」与「天然植被（<strong>11.7 m³/s</strong>）」，记下一句解释即可生成可复现证据卡。
              </p>
            </div>
            <div class="flagship-card-cta">
              <router-link
                to="/inquiry?task=urban-flood&mode=compare&rain=50&duration=60&slope=2&surfaceA=concrete&surfaceB=vegetation"
                class="baroque-btn baroque-btn-primary flagship-start-btn"
              >
                开始比较 →
              </router-link>
            </div>
          </div>

          <!-- 清楚区分“搜讨论”与“搜全站” -->
          <form class="community-search baroque-search" role="search" aria-label="搜索社区讨论" @submit.prevent="runSearch">
            <label class="sr-only" for="community-query">搜索社区讨论</label>
            <input id="community-query" v-model="queryInput" type="search" placeholder="搜讨论：输入话题、问题或关键词" maxlength="100" />
            <button class="baroque-btn baroque-btn-primary" type="submit">搜讨论</button>
          </form>

          <div class="community-hero-actions">
            <a class="baroque-btn baroque-btn-primary" href="#compose" @click.prevent="focusCompose">发起讨论</a>
            <button type="button" class="baroque-btn hero-global-search-btn" @click="triggerGlobalSearch">
              🔍 搜全站（实验 / 教材 / 数据）
            </button>
            <router-link class="baroque-btn" to="/resources">资源馆</router-link>
            <router-link class="baroque-btn" to="/groups">找社群</router-link>
            <router-link v-if="isAdmin" class="baroque-btn" to="/community/manage">社区管理</router-link>
          </div>
        </div>
        <div class="community-hero-right">
          <CommunityMiniGlobe />

          <aside class="community-discovery community-discovery-compact" aria-label="地理探索路径">
            <p class="discovery-eyebrow">从观察，流向理解</p>
            <div class="discovery-links-grid">
              <router-link to="/inquiry?task=urban-flood&mode=compare&rain=50&duration=60&slope=2&surfaceA=concrete&surfaceB=vegetation">
                <span>01</span>
                <div><strong>动手对照：城市内涝仿真</strong><small>50 mm/h 暴雨径流对比</small></div>
                <span aria-hidden="true">↗</span>
              </router-link>
              <router-link to="/geo-labs/satellite">
                <span>02</span>
                <div><strong>真实数据：多时相卫星影像</strong><small>NASA 遥感卷帘对比</small></div>
                <span aria-hidden="true">↗</span>
              </router-link>
              <router-link to="/learning">
                <span>03</span>
                <div><strong>教材精读：让知识彼此连接</strong><small>初高中与大学教材机理</small></div>
                <span aria-hidden="true">↗</span>
              </router-link>
            </div>
          </aside>
        </div>
      </div>
    </section>

    <section class="community-wrap" aria-labelledby="fanxing-entry-title">
      <div class="community-section-heading baroque-frame fanxing-entry">
        <div>
          <div class="fanxing-title-row">
            <h2 id="fanxing-entry-title">繁星计划</h2>
            <span class="fanxing-preview-badge">课题协作示例预览</span>
          </div>
          <p>浏览地理探究协作课题示例，了解研究招募、分工与阶段性成果展示流程（当前为课题示范预览）。</p>
        </div>
        <router-link class="baroque-btn" to="/fanxing">浏览课题示例 →</router-link>
      </div>
    </section>

    <div id="community-feed" class="community-wrap community-layout">
      <!-- 讨论主栏 -->
      <div class="community-main">
        <!-- 运行模式状态横幅 -->
        <aside v-if="isDemoMode" class="demo-mode-banner" aria-label="运行模式提示">
          <div class="demo-banner-content">
            <span class="demo-banner-tag">✦ 学术演示模式</span>
            <span>当前云端账号服务暂未连接，已载入本地地理学术讨论示例；发帖及交互将在本机浏览器即时生效。</span>
          </div>
          <div class="demo-banner-actions">
            <button class="baroque-btn baroque-btn-sm" type="button" :disabled="loading" @click="retryOnline">
              {{ loading ? '连接中…' : '连接云端服务' }}
            </button>
          </div>
        </aside>

        <div class="community-section-heading">
          <div>
            <h2>{{ searchQuery ? `检索：“${searchQuery}”` : selectedCategoryName ? `${selectedCategoryName} 分区` : selectedTag ? `标签 #${selectedTag}` : '全部讨论' }}</h2>
          </div>
          <button v-if="searchQuery || selectedCategory || kind || selectedTag || onlySolved" class="community-clear baroque-btn baroque-btn-sm" type="button" @click="clearFilters">清除全部筛选</button>
        </div>

        <!-- 筛选与排序控制器 -->
        <div class="community-toolbar">
          <div class="community-filters" aria-label="讨论类型">
            <button type="button" :class="['baroque-filter-btn', { active: kind === '' && !onlySolved }]" @click="setKind('')">全部动态</button>
            <button type="button" :class="['baroque-filter-btn', { active: kind === 'question' && !onlySolved }]" @click="setKind('question')">❓ 学术问答</button>
            <button type="button" :class="['baroque-filter-btn', { active: kind === 'discussion' }]" @click="setKind('discussion')">💬 经验探讨</button>
            <button type="button" :class="['baroque-filter-btn', { active: onlySolved }]" :aria-pressed="onlySolved" @click="toggleSolved">✓ 已采纳问答</button>
          </div>
          <div class="community-sort" aria-label="排序规则">
            <button type="button" :class="['baroque-sort-btn', { active: sortMode === 'newest' }]" @click="setSort('newest')">最新发布</button>
            <button type="button" :class="['baroque-sort-btn', { active: sortMode === 'popular' }]" @click="setSort('popular')">最受关注 🔥</button>
          </div>
        </div>

        <!-- 骨架屏加载状态（请求未完成前绝不闪现空状态） -->
        <div v-if="(loading || !initialLoaded) && !posts.length && !error" class="skeleton-stack" aria-busy="true" role="status">
          <div v-for="i in 3" :key="i" class="skeleton-card" style="margin-bottom: 16px">
            <div class="skeleton-box skeleton-line skeleton-line-short"></div>
            <div class="skeleton-box skeleton-line skeleton-line-title"></div>
            <div class="skeleton-box skeleton-line"></div>
          </div>
        </div>

        <p v-else-if="error && !posts.length" class="community-state community-error" role="alert">
          {{ error }}
          <br />
          <span style="display: inline-flex; gap: 10px; flex-wrap: wrap; justify-content: center; margin-top: 12px">
            <button class="baroque-btn baroque-btn-sm" type="button" @click="loadPosts()">重新尝试</button>
            <button class="baroque-btn baroque-btn-sm" type="button" @click="enableLocalPreviewDemo()">浏览离线精选讨论示例</button>
          </span>
        </p>
        <p v-else-if="initialLoaded && !loading && !posts.length" class="community-state">暂时没有符合条件的讨论。换个关键词，或发起新讨论吧。</p>

        <div v-else class="community-post-list">
          <article v-for="post in posts" :key="post.id" class="community-post-card baroque-frame">
            <div class="community-post-meta">
              <span class="category-pill">{{ post.category }}</span>
              <span :class="['kind-pill', post.kind === 'question' ? 'kind-question' : 'kind-discussion']">
                {{ post.kind === 'question' ? '学术问答' : '学术交流' }}
              </span>
              <span v-if="post.acceptedReplyId" class="accepted-pill">✓ 最佳答案已采纳</span>
              <span v-if="post.linkedExperiment" class="experiment-pill">🔬 附带 3D 实验</span>
              <span v-if="post.evidenceId" class="evidence-badge" style="margin-left: 4px">📊 附带探究证据卡</span>
            </div>

            <h3 class="post-title">
              <router-link :to="`/community/post/${post.id}`">{{ post.title }}</router-link>
            </h3>

            <p class="post-excerpt">{{ post.excerpt }}</p>
            <p v-if="post.acceptedAnswerExcerpt" class="post-excerpt">✓ 已采纳回答：{{ post.acceptedAnswerExcerpt }}</p>

            <!-- 社区列表内嵌结构化证据卡摘要（先看静态对照结论与来源，点击后再按需打开完整 3D/遥感场景） -->
            <div v-if="resolvePostEvidence(post)" class="post-evidence-strip" role="region" aria-label="帖子附带的观察证据卡">
              <div class="pes-head">
                <span class="pes-model">{{ resolvePostEvidence(post).modelName }}</span>
                <span :class="['pes-nature', resolvePostEvidence(post).isRealData ? 'is-real' : 'is-sim']">
                  {{ resolvePostEvidence(post).disclaimer }}
                </span>
              </div>
              <div v-if="resolvePostEvidence(post).groupA && resolvePostEvidence(post).groupB" class="pes-compare-row">
                <div class="pes-col">
                  <small>{{ resolvePostEvidence(post).groupA.label }}</small>
                  <strong>{{ resolvePostEvidence(post).groupA.metric }}</strong>
                </div>
                <span class="pes-vs" aria-hidden="true">vs</span>
                <div class="pes-col">
                  <small>{{ resolvePostEvidence(post).groupB.label }}</small>
                  <strong>{{ resolvePostEvidence(post).groupB.metric }}</strong>
                </div>
              </div>
              <div class="pes-foot">
                <span class="pes-cond">{{ resolvePostEvidence(post).conditions }}</span>
                <router-link :to="resolvePostEvidence(post).route" class="pes-open-link" @click.stop>
                  🔬 打开同一次观察 ↗
                </router-link>
              </div>
            </div>

            <!-- 标签列表 -->
            <div v-if="post.tags && post.tags.length" class="post-tags-row">
              <span v-for="t in post.tags" :key="t" class="post-tag-item" @click.stop="filterByTag(t)">#{{ t }}</span>
            </div>

            <div class="community-post-foot">
              <span class="author-info">
                <router-link v-if="post.authorId" :to="`/community/user/${post.authorId}`" class="author-link" @click.stop>
                  👤 {{ post.author }}
                </router-link>
                <span v-else>👤 {{ post.author }}</span>
                <span class="post-date">· {{ formatDate(post.createdAt) }}</span>
              </span>

              <div class="post-stats-right">
                <span class="stat-badge">赞同 {{ post.likeCount || 0 }}</span>
                <span class="stat-badge">回复 {{ post.replyCount || 0 }}</span>
              </div>
            </div>
          </article>
        </div>

        <p v-if="error && posts.length" class="community-state community-error" role="alert">{{ error }}</p>
        <button v-if="lastPageCount === 20" class="community-more baroque-btn baroque-btn-brass" type="button" :disabled="loading" @click="nextPage">
          {{ loading ? '读取中…' : '翻阅更多讨论' }}
        </button>

        <!-- 撰写与发起讨论板块 -->
        <section id="compose" ref="composeRef" class="community-compose baroque-frame" aria-labelledby="compose-title">
          <div class="community-section-heading">
            <div>
              <p class="community-eyebrow">提问与分享</p>
              <h2 id="compose-title">发起讨论</h2>
            </div>
          </div>

          <div v-if="!user && !isDemoMode" class="community-state compose-login-banner">
            <span>登录后就能提问和回复。你在这里填写的草稿会自动保存在本机，登录后不会丢失。</span>
            <a :href="loginComposeHref" class="baroque-btn baroque-btn-sm baroque-btn-primary" style="margin-left: 10px" @click="rememberComposeReturn">登录 / 注册 ↗</a>
          </div>

          <form class="community-compose-form" @submit.prevent="createPost">
            <!-- 学生友好提问模板提示条 -->
            <div class="compose-scaffold-bar">
              <div class="scaffold-text">
                <strong>💡 提问小帮手：</strong>
                <span>可以先写“我看到……；我猜……，因为……；我还想知道……”，也可以只提一个你想弄懂的问题。</span>
              </div>
              <div class="scaffold-actions">
                <button type="button" class="formula-chip" @click="applyStudentScaffold">插入观察提问模板</button>
                <button v-if="draft.title || draft.body" type="button" class="formula-chip" @click="clearDraft">清空草稿</button>
              </div>
            </div>

            <div class="community-form-row">
              <label>讨论类型
                <select v-model="draft.kind">
                  <option value="question">提出科学问答 (寻找解答)</option>
                  <option value="discussion">经验与学术交流 (分享观察与想法)</option>
                </select>
              </label>
              <label>学科分区
                <select v-model.number="draft.categoryId" required>
                  <option disabled value="">请选择学科分区</option>
                  <option v-for="category in (categories.length ? categories : mockCategories)" :key="category.id" :value="category.id">{{ category.name }}</option>
                </select>
              </label>
            </div>

            <label>议题标题
              <input v-model.trim="draft.title" required maxlength="120" placeholder="用一句话写下你想问的问题或观察到的现象（例如：为什么同纬度沿海比内陆温差小？）" />
            </label>

            <!-- 公式快捷助手工具栏 -->
            <div class="editor-assist-bar">
              <span class="assist-label">地学公式助手：</span>
              <button
                v-for="item in GEO_FORMULA_PRESETS"
                :key="item.name"
                type="button"
                class="formula-chip"
                :title="item.desc"
                @click="insertFormulaToDraft(item.latex)"
              >
                {{ item.name }}
              </button>
            </div>

            <label>正文内容（支持写观察现象、实验结果或思考过程，也支持 $公式$ 与 $$块级公式$$）
              <textarea v-model.trim="draft.body" required maxlength="10000" rows="7" placeholder="我看到：……&#10;我猜：……，因为……&#10;我还想知道：……（也可以只写你困惑的一点，有数据或模型来源欢迎一并附上）" />
            </label>

            <div class="community-form-row">
              <label>话题标签 (逗号或空格隔开，可选)
                <input v-model.trim="tagsInput" maxlength="60" placeholder="如：城市内涝, 热力环流, 喀斯特, 遥感" />
              </label>
              <label>附上站内 3D 实验 (可选)
                <select v-model="draft.linkedExperiment">
                  <option value="">不附带实验模型</option>
                  <option value="solar-motion">太阳视运动与正午太阳高度 3D 实验室</option>
                  <option value="seasons">四季成因与太阳直射点回归运动</option>
                  <option value="fault-model">断层模型（挤压造山与断裂）</option>
                  <option value="thermal-circulation">热力环流与风向动力学</option>
                  <option value="water-cycle-3d">三维水循环与陆地径流</option>
                  <option value="moon-phases">月相与日地月空间几何</option>
                  <option value="earth-system">地球内部圈层与构造</option>
                  <option value="stream-table">水土冲刷微缩实验台</option>
                </select>
              </label>
              <label>附上探究证据卡 (可选)
                <select v-model="draft.evidenceId">
                  <option value="">不附带探究证据卡</option>
                  <option v-for="ev in STANDARD_EVIDENCES" :key="ev.id" :value="ev.id">
                    [{{ ev.taskTitle }}] {{ ev.title }}
                  </option>
                </select>
              </label>
            </div>

            <!-- 讨论发帖预览：当挂载了探究证据卡时，清晰展示模型名称、条件、结果、证据类型、适用边界与「教学仿真／真实观测」说明 -->
            <div v-if="selectedEvidenceCard" class="compose-evidence-preview" role="region" aria-label="已附带的科学证据卡预览">
              <div class="cep-head">
                <span class="cep-badge">📊 已附带科学观察证据卡</span>
                <span :class="['cep-disclaimer', { 'is-real': selectedEvidenceCard.isRealData }]">
                  {{ selectedEvidenceCard.disclaimer || '教学仿真，非现场实测' }}
                </span>
              </div>
              <h4 class="cep-title">{{ selectedEvidenceCard.title }}</h4>
              <p v-if="selectedEvidenceCard.modelName" class="cep-meta">
                <strong>模型/图层名称：</strong>{{ selectedEvidenceCard.modelName }} · <strong>证据类型：</strong>{{ selectedEvidenceCard.evidenceType }}
              </p>
              <p v-if="selectedEvidenceCard.conditions" class="cep-meta">
                <strong>实验/观测条件：</strong>{{ selectedEvidenceCard.conditions }}
              </p>
              <div v-if="selectedEvidenceCard.groupA && selectedEvidenceCard.groupB" class="pes-compare-row" style="margin: 8px 0">
                <div class="pes-col">
                  <small>{{ selectedEvidenceCard.groupA.label }}</small>
                  <strong>{{ selectedEvidenceCard.groupA.metric }}</strong>
                </div>
                <span class="pes-vs" aria-hidden="true">vs</span>
                <div class="pes-col">
                  <small>{{ selectedEvidenceCard.groupB.label }}</small>
                  <strong>{{ selectedEvidenceCard.groupB.metric }}</strong>
                </div>
              </div>
              <p class="cep-facts">{{ selectedEvidenceCard.facts }}</p>
              <p v-if="selectedEvidenceCard.limitations" class="cep-limits">{{ selectedEvidenceCard.limitations }}</p>
              <router-link :to="draft.compareUrl || selectedEvidenceCard.route" class="cep-reproduce-link">
                🔗 打开同一次观察（核对同一组参数与结果）↗
              </router-link>
            </div>

            <p v-if="submitError" class="community-error" role="alert">{{ submitError }}</p>
            <div class="form-submit-row">
              <span v-if="draftSavedHint" class="draft-saved-hint">{{ draftSavedHint }}</span>
              <button class="baroque-btn baroque-btn-primary" type="submit" :disabled="submitting">
                {{ submitting ? '正在发布…' : (!user && !isDemoMode ? '保存草稿并去登录发布 ↗' : '发布讨论 ✦') }}
              </button>
            </div>
          </form>
        </section>
      </div>

      <!-- 侧边栏：巴洛克学术分区与快捷社群 -->
      <aside class="community-sidebar">
        <!-- 专业分区 -->
        <section class="community-side-block baroque-frame">
          <div class="side-block-header">
            <span class="baroque-corner-ornament">⚜</span>
            <h2>学科分区</h2>
          </div>
          <p v-if="!categories.length" class="community-side-note">正在载入学科分区……</p>
          <div class="category-menu">
            <button
              v-for="category in categories"
              :key="category.id"
              class="community-category baroque-cat-btn"
              type="button"
              :class="{ active: selectedCategory === category.id }"
              :aria-pressed="selectedCategory === category.id"
              @click="setCategory(category.id)"
            >
              <div class="cat-left">
                <span class="cat-name">{{ category.name }}</span>
                <small class="cat-desc">{{ category.description }}</small>
              </div>
              <span class="cat-arrow">→</span>
            </button>
          </div>
        </section>

        <!-- 社群 QQ 导航微卡 -->
        <section class="community-side-block baroque-frame group-side-promo">
          <div class="side-block-header">
            <span class="baroque-corner-ornament">📜</span>
            <h2>学习与研究社群</h2>
          </div>
          <p class="side-promo-desc">找同学、聊课题、备考研、磨教案。社群信息在核实公开展示授权后收录；也欢迎先在站内公开讨论。</p>
          <router-link to="/groups" class="baroque-btn baroque-btn-sm baroque-btn-brass promo-btn">
            浏览全部社群导航 →
          </router-link>
        </section>

        <!-- 3D 实验室与数据探究快捷入口 -->
        <section class="community-side-block baroque-frame">
          <div class="side-block-header">
            <span class="baroque-corner-ornament">🧭</span>
            <h2>地学互动入口</h2>
          </div>
          <div class="side-link-list">
            <router-link to="/experiments" class="side-exp-link">
              <span>🔬 3D 虚拟地理实验室</span>
              <small>29 项地理过程三维交互模型</small>
            </router-link>
            <router-link to="/resources" class="side-exp-link">
              <span>📚 开放地理科学数据馆</span>
              <small>找地形（DEM）、天气（ERA5）与地图数据</small>
            </router-link>
            <router-link to="/geo-labs" class="side-exp-link">
              <span>🛰 真实遥感数据探究</span>
              <small>珠峰地形剖面与多时相卫星影像对比</small>
            </router-link>
            <router-link to="/calendar" class="side-exp-link">
              <span>⏳ 地理时间轴与日历</span>
              <small>节气天象预测与全球地震实录</small>
            </router-link>
          </div>
        </section>
      </aside>
    </div>

    <!-- 地理学前沿热点聚合专栏 -->
    <section class="community-wrap hot-topics-bar baroque-frame" aria-labelledby="hot-topics-title">
      <div class="hot-topics-header">
        <span class="baroque-corner-ornament">❖</span>
        <h3 id="hot-topics-title">近期地理事件</h3>
        <span class="hot-topics-subtitle">美国国家航空航天局（NASA EONET）与美国地质调查局（USGS）来源记录</span>
        <router-link class="baroque-btn baroque-btn-sm" to="/calendar">打开地理日历</router-link>
      </div>
      <p class="community-side-note">按来源的最近记录时间排列；事件位置与时间可能是近似值。这里区分机构监测事件线索与站内用户讨论，不代表全网热度排名。</p>
      <div class="topic-source-status" aria-label="来源同步状态">
        <span v-for="source in topicSources" :key="source.source">
          {{ source.name }} · {{ source.status === 'error' ? '更新失败，保留缓存' : source.stale ? '等待更新' : '已同步' }}
          <small v-if="source.fetchedAt">（站点同步：{{ formatDateTime(source.fetchedAt) }}）</small>
        </span>
        <button type="button" class="topic-summary-toggle" :disabled="hotTopicLoading" @click="loadHotTopics">
          {{ hotTopicLoading ? '读取中…' : '刷新记录' }}
        </button>
        <button v-if="!hotTopics.length" type="button" class="topic-summary-toggle" @click="loadSampleHotTopics">
          查看监测事件卡片示例
        </button>
      </div>
      <p v-if="hotTopicError" class="community-state community-error" role="status">{{ hotTopicError }}</p>
      <p v-else-if="!hotTopics.length" class="community-state" role="status">暂时没有可核实的近期事件，请稍后再看。</p>
      <div class="hot-topics-grid">
        <article v-for="topic in hotTopics" :key="topic.id" class="hot-topic-card">
          <div class="topic-card-badges">
            <span class="topic-tag">{{ topic.tag }}</span>
            <span class="topic-origin-badge">{{ getEventOriginBadge(topic).label }}</span>
            <span v-if="topic.isSample" class="topic-sample-badge">离线格式示例</span>
          </div>
          <h4>{{ eventDisplayTitle(topic.title) }}</h4>
          <small v-if="eventDisplayTitle(topic.title) !== topic.title" class="topic-raw-title">原文：{{ topic.title }}</small>

          <dl class="topic-structured-meta">
            <div>
              <dt>📍 监测地点</dt>
              <dd>{{ extractEventPlace(topic) }}</dd>
            </div>
            <div>
              <dt>🕒 事件记录时间</dt>
              <dd>{{ formatDateTime(topic.occurredAt) }}</dd>
            </div>
            <div>
              <dt>🔄 站点同步时间</dt>
              <dd>{{ formatDateTime(topic.fetchedAt) }}</dd>
            </div>
          </dl>

          <p class="topic-clean-summary">{{ cleanEventSummary(topic.summary, topic) }}</p>

          <div class="topic-question-box">
            <span>💡 {{ buildEventDiscussionQuestion(topic) }}</span>
          </div>

          <button
            v-if="!topic.isSample"
            type="button"
            class="topic-summary-toggle"
            :aria-expanded="expandedTopicId === topic.id"
            :aria-controls="`topic-summary-${topic.id}`"
            @click="toggleTopicSummary(topic.id)"
          >
            {{ expandedTopicId === topic.id ? '收起核验信息 ↑' : '查看摘要依据 ↓' }}
          </button>
          <div v-if="expandedTopicId === topic.id" :id="`topic-summary-${topic.id}`" class="topic-summary-detail">
            <p v-if="summaryLoadingIds[topic.id]" role="status">正在读取来源依据…</p>
            <p v-else-if="summaryErrors[topic.id]" class="community-error" role="alert">
              {{ summaryErrors[topic.id] }}
              <button type="button" class="topic-summary-toggle" @click="loadTopicSummary(topic.id)">重试</button>
            </p>
            <template v-else-if="topicSummaries[topic.id]">
              <strong>来源字段机器摘录 · 非 AI 生成</strong>
              <dl>
                <div><dt>资料来源</dt><dd>{{ topicSummaries[topic.id].sourceBasis }}</dd></div>
                <div><dt>事件记录</dt><dd>{{ formatDateTime(topicSummaries[topic.id].occurredAt) }}</dd></div>
                <div><dt>抓取核对</dt><dd>{{ formatDateTime(topicSummaries[topic.id].verifiedAt) }}</dd></div>
              </dl>
              <p class="topic-verification-note">{{ topicSummaries[topic.id].verificationNote }}</p>
              <a :href="topicSummaries[topic.id].sourceUrl" target="_blank" rel="noopener noreferrer">核对原始记录 ↗</a>
            </template>
          </div>
          <div class="topic-foot">
            <a :href="topic.sourceUrl" target="_blank" rel="noopener noreferrer">查看原始监测记录 ↗</a>
            <button type="button" class="topic-link" :disabled="openingTopicId === topic.id" @click="openTopic(topic)">
              {{ topic.postId ? '进入讨论 →' : openingTopicId === topic.id ? '正在建立讨论…' : '带着事件线索去提问 →' }}
            </button>
          </div>
        </article>
      </div>
    </section>
  </div>
</template>

<script setup>
import {
  eventDisplayTitle,
  formatEventTimeWithTz,
  cleanEventSummary,
  extractEventPlace,
  buildEventDiscussionQuestion,
  getEventOriginBadge
} from './eventTitle.js'
import { computed, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { accountEnabled, accountOrigin, apiRequest, authClient } from '../account/client.js'
import { mockCategories, mockPosts } from './mockData.js'
import { toast } from '../utils/toast.js'
import { GEO_FORMULA_PRESETS } from '../utils/mathFormula.js'
import { STANDARD_EVIDENCES, getEvidenceById, resolveCommunityEvidence } from '../inquiry/evidenceCatalog.js'
import CommunityMiniGlobe from './CommunityMiniGlobe.vue'

const router = useRouter()
const route = useRoute()
const categories = ref([])
const posts = ref([])
const hotTopics = ref([])
const hotTopicError = ref('')
const topicSources = ref([])
const hotTopicLoading = ref(false)
const openingTopicId = ref(null)
const expandedTopicId = ref(null)
const summaryLoadingIds = reactive({})
const topicSummaries = reactive({})
const summaryErrors = reactive({})
const user = ref(null)
const isAdmin = ref(false)
const loading = ref(true)
const initialLoaded = ref(false)
const submitting = ref(false)
const error = ref('')
const submitError = ref('')
const queryInput = ref('')
const searchQuery = ref('')
const selectedCategory = ref(null)
const selectedTag = ref('')
const kind = ref(route.query.kind === 'question' ? 'question' : '')
const onlySolved = ref(false)
const sortMode = ref('newest')
const page = ref(1)
const lastPageCount = ref(0)
const composeRef = ref(null)
const tagsInput = ref('')
const isDemoMode = ref(false)
const allowDemoMode = import.meta.env.DEV

const DRAFT_STORAGE_KEY = 'geo_community_post_draft_v1'
const draftSavedHint = ref('')

const draft = reactive({
  kind: 'question',
  categoryId: mockCategories[0]?.id || 1,
  title: '',
  body: '',
  linkedExperiment: '',
  evidenceId: '',
  compareUrl: '',
  evidenceTitle: '',
  conditions: '',
  facts: ''
})

const selectedEvidenceCard = computed(() =>
  resolveCommunityEvidence(draft.evidenceId, {
    compareUrl: draft.compareUrl,
    evidenceTitle: draft.evidenceTitle,
    conditions: draft.conditions,
    facts: draft.facts
  })
)

function resolvePostEvidence(post) {
  if (!post?.evidenceId && !post?.compareUrl) return null
  return resolveCommunityEvidence(post.evidenceId, {
    compareUrl: post.compareUrl,
    evidenceTitle: post.evidenceTitle,
    conditions: post.conditions,
    facts: post.facts
  })
}

function triggerGlobalSearch() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('geo:open-global-search'))
  }
}

const loginComposeHref = computed(() => {
  const base = accountOrigin || ''
  return `${base}/#/account?redirect=${encodeURIComponent('/?compose=1#compose')}`
})

function saveDraftToStorage() {
  try {
    if (!draft.title && !draft.body && !tagsInput.value && !draft.linkedExperiment && !draft.evidenceId) {
      localStorage.removeItem(DRAFT_STORAGE_KEY)
      draftSavedHint.value = ''
      return
    }
    localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify({
      kind: draft.kind,
      categoryId: Number(draft.categoryId) || 1,
      title: draft.title,
      body: draft.body,
      linkedExperiment: draft.linkedExperiment,
      evidenceId: draft.evidenceId,
      compareUrl: draft.compareUrl,
      evidenceTitle: draft.evidenceTitle,
      conditions: draft.conditions,
      facts: draft.facts,
      tagsInput: tagsInput.value
    }))
    draftSavedHint.value = '✓ 草稿已自动保存在本机'
  } catch {}
}

function restoreDraftFromStorage() {
  try {
    const raw = localStorage.getItem(DRAFT_STORAGE_KEY)
    if (!raw) return
    const parsed = JSON.parse(raw)
    if (parsed && typeof parsed === 'object') {
      if (parsed.kind) draft.kind = parsed.kind
      if (parsed.categoryId) draft.categoryId = Number(parsed.categoryId) || 1
      if (parsed.title && !draft.title) draft.title = parsed.title
      if (parsed.body && !draft.body) draft.body = parsed.body
      if (parsed.linkedExperiment && !draft.linkedExperiment) draft.linkedExperiment = parsed.linkedExperiment
      if (parsed.evidenceId && !draft.evidenceId) draft.evidenceId = parsed.evidenceId
      if (parsed.compareUrl && !draft.compareUrl) draft.compareUrl = parsed.compareUrl
      if (parsed.evidenceTitle && !draft.evidenceTitle) draft.evidenceTitle = parsed.evidenceTitle
      if (parsed.conditions && !draft.conditions) draft.conditions = parsed.conditions
      if (parsed.facts && !draft.facts) draft.facts = parsed.facts
      if (parsed.tagsInput && !tagsInput.value) tagsInput.value = parsed.tagsInput
    }
  } catch {}
}

function clearDraft() {
  draft.title = ''
  draft.body = ''
  tagsInput.value = ''
  draft.linkedExperiment = ''
  draft.evidenceId = ''
  draft.compareUrl = ''
  draft.evidenceTitle = ''
  draft.conditions = ''
  draft.facts = ''
  draftSavedHint.value = ''
  try { localStorage.removeItem(DRAFT_STORAGE_KEY) } catch {}
}

function applyStudentScaffold() {
  const template = '我看到：\n\n我猜：……，因为……\n\n我还想知道：'
  if (!draft.body.trim()) {
    draft.body = template
  } else if (!draft.body.includes('我看到：')) {
    draft.body = `${draft.body.trim()}\n\n${template}`
  }
  saveDraftToStorage()
}

function rememberComposeReturn() {
  saveDraftToStorage()
  try {
    localStorage.setItem('geo_auth_return_to', '/?compose=1#compose')
  } catch {}
}

watch(
  () => [draft.kind, draft.categoryId, draft.title, draft.body, draft.linkedExperiment, draft.evidenceId, tagsInput.value],
  () => { saveDraftToStorage() }
)

function insertFormulaToDraft(latex) {
  const snippet = ` $${latex}$ `
  draft.body += snippet
}

let stream
let topicRefreshTimer
let streamRefreshTimer
let postsController
let postsVersion = 0
let disposed = false

async function loadHotTopics() {
  clearTimeout(topicRefreshTimer)
  if (disposed || !accountEnabled || hotTopicLoading.value) return
  hotTopicLoading.value = true
  let delay = 60000
  try {
    const result = await apiRequest('/api/community/hot-topics')
    if (!Array.isArray(result?.topics)) throw new Error('事件服务返回的数据不完整')
    if (disposed) return
    hotTopics.value = result.topics
    topicSources.value = result.sources || []
    hotTopicError.value = result.refreshError
      ? '部分来源更新失败，保留上次有效记录。'
      : result.updating ? '服务器正在更新来源，以下记录可能尚未同步。' : ''
    if (result.updating) delay = 2000
  } catch (cause) {
    if (!disposed) hotTopicError.value = cause.message || '实时事件暂时无法获取，请稍后重试。'
  } finally {
    hotTopicLoading.value = false
    if (!disposed) topicRefreshTimer = setTimeout(() => {
      void refreshVisibleTopics()
    }, delay)
  }
}

function refreshVisibleTopics() {
  if (disposed) return
  if (document.visibilityState === 'visible') void loadHotTopics()
  else topicRefreshTimer = setTimeout(refreshVisibleTopics, 60000)
}

const formatDate = value => {
  try {
    return new Intl.DateTimeFormat('zh-CN', { year: 'numeric', month: 'short', day: 'numeric' }).format(new Date(value))
  } catch {
    return String(value)
  }
}

const formatDateTime = value => formatEventTimeWithTz(value)

function loadSampleHotTopics() {
  hotTopicError.value = ''
  hotTopics.value = [
    {
      id: 'sample-usgs-1',
      title: 'M6.4 地震 · 30 km WSW of Lata, Solomon Islands',
      tag: '地震',
      category: '地震',
      summary: 'USGS 显著地震目录记录：震级 M6.4，震源位于所罗门群岛拉塔西南偏西约 30 公里海域。',
      sourceUrl: 'https://earthquake.usgs.gov/earthquakes/map/',
      occurredAt: '2026-11-16T14:20:00Z',
      fetchedAt: '2026-11-16T14:35:00Z',
      isSample: true
    },
    {
      id: 'sample-eonet-1',
      title: 'Super Typhoon Man-yi',
      tag: '强风暴',
      category: '强风暴',
      summary: 'NASA EONET 收录的西太平洋热带气旋监测记录，卫星云图显示清晰眼墙结构。',
      sourceUrl: 'https://eonet.gsfc.nasa.gov/',
      occurredAt: '2026-11-16T12:00:00Z',
      fetchedAt: '2026-11-16T14:35:00Z',
      isSample: true
    }
  ]
}

async function loadTopicSummary(id) {
  if (summaryLoadingIds[id]) return
  summaryLoadingIds[id] = true
  delete summaryErrors[id]
  try {
    const result = await apiRequest(`/api/community/hot-topics/${id}/summary`)
    if (!result?.sourceUrl || !result?.sourceBasis || result.isAiGenerated !== false) {
      throw new Error('摘要依据不完整，请查看原始记录。')
    }
    topicSummaries[id] = result
  } catch (cause) {
    summaryErrors[id] = cause.message || '摘要依据暂时无法读取，请稍后重试。'
  } finally {
    delete summaryLoadingIds[id]
  }
}

function toggleTopicSummary(id) {
  expandedTopicId.value = expandedTopicId.value === id ? null : id
  if (expandedTopicId.value === id && !topicSummaries[id]) void loadTopicSummary(id)
}

const selectedCategoryName = computed(() => {
  if (!selectedCategory.value) return ''
  const cat = categories.value.find(c => c.id === selectedCategory.value)
  return cat ? cat.name : ''
})

function getLocalDemoPosts() {
  try {
    const raw = localStorage.getItem('local_community_posts')
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function saveLocalDemoPost(newPost) {
  try {
    const list = getLocalDemoPosts()
    list.unshift(newPost)
    localStorage.setItem('local_community_posts', JSON.stringify(list))
  } catch {
    // ignore
  }
}

async function loadPosts(append = false) {
  if (disposed) return
  postsController?.abort()
  const controller = new AbortController()
  postsController = controller
  const version = ++postsVersion
  const requestedPage = append ? page.value + 1 : 1
  loading.value = true
  error.value = ''
  try {
    if (!isDemoMode.value && accountEnabled) {
      const params = new URLSearchParams({ page: String(requestedPage) })
      if (searchQuery.value) params.set('q', searchQuery.value)
      if (selectedCategory.value) params.set('category', String(selectedCategory.value))
      if (kind.value) params.set('kind', kind.value)
      if (onlySolved.value) params.set('hasAccepted', '1')
      if (selectedTag.value) params.set('tag', selectedTag.value)
      if (sortMode.value === 'popular') params.set('sort', 'popular')
      const result = await apiRequest(`/api/community/posts?${params}`, { signal: controller.signal })
      if (disposed || controller.signal.aborted || version !== postsVersion) return
      if (!Array.isArray(result?.posts)) throw new Error('讨论服务返回的数据不完整')
      posts.value = append ? [...posts.value, ...result.posts] : result.posts
      page.value = requestedPage
      lastPageCount.value = result.posts.length
      loading.value = false
      initialLoaded.value = true
      return
    }
  } catch (cause) {
    if (disposed || controller.signal.aborted || version !== postsVersion) return
    if (!allowDemoMode) {
      error.value = cause.message || '讨论暂时无法载入，请稍后重试。'
      loading.value = false
      initialLoaded.value = true
      return
    }
    isDemoMode.value = true
  }

  if (disposed || controller.signal.aborted || version !== postsVersion) return

  if (!allowDemoMode && !isDemoMode.value) {
    posts.value = []
    lastPageCount.value = 0
    error.value = '云端社区尚未连接，暂时无法获取讨论。'
    loading.value = false
    initialLoaded.value = true
    return
  }

  // 离线/演示降级处理
  isDemoMode.value = true
  const localList = getLocalDemoPosts()
  let pool = [...localList, ...mockPosts]

  if (selectedCategory.value) {
    pool = pool.filter(p => p.category_id === selectedCategory.value)
  }
  if (kind.value) {
    pool = pool.filter(p => p.kind === kind.value)
  }
  if (onlySolved.value) {
    pool = pool.filter(p => p.kind === 'question' && p.accepted_reply_id)
  }
  if (selectedTag.value) {
    pool = pool.filter(p => p.tags && p.tags.includes(selectedTag.value))
  }
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase()
    pool = pool.filter(p => p.title.toLowerCase().includes(q) || p.body.toLowerCase().includes(q))
  }
  if (sortMode.value === 'popular') {
    pool.sort((a, b) => (b.likesCount || 0) - (a.likesCount || 0))
  }

  // 映射统一卡片字段
  const formattedPosts = pool.map(p => ({
    ...p,
    category: p.category || p.categoryName || '地学学术',
    excerpt: p.excerpt || (p.body ? p.body.slice(0, 120) + '…' : ''),
    author: p.author?.name || '地理同好',
    authorId: p.author?.id || null,
    createdAt: p.created_at,
    likeCount: p.likesCount || 0,
    replyCount: p.repliesCount || 0,
    acceptedReplyId: p.accepted_reply_id || null,
    linkedExperiment: p.linked_experiment || null
  }))
  const pagePosts = formattedPosts.slice((requestedPage - 1) * 20, requestedPage * 20)
  posts.value = append ? [...posts.value, ...pagePosts] : pagePosts
  page.value = requestedPage
  lastPageCount.value = pagePosts.length
  loading.value = false
  initialLoaded.value = true
}

function enableLocalPreviewDemo() {
  isDemoMode.value = true
  if (!categories.value.length) categories.value = mockCategories
  try { sessionStorage.setItem('geo_community_demo_preview', '1') } catch {}
  void loadPosts()
}

function preferredScroll() { return window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' }
function scrollToFeed() { document.getElementById('community-feed')?.scrollIntoView({ behavior: preferredScroll() }) }
function resetAndLoad() {
  page.value = 1
  posts.value = []
  lastPageCount.value = 0
  void loadPosts()
}
function runSearch() { searchQuery.value = queryInput.value.trim(); resetAndLoad(); scrollToFeed() }
function clearFilters() { queryInput.value = ''; searchQuery.value = ''; selectedCategory.value = null; selectedTag.value = ''; kind.value = ''; onlySolved.value = false; resetAndLoad() }
function setCategory(id) { selectedCategory.value = selectedCategory.value === id ? null : id; resetAndLoad() }
function setKind(value) { kind.value = value; if (value === 'discussion') onlySolved.value = false; resetAndLoad() }
function toggleSolved() { onlySolved.value = !onlySolved.value; if (onlySolved.value) kind.value = 'question'; resetAndLoad() }
function setSort(mode) { sortMode.value = mode; resetAndLoad() }
function filterByTag(tag) { selectedTag.value = tag; resetAndLoad() }

function prefillComposeFromTopic(topic) {
  const displayTitle = eventDisplayTitle(topic.title)
  draft.kind = 'question'
  draft.title = `【近期地理事件探讨】${displayTitle}`
  draft.body =
    `【事件线索来源】${getEventOriginBadge(topic).label}\n` +
    `【监测地点】${extractEventPlace(topic)}\n` +
    `【事件记录时间】${formatDateTime(topic.occurredAt)}\n` +
    `【站点同步时间】${formatDateTime(topic.fetchedAt)}\n` +
    `【原始监测链接】${topic.sourceUrl}\n\n` +
    `【探讨问题】${buildEventDiscussionQuestion(topic)}\n\n` +
    `【我的初步观察与分析】：`
  saveDraftToStorage()
  focusCompose()
}

async function openTopic(topic) {
  if (topic.postId) return router.push(`/community/post/${topic.postId}`)
  if (isDemoMode.value || topic.isSample) {
    prefillComposeFromTopic(topic)
    hotTopicError.value = '已将该事件线索、时间与来源链接填入下方发帖框，可直接编辑并发布探讨。'
    return
  }

  if (!user.value) {
    prefillComposeFromTopic(topic)
    hotTopicError.value = '请先登录，再发起实时事件的学术讨论（事件线索已为你保存在下方发帖草稿中）。'
    return
  }
  openingTopicId.value = topic.id
  hotTopicError.value = ''
  try {
    const result = await apiRequest(`/api/community/hot-topics/${topic.id}/discuss`, { method: 'POST' })
    await router.push(`/community/post/${result.id}`)
  } catch (cause) {
    prefillComposeFromTopic(topic)
    hotTopicError.value = cause.message || '暂时无法直接建立事件帖，已将事件线索填入下方发帖框。'
  } finally {
    openingTopicId.value = null
  }
}
function nextPage() { if (!loading.value) void loadPosts(true) }
function focusCompose() { composeRef.value?.scrollIntoView({ behavior: preferredScroll() }); composeRef.value?.querySelector('input')?.focus({ preventScroll: true }) }

async function retryOnline() {
  isDemoMode.value = false
  try { sessionStorage.removeItem('geo_community_demo_preview') } catch {}
  await initCommunity()
}

async function createPost() {
  if (!draft.title.trim() || !draft.body.trim()) {
    submitError.value = '请填写完整的标题和探讨内容。'
    return
  }
  if (!user.value && !isDemoMode.value) {
    rememberComposeReturn()
    toast.info('草稿已保存在本机，登录后即可直接发布！')
    window.location.href = loginComposeHref.value
    return
  }
  submitting.value = true
  submitError.value = ''
  try {
    const tags = tagsInput.value.split(/[,，\s]+/).map(t => t.trim()).filter(Boolean)
    const payload = {
      ...draft,
      tags
    }

    if (!isDemoMode.value && accountEnabled) {
      const result = await apiRequest('/api/community/posts', { method: 'POST', body: JSON.stringify(payload) })
      clearDraft()
      toast.success('讨论已成功发布！')
      await router.push(`/community/post/${result.id}`)
      return
    }

    if (!allowDemoMode && !isDemoMode.value) {
      submitError.value = '云端社区尚未连接，暂时无法发布讨论。'
      return
    }

    // 仅开发环境或显式开启的本地演示模式数据
    const newId = Date.now()
    const catObj = categories.value.find(c => c.id === Number(draft.categoryId))
    const localPost = {
      id: newId,
      title: draft.title,
      body: draft.body,
      kind: draft.kind,
      category_id: Number(draft.categoryId) || 1,
      categoryName: catObj ? catObj.name : '地理学综合交流',
      tags,
      linked_experiment: draft.linkedExperiment || null,
      evidenceId: draft.evidenceId || null,
      compareUrl: draft.compareUrl || null,
      evidenceTitle: draft.evidenceTitle || null,
      conditions: draft.conditions || null,
      facts: draft.facts || null,
      author: {
        id: 'me',
        name: user.value?.name || '我 (本地研究者)',
        title: '青年地学探索者'
      },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      likesCount: 1,
      bookmarksCount: 0,
      repliesCount: 0,
      replies: []
    }
    saveLocalDemoPost(localPost)
    toast.success('【演示模式】探讨已暂存于本地，可在列表中查看')
    clearDraft()
    await loadPosts()
  } catch (cause) {
    submitError.value = cause.message
  } finally {
    submitting.value = false
  }
}

function applyRouteQueryParams() {
  const q = route.query || {}
  if (typeof q.q === 'string' && q.q.trim()) {
    queryInput.value = q.q.trim()
    searchQuery.value = q.q.trim()
  }
  if (typeof q.title === 'string' && q.title.trim()) {
    draft.title = q.title.trim()
  }
  if (typeof q.body === 'string' && q.body.trim()) {
    draft.body = q.body.trim()
  }
  if (typeof q.linkedExperiment === 'string' && q.linkedExperiment.trim()) {
    draft.linkedExperiment = q.linkedExperiment.trim()
  }
  if (typeof q.evidenceId === 'string' && q.evidenceId.trim()) {
    draft.evidenceId = q.evidenceId.trim()
  }
  if (typeof q.compareUrl === 'string' && q.compareUrl.trim()) {
    draft.compareUrl = q.compareUrl.trim()
  }
  if (typeof q.evidenceTitle === 'string' && q.evidenceTitle.trim()) {
    draft.evidenceTitle = q.evidenceTitle.trim()
  }
  if (typeof q.conditions === 'string' && q.conditions.trim()) {
    draft.conditions = q.conditions.trim()
  }
  if (typeof q.facts === 'string' && q.facts.trim()) {
    draft.facts = q.facts.trim()
  }
  if (q.compose && (q.kind === 'question' || q.kind === 'discussion')) {
    draft.kind = q.kind
  }
  if (q.compose) {
    setTimeout(() => {
      focusCompose()
    }, 120)
  }
}

watch(() => route.query.kind, (value) => {
  if (route.name !== 'home') return
  if (route.query?.compose) return
  kind.value = value === 'question' ? 'question' : ''
  onlySolved.value = false
  resetAndLoad()
})

watch(() => route.query.q, (value) => {
  if (route.name !== 'home') return
  const nextQ = typeof value === 'string' ? value.trim() : ''
  if (nextQ !== searchQuery.value) {
    queryInput.value = nextQ
    searchQuery.value = nextQ
    resetAndLoad()
  }
})

watch(
  () => [route.query.compose, route.query.title, route.query.body, route.query.linkedExperiment, route.query.evidenceId, route.query.compareUrl],
  () => {
    if (route.name !== 'home') return
    applyRouteQueryParams()
  }
)

async function initCommunity() {
  restoreDraftFromStorage()
  applyRouteQueryParams()
  if (!accountEnabled) {
    isDemoMode.value = allowDemoMode
    categories.value = allowDemoMode ? mockCategories : []
    hotTopics.value = []
    hotTopicError.value = '云端服务尚未连接，实时事件暂不可用。'
    if (allowDemoMode && !draft.categoryId) draft.categoryId = Number(mockCategories[0].id)
    await loadPosts()
    return
  }

  try {
    void loadHotTopics()
    // 并行发起帖子加载与分类/会话读取，避免等待会话期间讨论区空白或闪现空结果
    const postsTask = loadPosts()
    const [categoryResult, sessionResult] = await Promise.allSettled([
      apiRequest('/api/community/categories'),
      authClient.getSession()
    ])
    if (disposed) return
    if (categoryResult.status === 'fulfilled' && categoryResult.value?.categories?.length) {
      categories.value = categoryResult.value.categories
      isDemoMode.value = false
    } else {
      categories.value = allowDemoMode ? mockCategories : []
      isDemoMode.value = allowDemoMode
    }

    if (sessionResult.status === 'fulfilled') {
      user.value = sessionResult.value.data?.user || null
    }

    if (user.value) {
      const me = await apiRequest('/api/community/me').catch(() => null)
      isAdmin.value = Boolean(me?.isAdmin)
    }

    if (!draft.categoryId && categories.value.length) {
      draft.categoryId = Number(categories.value[0].id)
    } else if (!draft.categoryId && mockCategories.length) {
      draft.categoryId = Number(mockCategories[0].id)
    }

    await postsTask

    if (!disposed && !isDemoMode.value && typeof EventSource !== 'undefined') {
      try {
        stream?.close()
        stream = new EventSource(`${accountOrigin}/api/community/stream`)
        stream.addEventListener('community', () => {
          clearTimeout(streamRefreshTimer)
          streamRefreshTimer = setTimeout(() => {
            if (!disposed && page.value === 1 && document.visibilityState === 'visible') void loadPosts()
          }, 250)
        })
      } catch (cause) {
        console.warn('实时讨论连接失败，列表仍可手动刷新：', cause.message)
      }
    }
  } catch {
    isDemoMode.value = allowDemoMode
    categories.value = allowDemoMode ? mockCategories : []
    hotTopics.value = []
    hotTopicError.value = '云端服务尚未连接，实时事件暂不可用。'
    if (!draft.categoryId && categories.value.length) {
      draft.categoryId = Number(categories.value[0].id)
    }
    await loadPosts()
  }
}

onMounted(initCommunity)
onBeforeUnmount(() => {
  disposed = true
  stream?.close()
  clearTimeout(topicRefreshTimer)
  clearTimeout(streamRefreshTimer)
  postsController?.abort()
})
</script>

<style scoped>
.fanxing-entry { padding: 16px 20px; margin: 16px 0; flex-wrap: wrap; gap: 12px; }
.fanxing-title-row { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; margin-bottom: 4px; }
.fanxing-preview-badge {
  display: inline-block;
  font-size: 11px;
  font-weight: 700;
  color: #92400e;
  background: #fef3c7;
  border: 1px solid #f59e0b;
  padding: 2px 8px;
  border-radius: 999px;
}

/* 首屏 3 分钟城市内涝互动对照旗舰入口卡 */
.flagship-compare-card {
  background: rgba(7, 29, 39, 0.72);
  border: 1.5px solid rgba(125, 211, 252, 0.45);
  border-radius: 16px;
  padding: 14px 16px;
  margin: 0 0 14px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  flex-wrap: wrap;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.22);
}

.flagship-card-body {
  flex: 1 1 260px;
  min-width: 0;
}

.flagship-card-badges {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 6px;
}

.flagship-tag-main {
  background: #0284c7;
  color: #ffffff;
  font-size: 11.5px;
  font-weight: 700;
  padding: 2px 9px;
  border-radius: 999px;
}

.flagship-tag-sim {
  background: rgba(245, 158, 11, 0.22);
  color: #fde68a;
  border: 1px solid rgba(245, 158, 11, 0.48);
  font-size: 11px;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 999px;
}

.flagship-question {
  margin: 0 0 4px;
  font-size: clamp(17px, 2.2vw, 21px);
  font-weight: 800;
  color: #ffffff;
  line-height: 1.3;
}

.flagship-desc {
  margin: 0;
  font-size: 13px;
  line-height: 1.5;
  color: #dbeafe;
}

.flagship-start-btn {
  white-space: nowrap;
  font-weight: 800;
  padding: 10px 18px;
  font-size: 14px;
  background: linear-gradient(135deg, #0284c7, #0f766e);
  border-color: #38bdf8;
  color: #ffffff;
}

.hero-global-search-btn {
  border-color: rgba(163, 233, 221, 0.45);
}

/* 发帖框挂载证据卡预览 */
.compose-evidence-preview {
  background: #f0f9ff;
  border: 1px solid #7dd3fc;
  border-left: 4px solid #0284c7;
  border-radius: 10px;
  padding: 12px 16px;
}

.cep-head {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 6px;
}

.cep-badge {
  background: #0284c7;
  color: #ffffff;
  font-size: 11.5px;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 6px;
}

.cep-disclaimer {
  background: #fef3c7;
  color: #92400e;
  border: 1px solid #f59e0b;
  font-size: 11.5px;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 6px;
}

.cep-disclaimer.is-real {
  background: #d1fae5;
  color: #065f46;
  border-color: #34d399;
}

.post-evidence-strip {
  margin: 10px 0 12px;
  padding: 10px 14px;
  border-radius: 10px;
  background: #f8fafc;
  border: 1px solid #bae6fd;
  border-left: 4px solid #0284c7;
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.pes-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 6px;
}
.pes-model {
  font-size: 11.5px;
  font-weight: 700;
  color: #0369a1;
}
.pes-nature {
  font-size: 10.5px;
  font-weight: 700;
  padding: 1px 7px;
  border-radius: 999px;
}
.pes-nature.is-sim {
  background: #fef3c7;
  color: #92400e;
  border: 1px solid #f59e0b;
}
.pes-nature.is-real {
  background: #d1fae5;
  color: #065f46;
  border: 1px solid #34d399;
}
.pes-compare-row {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  gap: 8px;
  align-items: center;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 6px 10px;
}
.pes-col {
  display: flex;
  flex-direction: column;
  gap: 1px;
  min-width: 0;
}
.pes-col small {
  font-size: 10.5px;
  color: #64748b;
  font-weight: 600;
}
.pes-col strong {
  font-size: 12px;
  color: #0f172a;
}
.pes-vs {
  font-size: 11px;
  font-weight: 800;
  color: #0284c7;
  padding: 0 4px;
}
.pes-foot {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  font-size: 11.5px;
}
.pes-cond {
  color: #475569;
}
.pes-open-link {
  font-weight: 700;
  color: #0284c7;
  text-decoration: none;
  white-space: nowrap;
}
.pes-open-link:hover {
  text-decoration: underline;
}

.cep-title {
  margin: 0 0 6px;
  font-size: 15px;
  color: #0c4a6e;
}

.cep-meta {
  margin: 0 0 4px;
  font-size: 12.5px;
  color: #334155;
  line-height: 1.5;
}

.cep-facts {
  margin: 6px 0;
  font-size: 12.5px;
  color: #0f172a;
  line-height: 1.55;
}

.cep-limits {
  margin: 4px 0 8px;
  font-size: 12px;
  color: #64748b;
  line-height: 1.5;
}

.cep-reproduce-link {
  display: inline-block;
  font-size: 12.5px;
  font-weight: 700;
  color: #0284c7;
  text-decoration: none;
}

.cep-reproduce-link:hover {
  text-decoration: underline;
}

/* 结构化事件卡片扩展样式 */
.topic-card-badges {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
  margin-bottom: 6px;
}

.topic-origin-badge {
  font-size: 11px;
  font-weight: 600;
  color: #0f5132;
  background: #d1e7dd;
  padding: 2px 7px;
  border-radius: 999px;
}

.topic-sample-badge {
  font-size: 10.5px;
  font-weight: 700;
  color: #92400e;
  background: #fef3c7;
  padding: 2px 7px;
  border-radius: 999px;
}

.topic-structured-meta {
  margin: 0 0 8px;
  padding: 8px 10px;
  background: rgba(15, 39, 66, 0.04);
  border-radius: 8px;
  font-size: 11.5px;
  display: grid;
  gap: 4px;
}

.topic-structured-meta div {
  display: grid;
  grid-template-columns: 105px 1fr;
  gap: 6px;
}

.topic-structured-meta dt {
  color: var(--text-muted);
  font-weight: 600;
}

.topic-structured-meta dd {
  margin: 0;
  color: var(--geo-ocean-deep);
  font-weight: 600;
}

.topic-question-box {
  background: #f0f9ff;
  border-left: 3px solid #0284c7;
  padding: 7px 10px;
  border-radius: 6px;
  font-size: 12px;
  color: #0c4a6e;
  line-height: 1.5;
  margin-bottom: 10px;
}

.topic-source-status { display: flex; flex-wrap: wrap; align-items: center; gap: 8px 16px; font-size: 12px; color: var(--text-muted); }
.topic-raw-title { display: block; font-size: 11.5px; color: var(--text-faint); margin: -4px 0 8px; font-family: ui-monospace, SFMono-Regular, monospace; }
.compose-login-banner { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 10px; padding: 12px 18px; margin-bottom: 18px; text-align: left; }
.compose-scaffold-bar { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 10px; padding: 10px 14px; background: var(--geo-ocean-surface); border: 1px solid var(--border); border-left: 4px solid var(--geo-ocean); border-radius: 8px; margin-bottom: 14px; font-size: 13px; color: var(--text); }
.scaffold-actions { display: flex; gap: 8px; flex-wrap: wrap; }
.draft-saved-hint { font-size: 12px; color: var(--geo-green); font-weight: 600; margin-right: 12px; }
/* 社区首页：让搜索、3分钟对照入口和讨论在首屏内清晰可见。 */
.community-hero {
  padding: 28px 0 24px;
  margin-bottom: 20px;
  background: #10263d;
}
.community-intro { max-width: 860px; min-width: 0; }
.community-hero h1 { font-family: inherit; font-size: clamp(24px, 3.6vw, 38px); margin-bottom: 12px; }
.community-hero-badge { margin-bottom: 8px; letter-spacing: .04em; }
.community-lead { margin-bottom: 14px; font-size: 14.5px; line-height: 1.5; }
.community-search { max-width: 760px; margin-bottom: 12px; }
.community-search input { background: transparent; color: #10263d; border: 0; min-height: 44px; }
.community-search input::placeholder { color: #66788a; }
.community-hero-actions { gap: 8px; }
.hot-topics-bar { padding: 20px 24px; margin-bottom: 30px; }
.hot-topic-card { background: var(--surface); }
.community-layout { scroll-margin-top: 24px; }
.community-main { min-width: 0; }
.community-filters { display: flex; flex-wrap: wrap; gap: 8px; }
.community-sort { display: flex; flex-wrap: wrap; gap: 6px; }
@media (max-width: 520px) {
  .community-hero { padding: 18px 0 16px; }
  .community-search { flex-direction: row; border-radius: 14px; padding: 4px; }
  .community-search input { min-height: 38px; padding: 0 10px; font-size: 13px; }
  .community-search button { width: auto; padding: 6px 14px; font-size: 13px; white-space: nowrap; }
  .flagship-compare-card { padding: 12px; margin-bottom: 10px; gap: 10px; }
  .flagship-card-cta, .flagship-start-btn { width: 100%; text-align: center; justify-content: center; }
  .baroque-filter-btn { padding: 6px 11px; font-size: 12.5px; }
}
/* 继承并深化全局巴洛克与古典地理学会视觉系统 */
.community-page {
  padding-bottom: 90px;
}

.community-hero {
  position: relative;
  overflow: hidden;
  isolation: isolate;
  background: linear-gradient(118deg, #102d3a 8%, #124957 62%, #17646a);
  color: #f7f5ed;
  padding: 26px 0;
  margin-bottom: 20px;
  border-bottom: 0;
  border-radius: 0 0 36px 36px;
  box-shadow: var(--shadow-md);
}

.community-hero-inner {
  position: relative;
  display: grid;
  grid-template-columns: minmax(0, 1.32fr) minmax(350px, 1.05fr);
  align-items: start;
  gap: clamp(16px, 2.6vw, 34px);
}

.community-hero-right {
  display: flex;
  flex-direction: column;
  gap: 10px;
  min-width: 0;
}

.community-tides { position: absolute; inset: 0; overflow: hidden; pointer-events: none; z-index: -1; }
.community-tides span {
  position: absolute;
  width: 660px;
  height: 440px;
  border: 1px solid rgba(163, 233, 221, 0.15);
  border-radius: 50%;
  right: -120px;
  top: -110px;
  rotate: -25deg;
}
.community-tides span:nth-child(2) { right: -55px; top: -45px; }
.community-tides span:nth-child(3) { right: 10px; top: 20px; }
.community-discovery {
  padding: 10px 14px;
  border: 1px solid rgba(178, 230, 223, 0.24);
  border-radius: 16px;
  background: rgba(7, 39, 48, 0.36);
}
.discovery-eyebrow { margin: 0 0 6px; color: #c7e6df; font-size: 11px; letter-spacing: .08em; font-weight: 700; }
.discovery-links-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 8px;
}
.community-discovery a {
  display: flex;
  align-items: flex-start;
  gap: 6px;
  padding: 6px 8px;
  color: #fff;
  text-decoration: none;
  background: rgba(15, 39, 66, 0.38);
  border: 1px solid rgba(178, 230, 223, 0.14);
  border-radius: 10px;
  transition: background 0.15s ease, border-color 0.15s ease;
}
.community-discovery a:hover {
  background: rgba(2, 132, 199, 0.28);
  border-color: rgba(125, 211, 252, 0.45);
}
.community-discovery a > span:first-child { font: 11px ui-monospace, monospace; color: #a8dcd2; margin-top: 2px; flex-shrink: 0; white-space: nowrap; }
.community-discovery a > span:last-child { margin-left: auto; font-size: 11px; color: #93c5fd; flex-shrink: 0; }
.community-discovery a div { display: grid; gap: 1px; min-width: 0; }
.community-discovery strong { font-size: 12px; line-height: 1.3; }
.community-discovery small { color: #c7e6df; font-size: 10.5px; line-height: 1.3; }
.community-discovery a:hover strong { text-decoration: underline; text-underline-offset: 4px; }
.community-discovery a:focus-visible { outline: 2px solid #c7e6df; outline-offset: 4px; border-radius: 8px; }

@media (prefers-reduced-motion: no-preference) {
  .community-intro { animation: community-arrive .65s var(--geo-flow-ease) both; }
  .community-hero-right { animation: community-arrive .85s var(--geo-flow-ease) both; }
}
@keyframes community-arrive {
  from { opacity: 0; translate: 0 14px; }
  to { opacity: 1; translate: 0 0; }
}
@media (max-width: 1000px) {
  .community-hero-inner { grid-template-columns: 1fr; gap: 12px; }
  .community-discovery {
    padding: 10px 12px;
    border-radius: 14px;
  }
}
@media (max-width: 520px) {
  .community-hero { padding: 14px 0; border-radius: 0 0 24px 24px; }
  .community-hero h1 { line-height: 1.25; font-size: 21px; margin-bottom: 8px; }
  .discovery-links-grid { grid-template-columns: 1fr; gap: 6px; }
}

.community-hero-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 11px;
  font-family: ui-monospace, SFMono-Regular, monospace;
  letter-spacing: 0.16em;
  font-weight: 700;
  color: #c1e7df;
  margin-bottom: 14px;
}

.baroque-gem {
  color: #c5a059;
}

.community-hero h1 {
  font-size: clamp(28px, 4vw, 44px);
  line-height: 1.15;
  margin: 0 0 10px;
  font-family: inherit;
  font-weight: 700;
  letter-spacing: -0.025em;
  color: #ffffff;
}

.baroque-gold-text {
  font-style: normal;
  background: linear-gradient(135deg, #f4e5c3 0%, #d8b776 50%, #b88d3e 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.community-lead {
  font-size: 15px;
  line-height: 1.55;
  color: #c9d6df;
  max-width: 640px;
  margin: 0 0 18px;
}

.community-search {
  display: flex;
  gap: 8px;
  max-width: 760px;
  margin-bottom: 16px;
}

.community-search input {
  flex: 1;
  min-height: 44px;
  padding: 0 16px;
  border-radius: var(--radius-pill);
  border: 1px solid var(--border);
  background: transparent;
  color: #10263d;
  font-size: 14px;
}

.community-search input::placeholder {
  color: #66788a;
}

.community-hero-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.community-hero-aside {
  padding: 28px;
  border-radius: var(--radius-box);
  background: rgba(10, 25, 45, 0.65);
  border: 1px solid rgba(197, 160, 89, 0.35);
  backdrop-filter: blur(12px);
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}

.armillary-seal {
  width: 90px;
  height: 90px;
  color: #9bb7d4;
  margin-bottom: 12px;
}

.armillary-svg {
  width: 100%;
  height: 100%;
}

.community-coordinate {
  font-family: ui-monospace, SFMono-Regular, monospace;
  font-size: 11px;
  letter-spacing: 0.12em;
  color: #c5a059;
  margin-bottom: 8px;
}

.community-hero-aside strong {
  font-size: 20px;
  line-height: 1.4;
  color: #ffffff;
  font-family: Georgia, 'Playfair Display', serif;
  margin-bottom: 8px;
}

.community-hero-aside p {
  margin: 0;
  font-size: 13px;
  color: #9ab4c8;
}

/* 热点聚合条 */
.hot-topics-bar {
  margin-bottom: 36px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-box);
  padding: 24px 28px;
  box-shadow: var(--shadow-sm);
}

.hot-topics-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
  border-bottom: 1px solid var(--border);
  padding-bottom: 12px;
}

.baroque-corner-ornament {
  color: #c5a059;
  font-size: 15px;
}

.hot-topics-header h3 {
  margin: 0;
  font-size: 17px;
  font-weight: 800;
  color: var(--geo-ocean-deep);
}

.hot-topics-subtitle {
  font-family: ui-monospace, SFMono-Regular, monospace;
  font-size: 10.5px;
  letter-spacing: 0.12em;
  color: var(--text-faint);
  margin-left: 6px;
}

.hot-topics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
}

.hot-topic-card {
  padding: 16px;
  border-radius: var(--radius-card);
  background: var(--bg-soft);
  border: 1px solid var(--border);
  display: flex;
  flex-direction: column;
  transition: transform 0.2s var(--geo-flow-ease), border-color 0.2s, box-shadow 0.2s;
}

.hot-topic-card:hover {
  transform: translateY(-2px);
  border-color: #c5a059;
  background: #ffffff;
  box-shadow: var(--shadow-sm);
}

.topic-tag {
  font-size: 10.5px;
  font-weight: 700;
  color: var(--geo-ocean);
  margin-bottom: 6px;
  display: inline-block;
}

.hot-topic-card h4 {
  margin: 0 0 8px;
  font-size: 14.5px;
  font-weight: 700;
  line-height: 1.45;
  color: var(--geo-ocean-deep);
}

.hot-topic-card p {
  font-size: 12.5px;
  line-height: 1.6;
  color: var(--text-muted);
  margin: 0 0 12px;
  flex: 1;
}

.topic-summary-toggle {
  align-self: flex-start;
  padding: 0;
  border: 0;
  background: transparent;
  color: var(--geo-ocean);
  font: inherit;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  margin-bottom: 10px;
}

.topic-summary-detail {
  border-top: 1px solid var(--border);
  padding-top: 12px;
  margin-bottom: 12px;
  font-size: 12px;
  line-height: 1.6;
  color: var(--text-muted);
}

.topic-summary-detail strong { color: var(--geo-ocean-deep); }
.topic-summary-detail p { margin: 6px 0 10px; }
.topic-summary-detail dl { margin: 0; }
.topic-summary-detail dl div { display: grid; grid-template-columns: 62px 1fr; gap: 8px; margin: 4px 0; }
.topic-summary-detail dt { color: var(--text-faint); }
.topic-summary-detail dd { margin: 0; overflow-wrap: anywhere; }
.topic-summary-detail a { color: var(--geo-ocean); font-weight: 700; }
.topic-summary-detail .topic-verification-note { color: var(--text-faint); }

.topic-foot {
  display: flex;
  flex-wrap: wrap;
  gap: 8px 12px;
  align-items: baseline;
  font-size: 11.5px;
  color: var(--text-faint);
  border-top: 1px dashed rgba(0,0,0,0.06);
  padding-top: 8px;
}

.topic-link {
  color: var(--geo-ocean);
  font-weight: 700;
  background: transparent;
  border: 0;
  padding: 0;
  cursor: pointer;
}

/* 社区主体布局 */
.community-layout {
  display: grid;
  grid-template-columns: minmax(0, 1.4fr) minmax(280px, 0.6fr);
  gap: 36px;
}

.community-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 20px;
  padding-bottom: 14px;
  border-bottom: 1px solid var(--border);
}

.baroque-filter-btn {
  padding: 7px 16px;
  border-radius: var(--radius-pill);
  border: 1px solid var(--border);
  background: var(--surface);
  color: var(--text-muted);
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: var(--geo-btn-transition);
}

.baroque-filter-btn.active {
  background: var(--geo-ocean);
  color: #ffffff;
  border-color: var(--geo-ocean);
  box-shadow: var(--geo-btn-primary-shadow);
}

.baroque-sort-btn {
  padding: 6px 12px;
  border-radius: var(--radius-sm);
  border: 1px solid transparent;
  background: transparent;
  color: var(--text-faint);
  font-size: 12.5px;
  font-weight: 600;
  cursor: pointer;
}

.baroque-sort-btn.active {
  color: var(--geo-ocean);
  background: var(--geo-ocean-surface);
  border-color: var(--border);
}

/* 帖子卡片 */
.community-post-card {
  padding: 24px;
  margin-bottom: 16px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-card);
  box-shadow: var(--shadow-sm);
  transition: transform 0.2s var(--geo-flow-ease), box-shadow 0.2s, border-color 0.2s;
}

.community-post-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
  border-color: var(--geo-ocean);
}

.community-post-meta {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 10px;
}

.category-pill {
  font-size: 11px;
  font-weight: 700;
  color: var(--geo-ocean);
  background: var(--geo-ocean-surface);
  padding: 3px 10px;
  border-radius: var(--radius-pill);
  border: 1px solid rgba(26,68,108,0.12);
}

.kind-pill {
  font-size: 11px;
  font-weight: 700;
  padding: 3px 8px;
  border-radius: var(--radius-sm);
}

.kind-question {
  background: #fdf5e9;
  color: #b37318;
  border: 1px solid rgba(179,115,24,0.2);
}

.kind-discussion {
  background: #edf5f0;
  color: var(--geo-green-deep);
  border: 1px solid rgba(45,106,79,0.2);
}

.accepted-pill {
  font-size: 11px;
  font-weight: 700;
  background: #eef8f0;
  color: #2e7d5b;
  padding: 3px 10px;
  border-radius: var(--radius-pill);
  border: 1px solid rgba(46,125,91,0.25);
}

.experiment-pill {
  font-size: 11px;
  font-weight: 700;
  background: #f0f4fa;
  color: var(--geo-ocean);
  padding: 3px 10px;
  border-radius: var(--radius-pill);
  border: 1px solid rgba(26,68,108,0.18);
}

.post-title {
  margin: 0 0 10px;
  font-size: 19px;
  font-weight: 700;
  line-height: 1.4;
}

.post-title a {
  color: var(--geo-ocean-deep);
  text-decoration: none;
}

.post-title a:hover {
  color: var(--geo-ocean);
  text-decoration: underline;
}

.post-excerpt {
  font-size: 14px;
  line-height: 1.7;
  color: var(--text-muted);
  margin: 0 0 14px;
}

.post-tags-row {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 14px;
}

.post-tag-item {
  font-size: 11.5px;
  color: var(--text-muted);
  background: var(--bg-soft);
  padding: 2px 8px;
  border-radius: var(--radius-sm);
  cursor: pointer;
}

.post-tag-item:hover {
  color: var(--geo-ocean);
  background: var(--geo-ocean-surface);
}

.community-post-foot {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 12.5px;
  color: var(--text-faint);
  border-top: 1px dashed var(--border);
  padding-top: 12px;
}

.author-link {
  color: var(--geo-ocean);
  text-decoration: none;
  font-weight: 600;
}

.author-link:hover {
  text-decoration: underline;
}

.post-stats-right {
  display: flex;
  gap: 12px;
}

.stat-badge {
  font-size: 12px;
  color: var(--text-muted);
}

/* 侧边栏 */
.community-side-block {
  padding: 24px;
  margin-bottom: 24px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-card);
  box-shadow: var(--shadow-sm);
}

.side-block-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
  border-bottom: 1px solid var(--border);
  padding-bottom: 10px;
}

.side-block-header h2 {
  margin: 0;
  font-size: 16.5px;
  font-weight: 700;
  color: var(--geo-ocean-deep);
}

.category-menu {
  display: grid;
  gap: 6px;
}

.baroque-cat-btn {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 12px;
  border-radius: var(--radius-sm);
  border: 1px solid transparent;
  background: var(--bg-soft);
  cursor: pointer;
  text-align: left;
  transition: var(--geo-btn-transition);
}

.baroque-cat-btn:hover {
  background: var(--geo-ocean-surface);
  border-color: var(--border);
}

.baroque-cat-btn.active {
  background: var(--geo-ocean-surface);
  border-color: var(--geo-ocean);
}

.cat-left {
  display: flex;
  flex-direction: column;
}

.cat-name {
  font-size: 13.5px;
  font-weight: 700;
  color: var(--geo-ocean-deep);
}

.cat-desc {
  font-size: 11px;
  color: var(--text-muted);
}

.cat-arrow {
  color: var(--text-faint);
  font-size: 13px;
}

.group-side-promo {
  border-color: rgba(197, 160, 89, 0.4);
}

.side-promo-desc {
  font-size: 12.5px;
  line-height: 1.6;
  color: var(--text-muted);
  margin: 0 0 14px;
}

.group-mini-list {
  display: grid;
  gap: 8px;
  margin-bottom: 16px;
}

.group-mini-item {
  padding: 8px 10px;
  border-radius: var(--radius-sm);
  background: var(--bg-soft);
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.group-mini-item strong {
  font-size: 12.5px;
  color: var(--geo-ocean-deep);
}

.group-mini-item span {
  font-size: 11px;
  font-family: ui-monospace, SFMono-Regular, monospace;
  color: #c5a059;
  font-weight: 700;
}

.promo-btn {
  width: 100%;
  text-align: center;
  display: block;
  text-decoration: none;
}

.side-link-list {
  display: grid;
  gap: 8px;
}

.side-exp-link {
  display: flex;
  flex-direction: column;
  padding: 10px 12px;
  border-radius: var(--radius-sm);
  background: var(--bg-soft);
  text-decoration: none;
  border: 1px solid var(--border);
  transition: var(--geo-btn-transition);
}

.side-exp-link:hover {
  background: var(--geo-ocean-surface);
  border-color: var(--geo-ocean);
  transform: var(--geo-btn-elevate);
}

.side-exp-link span {
  font-size: 13px;
  font-weight: 700;
  color: var(--geo-ocean-deep);
}

.side-exp-link small {
  font-size: 11px;
  color: var(--text-muted);
}

/* 发起讨论表单 */
.community-compose {
  margin-top: 48px;
  padding: 32px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius-box);
  box-shadow: var(--shadow-sm);
  min-width: 0;
  max-width: 100%;
  overflow: hidden;
}

.community-compose-form {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 16px;
  min-width: 0;
}

.community-form-row {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
  min-width: 0;
}

.community-compose label {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 6px;
  font-size: 13px;
  font-weight: 700;
  color: var(--geo-ocean);
  min-width: 0;
}

.community-compose input,
.community-compose select,
.community-compose textarea {
  width: 100%;
  max-width: 100%;
  min-width: 0;
  box-sizing: border-box;
}

.form-submit-row {
  margin-top: 8px;
}

@media (max-width: 860px) {
  .community-hero-inner {
    grid-template-columns: 1fr;
  }
  .community-hero-aside {
    display: none;
  }
  .community-layout {
    grid-template-columns: 1fr;
  }
  .community-form-row {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 560px) {
  .community-hero {
    padding: 10px 0 12px;
    margin-bottom: 12px;
    border-radius: 0 0 22px 22px;
  }
  .community-hero-inner {
    gap: 8px;
  }
  .community-hero-badge {
    margin-bottom: 4px;
    font-size: 10px;
  }
  .community-hero h1 {
    font-size: 18.5px;
    line-height: 1.22;
    margin: 0 0 6px;
  }
  .flagship-compare-card {
    padding: 8px 10px;
    margin: 0 0 6px;
    gap: 6px;
    border-radius: 12px;
  }
  .flagship-card-badges {
    margin-bottom: 3px;
    gap: 5px;
  }
  .flagship-tag-main,
  .flagship-tag-sim {
    font-size: 10px;
    padding: 1px 7px;
  }
  .flagship-question {
    font-size: 15px;
    margin-bottom: 2px;
  }
  .flagship-desc {
    font-size: 11.5px;
    line-height: 1.35;
  }
  .flagship-card-cta,
  .flagship-start-btn {
    width: 100%;
    text-align: center;
    justify-content: center;
    padding: 6px 12px;
    font-size: 12.5px;
    min-height: 32px;
  }
  .community-search {
    margin-bottom: 6px;
    padding: 3px;
    gap: 6px;
  }
  .community-search input {
    min-height: 32px;
    padding: 0 10px;
    font-size: 12.5px;
  }
  .community-search button {
    padding: 4px 12px;
    font-size: 12.5px;
    min-height: 32px;
  }
  .community-hero-actions {
    gap: 5px;
  }
  .community-hero-actions .baroque-btn {
    padding: 4px 9px;
    font-size: 11.5px;
    min-height: 30px;
  }
}
</style>
