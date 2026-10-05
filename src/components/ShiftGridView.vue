<template>
  <div class="space-y-4 sm:space-y-5">
    <!-- Team Mode Header: Multi-Staff Selector & Dual View Tabs (全员档案切换轨) -->
    <div v-if="staffSchedules && staffSchedules.length > 1" class="space-y-3 p-3.5 sm:p-4 rounded-3xl zzz-panel border-[2.5px] border-black shadow-[0_5px_0_#000]">
      <!-- Header row: Title & View Tabs -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b-2 border-black/80">
        <div class="flex items-center gap-2">
          <div class="w-8 h-8 rounded-xl bg-[#E8F624] text-black border border-black flex items-center justify-center font-bold shrink-0 shadow-[0_2px_0_#000]">
            <Users class="w-4 h-4 stroke-[2.2]" />
          </div>
          <div>
            <div class="flex items-center gap-2">
              <h3 class="text-xs sm:text-sm font-bold text-white uppercase tracking-tight font-unbounded">
                全员排班总览 // TEAM DECK
              </h3>
              <span class="px-1.5 py-0.2 rounded bg-black text-[#E8F624] text-[9px] font-tech font-bold border border-[#E8F624]/40">
                {{ staffSchedules.length }} 位员工
              </span>
            </div>
            <p class="text-[10px] text-[#9CA3AF] font-tech">
              切换员工卡片查看个人明细，或切换为全员对照同屏比对
            </p>
          </div>
        </div>

        <!-- Individual vs Team Matrix Switcher Dual Key -->
        <div class="p-1 rounded-xl bg-[#111215] border-2 border-black flex items-center shadow-inner self-start sm:self-auto">
          <button
            type="button"
            @click="mainViewTab = 'individual'"
            :class="[
              'py-1.5 px-3 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer',
              mainViewTab === 'individual' ? 'bg-[#E8F624] text-black shadow-[0_1px_0_#000]' : 'text-[#9CA3AF] hover:text-white'
            ]"
          >
            <User class="w-3.5 h-3.5" />
            <span>个人明细</span>
          </button>
          <button
            type="button"
            @click="mainViewTab = 'matrix'"
            :class="[
              'py-1.5 px-3 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer relative',
              mainViewTab === 'matrix' ? 'bg-[#E8F624] text-black shadow-[0_1px_0_#000]' : 'text-[#9CA3AF] hover:text-white'
            ]"
          >
            <Table class="w-3.5 h-3.5" />
            <span>全员对照透视</span>
            <span class="w-1.5 h-1.5 rounded-full bg-[#E8F624] animate-pulse"></span>
          </button>
        </div>
      </div>

      <!-- Staff Selector Buttons Carousel/Row -->
      <div>
        <div class="text-[10px] font-tech text-[#9CA3AF] mb-1.5 uppercase flex items-center justify-between">
          <span>SELECT ACTIVE STAFF // 当前聚焦员工:</span>
          <span v-if="myStaffName" class="text-[#E8F624] font-bold">
            本人标记: {{ myStaffName }}
          </span>
        </div>
        <div class="flex flex-wrap gap-2">
          <button
            v-for="st in staffSchedules"
            :key="st.staffName"
            type="button"
            @click="handleSelectStaff(st.staffName)"
            :class="[
              'py-1.5 px-3 rounded-xl text-xs font-bold transition-all border-2 flex items-center gap-1.5 cursor-pointer active:scale-95',
              currentStaffName === st.staffName
                ? 'bg-[#E8F624] text-black border-black shadow-[0_2px_0_#000]'
                : 'bg-[#181A1E] text-white border-[#2A2E35] hover:border-[#9CA3AF]'
            ]"
          >
            <span class="truncate max-w-[100px]">{{ st.staffName }}</span>
            <!-- Tag if this is me -->
            <span 
              v-if="myStaffName && norm(myStaffName) === norm(st.staffName)"
              :class="[
                'px-1.5 py-0.2 rounded text-[9px] font-tech font-bold border',
                currentStaffName === st.staffName ? 'bg-black text-[#E8F624] border-black' : 'bg-[#E8F624] text-black border-black'
              ]"
            >
              本人 ★
            </span>
            <span 
              :class="[
                'px-1.5 py-0.2 rounded font-tech text-[10px]',
                currentStaffName === st.staffName ? 'bg-black/20 text-black' : 'bg-[#111215] text-[#9CA3AF]'
              ]"
            >
              {{ st.shifts?.length || 0 }}D
            </span>
          </button>
        </div>

        <!-- Quick "Set as Me" bar if current staff is not myStaffName -->
        <div v-if="currentStaffName && norm(currentStaffName) !== norm(myStaffName)" class="mt-2 pt-2 border-t border-black/40 flex items-center justify-between">
          <span class="text-[10px] font-tech text-[#9CA3AF]">
            当前查看员工为【{{ currentStaffName }}】
          </span>
          <button
            type="button"
            @click="$emit('set-my-staff', currentStaffName)"
            class="text-[10px] font-bold text-[#E8F624] hover:underline flex items-center gap-1 cursor-pointer font-tech"
          >
            <Star class="w-3 h-3 fill-[#E8F624]" />
            <span>设为我的名字 // SET AS ME</span>
          </button>
        </div>
      </div>
    </div>

    <!-- View 1: Team Matrix View (按时间轴与上班时间排序对照全员排班) -->
    <div v-if="staffSchedules && staffSchedules.length > 1 && mainViewTab === 'matrix'" class="space-y-3">
      <!-- Matrix Header Info & Quick Date Filter -->
      <div class="p-3.5 rounded-2xl bg-[#181A1E] border-2 border-black flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs shadow-inner">
        <div class="flex items-center gap-2">
          <CalendarIcon class="w-4 h-4 text-[#E8F624]" />
          <span class="font-bold text-white uppercase font-sans">全员排班时间轴对照</span>
          <span class="px-2 py-0.5 rounded-full bg-[#111215] text-[#E8F624] text-[10px] font-tech font-bold border border-[#2A2E35]">
            {{ filteredMatrixDates.length }} / {{ teamMatrixDates.length }} 天
          </span>
        </div>

        <!-- Filter Buttons: All / My Work / My Off -->
        <div class="flex items-center gap-1.5 p-1 rounded-xl bg-[#111215] border border-[#2A2E35]">
          <button
            type="button"
            @click="matrixDateFilter = 'all'"
            :class="[
              'px-2.5 py-1 rounded-lg text-[10px] font-bold transition cursor-pointer',
              matrixDateFilter === 'all' ? 'bg-[#E8F624] text-black shadow-sm' : 'text-[#9CA3AF] hover:text-white'
            ]"
          >
            全部日期
          </button>
          <button
            type="button"
            @click="matrixDateFilter = 'my_work'"
            :class="[
              'px-2.5 py-1 rounded-lg text-[10px] font-bold transition cursor-pointer',
              matrixDateFilter === 'my_work' ? 'bg-[#E8F624] text-black shadow-sm' : 'text-[#9CA3AF] hover:text-white'
            ]"
          >
            我上班
          </button>
          <button
            type="button"
            @click="matrixDateFilter = 'my_off'"
            :class="[
              'px-2.5 py-1 rounded-lg text-[10px] font-bold transition cursor-pointer',
              matrixDateFilter === 'my_off' ? 'bg-[#36E4DA] text-black shadow-sm' : 'text-[#9CA3AF] hover:text-white'
            ]"
          >
            我休假
          </button>
        </div>
      </div>

      <!-- Date Cards List (按上班时间从早到晚垂直时间轴排列) -->
      <div class="space-y-3">
        <div
          v-for="date in filteredMatrixDates"
          :key="date"
          class="p-3.5 sm:p-5 rounded-2xl zzz-card border-2 border-black space-y-3 group hover:border-[#E8F624]/60 transition-colors"
        >
          <!-- Card Top Bar: Date & Quick Summary Counts -->
          <div class="flex items-center justify-between pb-2.5 border-b-2 border-black/80">
            <div class="flex items-center gap-2.5 sm:gap-3">
              <div class="w-10 h-10 rounded-xl bg-[#111215] border-2 border-black flex flex-col items-center justify-center font-tech shadow-inner shrink-0">
                <span class="text-[9px] text-[#9CA3AF] leading-none">{{ getWeekdayName(date) }}</span>
                <span class="text-sm font-bold text-white leading-none mt-0.5">{{ date.slice(8) }}</span>
              </div>
              <div>
                <div class="text-xs font-bold text-white font-tech">{{ date }}</div>
                <div class="text-[10px] text-[#9CA3AF] font-tech">{{ getWeekdayName(date) }}</div>
              </div>
            </div>

            <!-- Right Day Summary Pill -->
            <div class="flex items-center gap-1.5 text-[10px] font-tech font-bold">
              <span class="px-2 py-0.5 rounded-full bg-[#111215] text-[#E8F624] border border-[#2A2E35]">
                {{ getDayTimelineData(date).totalWorking }} 在岗
              </span>
              <span v-if="getDayTimelineData(date).totalOff > 0" class="px-2 py-0.5 rounded-full bg-[#111215] text-[#36E4DA] border border-[#2A2E35]">
                {{ getDayTimelineData(date).totalOff }} 休假
              </span>
            </div>
          </div>

          <!-- Chronological Timeline Body (垂直时间轴) -->
          <div class="relative pl-5 sm:pl-6 space-y-3 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-[2px] before:bg-[#2A2E35]">
            <!-- 1. Working Shifts Nodes sorted chronologically (按上班时间从早到晚排序) -->
            <div
              v-for="group in getDayTimelineData(date).timeGroups"
              :key="group.timeKey"
              class="relative"
            >
              <!-- Timeline Track Dot -->
              <div class="absolute -left-5 sm:-left-6 top-1 w-3.5 h-3.5 rounded-full bg-[#111215] border-2 border-[#E8F624] flex items-center justify-center">
                <div class="w-1.5 h-1.5 rounded-full bg-[#E8F624]"></div>
              </div>

              <!-- Time Header & Staff Count -->
              <div class="flex items-center gap-2 mb-1.5">
                <div class="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-[#111215] border border-[#2A2E35] text-xs font-tech font-bold text-white shadow-inner">
                  <Clock class="w-3.5 h-3.5 text-[#E8F624]" />
                  <span>{{ group.timeKey }}</span>
                </div>
                <span v-if="group.rawTag" class="px-1.5 py-0.2 rounded text-[9px] font-tech font-bold text-[#E8F624] bg-[#22252A] border border-[#2A2E35]">
                  {{ group.rawTag }}
                </span>
                <span class="text-[10px] font-tech text-[#717682]">
                  {{ group.members.length }}人
                </span>
              </div>

              <!-- Staff Member Badges under this Time Slot -->
              <div class="flex flex-wrap gap-2">
                <button
                  v-for="m in group.members"
                  :key="m.staffName"
                  type="button"
                  @click="handleMatrixShiftClick(m.staffName, date)"
                  :class="[
                    'px-3 py-1.5 rounded-xl border-2 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer active:scale-95 shadow-[0_2px_0_#000]',
                    m.isMe
                      ? 'bg-[#E8F624] text-black border-black ring-2 ring-[#E8F624]/40 font-bold'
                      : 'bg-[#181A1E] text-white border-[#2E333D] hover:border-[#E8F624]'
                  ]"
                  :title="`点击查看/编辑 ${m.staffName} 的班次`"
                >
                  <span>{{ m.staffName }}</span>
                  <span 
                    v-if="m.isMe" 
                    class="px-1 py-0.2 rounded bg-black text-[#E8F624] text-[8px] font-tech font-bold"
                  >
                    本人
                  </span>
                </button>
              </div>
            </div>

            <!-- 2. Off Staff Node (休假人员) -->
            <div v-if="getDayTimelineData(date).offStaff.length > 0" class="relative pt-0.5">
              <div class="absolute -left-5 sm:-left-6 top-2 w-3.5 h-3.5 rounded-full bg-[#111215] border-2 border-[#36E4DA] flex items-center justify-center">
                <div class="w-1.5 h-1.5 rounded-full bg-[#36E4DA]"></div>
              </div>

              <div class="flex items-center gap-2 mb-1.5">
                <span class="px-2 py-0.5 rounded-md bg-[#111215] border border-[#2A2E35] text-[11px] font-tech font-bold text-[#36E4DA] flex items-center gap-1">
                  <Coffee class="w-3 h-3" />
                  <span>休假 // OFF</span>
                </span>
                <span class="text-[10px] font-tech text-[#717682]">
                  {{ getDayTimelineData(date).offStaff.length }}人
                </span>
              </div>

              <div class="flex flex-wrap gap-2">
                <button
                  v-for="m in getDayTimelineData(date).offStaff"
                  :key="m.staffName"
                  type="button"
                  @click="handleMatrixShiftClick(m.staffName, date)"
                  :class="[
                    'px-3 py-1.5 rounded-xl border-2 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer active:scale-95 shadow-[0_1px_0_#000]',
                    m.isMe
                      ? 'bg-[#36E4DA] text-black border-black ring-2 ring-[#36E4DA]/40 font-bold'
                      : 'bg-[#181A1E] text-[#9CA3AF] border-[#2A2E35] hover:text-white hover:border-[#36E4DA]'
                  ]"
                  :title="`点击查看/编辑 ${m.staffName} 的休假`"
                >
                  <span>{{ m.staffName }}</span>
                  <span v-if="m.isMe" class="px-1 py-0.2 rounded bg-black text-[#36E4DA] text-[8px] font-tech font-bold">本人</span>
                </button>
              </div>
            </div>

            <!-- 3. Unassigned Staff (未排班，轻量低调显示) -->
            <div v-if="getDayTimelineData(date).unassignedStaff.length > 0" class="pt-1 flex items-center gap-1.5 text-[10px] font-tech text-[#6B7280]">
              <span>未排班:</span>
              <span v-for="u in getDayTimelineData(date).unassignedStaff" :key="u.staffName" class="px-1.5 py-0.5 rounded bg-[#111215] border border-[#22252B]">
                {{ u.staffName }}<span v-if="u.isMe">(我)</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- View 2: Individual Shift View (当前聚焦员工的仪表与班次网格) -->
    <div v-else class="space-y-4 sm:space-y-5">
    <!-- Master Telemetry Console: Integrated Molded Industrial Chassis (一体成型工业外壳底座) -->
    <div class="relative rounded-3xl zzz-chassis p-4 sm:p-5 overflow-hidden">
      <!-- Side Ticket Notches (硬件票券撕裂咬合凹槽) -->
      <div class="hidden sm:block absolute -left-2 top-1/2 -translate-y-1/2 w-4 h-7 rounded-r-full bg-[#111215] border-2 border-l-0 border-black z-20"></div>
      <div class="hidden sm:block absolute -right-2 top-1/2 -translate-y-1/2 w-4 h-7 rounded-l-full bg-[#111215] border-2 border-r-0 border-black z-20"></div>

      <!-- Top Hardware Flange & Film Strip Notch Bar -->
      <div class="flex items-center justify-between pb-3 mb-3 border-b-2 border-black/90">
        <div class="flex items-center gap-2">
          <!-- Flashing Status LED -->
          <div class="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-black border border-white/10 text-[9px] font-tech text-[#E8F624]">
            <span class="w-1.5 h-1.5 rounded-full bg-[#E8F624] animate-pulse"></span>
            <span>CHASSIS TELEMETRY // 实时工控读数仪</span>
          </div>
          <span class="hidden md:inline-block text-[10px] font-tech text-[#717682] uppercase tracking-wider">
            TACTILE CASSETTE HARDWARE
          </span>
        </div>

        <!-- Film Strip Perforated Marks -->
        <div class="flex items-center gap-1.5 opacity-60">
          <div v-for="i in 6" :key="i" class="w-2.5 h-1.5 rounded-xs bg-black border border-white/20"></div>
        </div>
      </div>

      <!-- Embedded Stamped Grooves (冲压凹槽轨道仪表) -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3.5">
        <!-- Bay 1: Total Schedule -->
        <div class="relative p-3.5 rounded-2xl zzz-stamped-groove flex flex-col justify-between overflow-hidden">
          <div class="flex items-center justify-between">
            <span class="text-[9px] sm:text-[10px] font-tech text-[#7A818E] uppercase tracking-wider font-bold">TOTAL SCHEDULE</span>
            <span class="w-2 h-2 rounded-full bg-[#E8F624] shadow-[0_0_8px_#E8F624]"></span>
          </div>
          <!-- Compact "大号数字 / 小号刻度" format -->
          <div class="my-2 flex items-baseline gap-1.5">
            <div class="text-2xl sm:text-3xl font-tech font-bold text-white tracking-tight leading-none">
              {{ shifts.length < 10 ? '0' + shifts.length : shifts.length }}
            </div>
            <span class="text-[10px] sm:text-[11px] font-tech text-[#7A818E] font-bold">/ {{ shifts.length }} DAYS</span>
          </div>
          <!-- Recessed Plastic Track with Acid Yellow Capsule Slider -->
          <div class="w-full h-2.5 rounded-full zzz-gauge-track p-0.5 overflow-hidden">
            <div class="h-full rounded-full bg-[#E8F624] w-full shadow-[0_0_6px_rgba(232,246,36,0.8)]"></div>
          </div>
        </div>

        <!-- Bay 2: Duty Shifts -->
        <div class="relative p-3.5 rounded-2xl zzz-stamped-groove flex flex-col justify-between overflow-hidden">
          <div class="flex items-center justify-between">
            <span class="text-[9px] sm:text-[10px] font-tech text-[#7A818E] uppercase tracking-wider font-bold">DUTY SHIFTS</span>
            <span class="w-2 h-2 rounded-full bg-[#36E4DA] shadow-[0_0_8px_#36E4DA]"></span>
          </div>
          <div class="my-2 flex items-baseline gap-1.5">
            <div class="text-2xl sm:text-3xl font-tech font-bold text-white tracking-tight leading-none">
              {{ workDaysCount < 10 ? '0' + workDaysCount : workDaysCount }}
            </div>
            <span class="text-[10px] sm:text-[11px] font-tech text-[#7A818E] font-bold">/ {{ shifts.length || 0 }} WORK</span>
          </div>
          <!-- Recessed Plastic Track with Cyan Capsule Slider -->
          <div class="w-full h-2.5 rounded-full zzz-gauge-track p-0.5 overflow-hidden">
            <div 
              class="h-full rounded-full bg-[#36E4DA] transition-all duration-300 shadow-[0_0_6px_rgba(54,228,218,0.8)]"
              :style="{ width: `${shifts.length ? (workDaysCount / shifts.length) * 100 : 0}%` }"
            ></div>
          </div>
        </div>

        <!-- Bay 3: Rest / Leave -->
        <div class="relative p-3.5 rounded-2xl zzz-stamped-groove flex flex-col justify-between overflow-hidden">
          <div class="flex items-center justify-between">
            <span class="text-[9px] sm:text-[10px] font-tech text-[#7A818E] uppercase tracking-wider font-bold">REST / LEAVE</span>
            <span class="w-2 h-2 rounded-full bg-[#9CA3AF]"></span>
          </div>
          <div class="my-2 flex items-baseline gap-1.5">
            <div class="text-2xl sm:text-3xl font-tech font-bold text-white tracking-tight leading-none">
              {{ offDaysCount < 10 ? '0' + offDaysCount : offDaysCount }}
            </div>
            <span class="text-[10px] sm:text-[11px] font-tech text-[#7A818E] font-bold">/ {{ shifts.length || 0 }} OFF</span>
          </div>
          <!-- Recessed Track with Dark Muted Capsule Slider -->
          <div class="w-full h-2.5 rounded-full zzz-gauge-track p-0.5 overflow-hidden">
            <div 
              class="h-full rounded-full bg-[#9CA3AF] transition-all duration-300"
              :style="{ width: `${shifts.length ? (offDaysCount / shifts.length) * 100 : 0}%` }"
            ></div>
          </div>
        </div>

        <!-- Bay 4: Anomalies / Pending Review -->
        <div 
          class="relative p-3.5 rounded-2xl zzz-stamped-groove flex flex-col justify-between overflow-hidden transition-all"
          :class="anomalyCount > 0 ? 'border-[#E03030] ring-1 ring-[#E03030]/50' : ''"
        >
          <div class="flex items-center justify-between">
            <span class="text-[9px] sm:text-[10px] font-tech uppercase tracking-wider font-bold" :class="anomalyCount > 0 ? 'text-[#E03030]' : 'text-[#7A818E]'">
              ANOMALIES // 待复核
            </span>
            <span 
              class="w-2 h-2 rounded-full" 
              :class="anomalyCount > 0 ? 'bg-[#E03030] animate-ping' : 'bg-[#9CA3AF]'"
            ></span>
          </div>
          <div class="my-2 flex items-baseline gap-1.5">
            <div 
              class="text-2xl sm:text-3xl font-tech font-bold tracking-tight leading-none"
              :class="anomalyCount > 0 ? 'text-[#E03030]' : 'text-white'"
            >
              {{ anomalyCount < 10 ? '0' + anomalyCount : anomalyCount }}
            </div>
            <span class="text-[10px] sm:text-[11px] font-tech text-[#7A818E] font-bold">/ {{ shifts.length || 0 }} RECHECK</span>
          </div>
          <!-- Recessed Track with Red Alert Capsule Slider -->
          <div class="w-full h-2.5 rounded-full zzz-gauge-track p-0.5 overflow-hidden">
            <div 
              class="h-full rounded-full transition-all duration-300"
              :class="anomalyCount > 0 ? 'bg-[#E03030] shadow-[0_0_8px_rgba(224,48,48,0.9)]' : 'bg-[#9CA3AF]'"
              :style="{ width: `${shifts.length ? (anomalyCount / shifts.length) * 100 : 0}%` }"
            ></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Filter & View Mode Controls (Gamepad / Hardware Console Pill Bar) -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3 p-2.5 sm:p-3 rounded-2xl zzz-panel">
      <!-- Gamepad Capsule Filter Buttons: 4-Column Full-Width Grid on Mobile (完全无需左右滑动) -->
      <div class="p-1 rounded-full bg-[#111215] border-2 border-black grid grid-cols-4 gap-1 w-full sm:w-auto shadow-inner">
        <button
          v-for="filter in filterOptions"
          :key="filter.id"
          type="button"
          @click="activeFilter = filter.id"
          :class="[
            'py-1.5 px-1 sm:px-3 rounded-full text-xs font-bold transition-all flex items-center justify-center gap-1 cursor-pointer whitespace-nowrap',
            activeFilter === filter.id
              ? 'bg-[#E8F624] text-black shadow-[0_2px_0_#000000]'
              : 'text-[#9CA3AF] hover:text-white'
          ]"
        >
          <!-- Short label on mobile screens, full label on sm+ screens -->
          <span class="hidden xs:inline">{{ filter.label }}</span>
          <span class="xs:hidden">{{ filter.shortLabel }}</span>
          <span 
            v-if="filter.count !== undefined" 
            :class="[
              'px-1.5 py-0.2 rounded-full font-tech text-[9px] sm:text-[10px] font-bold shrink-0',
              activeFilter === filter.id ? 'bg-black text-[#E8F624]' : 'bg-[#181A1E] text-[#9CA3AF]'
            ]"
          >
            {{ filter.count }}
          </span>
        </button>
      </div>

      <!-- Right Controls: View Switch & Add Day -->
      <div class="flex items-center justify-end gap-2 sm:gap-2.5 w-full sm:w-auto">
        <button
          type="button"
          @click="addNewDay"
          class="flex-1 sm:flex-initial px-3 sm:px-3.5 py-1.5 rounded-xl zzz-btn-dark text-xs font-bold text-white flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap"
        >
          <Plus class="w-3.5 h-3.5 text-[#E8F624] stroke-[2.5]" />
          <span>添加班次</span>
        </button>

        <!-- Hardware View Switch Dual Key -->
        <div class="p-0.5 sm:p-1 rounded-xl bg-[#111215] border-2 border-black flex items-center shadow-inner shrink-0">
          <button
            type="button"
            @click="viewMode = 'grid'"
            :class="[
              'p-1.5 rounded-lg text-xs transition cursor-pointer',
              viewMode === 'grid' ? 'bg-[#E8F624] text-black shadow-[0_1px_0_#000]' : 'text-[#9CA3AF] hover:text-white'
            ]"
            title="网格视图"
          >
            <LayoutGrid class="w-4 h-4 stroke-[2.2]" />
          </button>
          <button
            type="button"
            @click="viewMode = 'list'"
            :class="[
              'p-1.5 rounded-lg text-xs transition cursor-pointer',
              viewMode === 'list' ? 'bg-[#E8F624] text-black shadow-[0_1px_0_#000]' : 'text-[#9CA3AF] hover:text-white'
            ]"
            title="列表视图"
          >
            <List class="w-4 h-4 stroke-[2.2]" />
          </button>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-if="filteredShifts.length === 0" class="p-10 text-center rounded-3xl zzz-slot select-none">
      <CalendarIcon class="w-12 h-12 text-[#4B5563] mx-auto mb-3" />
      <div class="text-white font-bold text-sm uppercase tracking-wide">NO SHIFTS FOUND // 当前筛选无记录</div>
      <p class="text-xs text-[#9CA3AF] font-tech mt-1">切换上方筛选状态或点击右上角添加排班班次</p>
    </div>

    <!-- Grid View: Ticket Stub Cards -->
    <div 
      v-else-if="viewMode === 'grid'"
      class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5 sm:gap-4"
    >
      <div
        v-for="shift in filteredShifts"
        :key="shift.id"
        @click="openEditor(shift)"
        :class="[
          'relative p-4 rounded-2xl border-[2.5px] transition-all cursor-pointer group flex flex-col justify-between active:scale-[0.97]',
          (shift.confidence < 0.8 || (!shift.is_off && (!shift.start_time || !shift.end_time)))
            ? 'bg-[#1E2024] border-[#E03030] shadow-[0_4px_0_#000000]'
            : 'zzz-card hover:bg-[#2C3038]'
        ]"
      >
        <!-- Card Top Bar: Progress & Status Pill -->
        <div class="flex items-center justify-between mb-2 pb-2 border-b-2 border-black/80">
          <div class="flex items-center gap-1.5 text-[10px] font-tech text-[#7A818E]">
            <span class="w-1.5 h-1.5 rounded-full bg-[#E8F624]"></span>
            <span>进度: {{ (!shift.is_off && (!shift.start_time || !shift.end_time)) ? '0/1' : '1/1' }}</span>
          </div>

          <!-- Pure Color Reversal Status Pill Badges -->
          <div>
            <span 
              v-if="!shift.is_off && (!shift.start_time || !shift.end_time)"
              class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#E03030] text-white border border-black flex items-center gap-1 shadow-[0_1px_0_#000]"
            >
              <AlertCircle class="w-3 h-3 stroke-[2.2]" />
              MISSING
            </span>
            <span 
              v-else-if="shift.confidence < 0.8"
              class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#E8F624] text-black border border-black flex items-center gap-1 shadow-[0_1px_0_#000]"
            >
              <AlertTriangle class="w-3 h-3 stroke-[2.2]" />
              {{ (shift.confidence * 100).toFixed(0) }}%
            </span>
            <span
              v-else-if="shift.is_off"
              class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#36E4DA] text-black border border-black shadow-[0_1px_0_#000]"
            >
              休假
            </span>
            <span
              v-else
              class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#E8F624] text-black border border-black shadow-[0_1px_0_#000]"
            >
              出勤
            </span>
          </div>
        </div>

        <!-- Date Header & Raw OCR Text Pill -->
        <div class="flex items-baseline justify-between gap-1 mb-2">
          <div class="text-xs sm:text-sm font-tech font-bold text-white flex items-center gap-1.5">
            <span>{{ formatDisplayDate(shift.date) }}</span>
            <span class="text-[10px] text-[#7A818E]">({{ getWeekdayName(shift.date) }})</span>
          </div>
          <div class="flex items-center gap-1">
            <span class="text-[8px] font-tech text-[#7A818E]">RAW</span>
            <span class="px-1.5 py-0.2 rounded font-tech text-[10px] font-bold bg-[#141619] text-[#E8F624] border border-black shadow-inner">
              {{ shift.raw_text || '-' }}
            </span>
          </div>
        </div>

        <!-- Shift Main Display: Sunken Cavity Groove -->
        <div class="my-1.5 py-2 px-3 rounded-xl zzz-slot flex items-center justify-between">
          <div v-if="shift.is_off" class="text-[#36E4DA] font-bold text-xs flex items-center gap-2">
            <Coffee class="w-4 h-4 text-[#36E4DA]" />
            <span class="font-tech tracking-wide">全天休假 // OFF</span>
          </div>
          <div v-else class="flex items-center gap-2">
            <Clock class="w-4 h-4 text-[#E8F624] shrink-0" />
            <div class="font-tech text-xs sm:text-sm font-bold text-white tracking-wide">
              {{ shift.start_time || '??:??' }} <span class="text-[#9CA3AF]">/</span> {{ shift.end_time || '??:??' }}
            </div>
          </div>
          
          <ChevronRight class="w-4 h-4 text-[#9CA3AF] group-hover:text-[#E8F624] group-hover:translate-x-0.5 transition" />
        </div>

        <!-- ZZZ Mission Card Bottom Bar: Micro Runic Barcode & Action Pill (对齐绝区零任务卡片底部) -->
        <div class="mt-2.5 pt-2 border-t border-black/80 flex items-center justify-between">
          <!-- Digital Runic Barcode Stamp -->
          <div class="flex flex-col">
            <div class="text-[11px] font-tech font-bold text-white flex items-center gap-1">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="13" height="13" class="text-[#E8F624] shrink-0 fill-current">
                <path fill="currentColor" d="M194.82 496a18.36 18.36 0 0 1-18.1-21.53v-.11L204.83 320H96a16 16 0 0 1-12.44-26.06L302.73 23a18.45 18.45 0 0 1 32.8 13.71c0 .3-.08.59-.13.89L307.19 192H416a16 16 0 0 1 12.44 26.06L209.24 489a18.45 18.45 0 0 1-14.42 7"/>
              </svg>
              <span>{{ shift.is_off ? '00' : '100' }}</span>
            </div>
            <div class="zzz-runic-code select-none mt-0.5">
              ■■■■■■■■
            </div>
          </div>

          <!-- Tactile Action Pill Button -->
          <div class="flex items-center">
            <button 
              type="button"
              class="px-2.5 py-1 rounded-full zzz-btn-dark text-[10px] font-bold text-white group-hover:bg-[#E8F624] group-hover:text-black group-hover:border-black transition-all cursor-pointer shadow-[0_2px_0_#000]"
            >
              微调 // EDIT
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- List View: Perforated Industrial Strips -->
    <div v-else class="space-y-2.5">
      <div
        v-for="shift in filteredShifts"
        :key="shift.id"
        @click="openEditor(shift)"
        :class="[
          'p-3 sm:px-5 rounded-2xl border-[2.5px] transition-all cursor-pointer flex items-center justify-between group active:scale-[0.98]',
          (shift.confidence < 0.8 || (!shift.is_off && (!shift.start_time || !shift.end_time)))
            ? 'bg-[#1E2024] border-[#E03030] shadow-[0_3px_0_#000000]'
            : 'zzz-card hover:bg-[#2C3038]'
        ]"
      >
        <div class="flex items-center gap-2 sm:gap-6 min-w-0">
          <div class="w-16 sm:w-24 shrink-0">
            <div class="text-[11px] sm:text-xs font-tech font-bold text-white leading-tight">{{ formatDisplayDate(shift.date) }}</div>
            <div class="text-[9px] sm:text-[10px] text-[#9CA3AF]">({{ getWeekdayName(shift.date) }})</div>
          </div>

          <div class="shrink-0 text-center">
            <span class="text-[10px] px-1.5 sm:px-2 py-0.5 rounded-full font-tech font-bold bg-[#181A1E] text-[#E8F624] border border-black">
              {{ shift.raw_text || '-' }}
            </span>
          </div>

          <div class="flex items-center gap-1.5 min-w-0">
            <div v-if="shift.is_off" class="text-[#36E4DA] text-[11px] sm:text-xs font-bold flex items-center gap-1 font-tech whitespace-nowrap">
              <Coffee class="w-3.5 h-3.5 shrink-0" />
              <span>全天休假 // OFF</span>
            </div>
            <div v-else class="font-tech text-[11px] sm:text-xs font-bold text-white flex items-center gap-1 whitespace-nowrap">
              <Clock class="w-3.5 h-3.5 text-[#E8F624] shrink-0" />
              <span>{{ shift.start_time || '??:??' }}<span class="text-[#9CA3AF] mx-0.5">/</span>{{ shift.end_time || '??:??' }}</span>
            </div>
          </div>
        </div>

        <div class="flex items-center gap-2 shrink-0 ml-2">
          <!-- Desktop Badge (Hidden on mobile to keep clean red-border highlight without wrapping) -->
          <span 
            v-if="shift.confidence < 0.8 || (!shift.is_off && (!shift.start_time || !shift.end_time))"
            class="hidden sm:inline-flex text-[10px] px-2 py-0.5 rounded-full bg-[#E03030] text-white font-bold items-center gap-1 border border-black shadow-[0_1px_0_#000] whitespace-nowrap"
          >
            <AlertTriangle class="w-3 h-3 stroke-[2.2]" />
            待复核
          </span>
          <!-- Mobile Red Anomaly Warning Dot / Mini Icon -->
          <AlertTriangle 
            v-if="shift.confidence < 0.8 || (!shift.is_off && (!shift.start_time || !shift.end_time))"
            class="sm:hidden w-3.5 h-3.5 text-[#E03030] shrink-0"
          />
          <Edit3 class="w-3.5 h-3.5 text-[#9CA3AF] group-hover:text-[#E8F624] transition shrink-0" />
        </div>
      </div>
    </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { 
  CalendarDays, Briefcase, Coffee, AlertTriangle, AlertCircle, 
  Clock, Plus, LayoutGrid, List, ChevronRight, Edit3, Calendar as CalendarIcon,
  Users, User, Table, Star
} from 'lucide-vue-next';

const props = defineProps({
  shifts: {
    type: Array,
    default: () => []
  },
  staffSchedules: {
    type: Array,
    default: () => []
  },
  currentStaffName: {
    type: String,
    default: ''
  },
  myStaffName: {
    type: String,
    default: ''
  }
});

const emit = defineEmits(['edit-shift', 'add-shift', 'select-staff', 'set-my-staff']);

const viewMode = ref('grid');
const mainViewTab = ref('individual'); // 'individual' | 'matrix'
const activeFilter = ref('all');

const norm = (s) => (s || '').trim().toLowerCase();

function handleSelectStaff(name) {
  emit('select-staff', name);
}

// Compute all unique sorted dates across team
const teamMatrixDates = computed(() => {
  const set = new Set();
  if (Array.isArray(props.staffSchedules)) {
    for (const st of props.staffSchedules) {
      for (const sh of (st.shifts || [])) {
        if (sh.date) set.add(sh.date);
      }
    }
  }
  return Array.from(set).sort();
});

const matrixDateFilter = ref('all'); // 'all' | 'my_work' | 'my_off'

function getStaffShiftOnDate(staffName, date) {
  const st = props.staffSchedules?.find(s => s.staffName === staffName);
  if (!st || !Array.isArray(st.shifts)) return null;
  return st.shifts.find(sh => sh.date === date) || null;
}

// 结构化提取单日排班数据，严格按上班时间由早到晚排序并分组形成时间轴
function getDayTimelineData(date) {
  const workingShifts = [];
  const offStaff = [];
  const unassignedStaff = [];

  if (Array.isArray(props.staffSchedules)) {
    for (const st of props.staffSchedules) {
      const isMe = Boolean(props.myStaffName && norm(st.staffName) === norm(props.myStaffName));
      const sh = st.shifts?.find(s => s.date === date);
      if (!sh) {
        unassignedStaff.push({ staffName: st.staffName, isMe });
      } else if (sh.is_off) {
        offStaff.push({ staffName: st.staffName, shift: sh, isMe });
      } else {
        workingShifts.push({ staffName: st.staffName, shift: sh, isMe });
      }
    }
  }

  // 1. 严格按照上班时间 start_time 升序排列 (例如 09:00 -> 10:00 -> 14:00)
  workingShifts.sort((a, b) => {
    const sA = a.shift?.start_time || '99:99';
    const sB = b.shift?.start_time || '99:99';
    if (sA !== sB) return sA.localeCompare(sB);
    const eA = a.shift?.end_time || '99:99';
    const eB = b.shift?.end_time || '99:99';
    if (eA !== eB) return eA.localeCompare(eB);
    // 同时间段下本人优先靠前展示
    if (a.isMe && !b.isMe) return -1;
    if (!a.isMe && b.isMe) return 1;
    return a.staffName.localeCompare(b.staffName);
  });

  // 2. 将相同上班时段聚合为时间段节点
  const timeGroups = [];
  for (const item of workingShifts) {
    const start = item.shift?.start_time || '??:??';
    const end = item.shift?.end_time || '??:??';
    const timeKey = `${start} - ${end}`;
    const rawTag = item.shift?.raw_text || '';

    let grp = timeGroups.find(g => g.timeKey === timeKey);
    if (!grp) {
      grp = {
        timeKey,
        startTime: start,
        endTime: end,
        rawTag,
        members: []
      };
      timeGroups.push(grp);
    }
    grp.members.push(item);
  }

  // 休假列表排序：本人靠前
  offStaff.sort((a, b) => {
    if (a.isMe && !b.isMe) return -1;
    if (!a.isMe && b.isMe) return 1;
    return a.staffName.localeCompare(b.staffName);
  });

  return {
    timeGroups,
    offStaff,
    unassignedStaff,
    totalWorking: workingShifts.length,
    totalOff: offStaff.length
  };
}

const filteredMatrixDates = computed(() => {
  if (matrixDateFilter.value === 'all') {
    return teamMatrixDates.value;
  }
  return teamMatrixDates.value.filter(date => {
    const data = getDayTimelineData(date);
    if (matrixDateFilter.value === 'my_work') {
      return data.timeGroups.some(g => g.members.some(m => m.isMe));
    }
    if (matrixDateFilter.value === 'my_off') {
      return data.offStaff.some(m => m.isMe);
    }
    return true;
  });
});

function handleMatrixShiftClick(staffName, date) {
  // If not currently focused on this staff, focus on them
  if (props.currentStaffName !== staffName) {
    emit('select-staff', staffName);
  }
  const shift = getStaffShiftOnDate(staffName, date);
  if (shift) {
    emit('edit-shift', shift);
  }
}

const workDaysCount = computed(() => {
  return props.shifts.filter(s => !s.is_off && s.start_time && s.end_time).length;
});

const offDaysCount = computed(() => {
  return props.shifts.filter(s => s.is_off).length;
});

const anomalyCount = computed(() => {
  return props.shifts.filter(s => {
    const isMissingTime = !s.is_off && (!s.start_time || !s.end_time);
    const isLowConfidence = s.confidence < 0.8;
    return isMissingTime || isLowConfidence;
  }).length;
});

const filterOptions = computed(() => [
  { id: 'all', label: '全部班次', shortLabel: '全部', count: props.shifts.length },
  { id: 'anomalies', label: '待复核', shortLabel: '待核', count: anomalyCount.value },
  { id: 'work', label: '出勤工作', shortLabel: '出勤', count: workDaysCount.value },
  { id: 'off', label: '休假', shortLabel: '休假', count: offDaysCount.value },
]);

const filteredShifts = computed(() => {
  if (activeFilter.value === 'anomalies') {
    return props.shifts.filter(s => {
      const isMissingTime = !s.is_off && (!s.start_time || !s.end_time);
      const isLowConfidence = s.confidence < 0.8;
      return isMissingTime || isLowConfidence;
    });
  }
  if (activeFilter.value === 'work') {
    return props.shifts.filter(s => !s.is_off);
  }
  if (activeFilter.value === 'off') {
    return props.shifts.filter(s => s.is_off);
  }
  return props.shifts;
});

function formatDisplayDate(dateStr) {
  if (!dateStr) return '';
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    return `${parts[1]}月${parts[2]}日`;
  }
  return dateStr;
}

function getWeekdayName(dateStr) {
  if (!dateStr) return '';
  try {
    const d = new Date(dateStr + 'T00:00:00');
    const day = d.getDay();
    const map = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
    return map[day] || '';
  } catch (e) {
    return '';
  }
}

function openEditor(shift) {
  emit('edit-shift', shift);
}

function addNewDay() {
  emit('add-shift');
}
</script>
