// Theme Management
const ThemeManager = {
  init() {
    // Check for saved theme preference or use system preference
    const savedTheme = localStorage.getItem("theme")
    if (savedTheme) {
      this.setTheme(savedTheme)
    } else {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches
      this.setTheme(prefersDark ? "dark" : "light")
    }

    // Set up theme toggle button
    const themeToggle = document.getElementById("themeToggle")
    if (themeToggle) {
      themeToggle.addEventListener("click", () => {
        const currentTheme = document.body.classList.contains("dark-mode") ? "dark" : "light"
        const newTheme = currentTheme === "dark" ? "light" : "dark"
        this.setTheme(newTheme)
      })
    }
  },

  setTheme(theme) {
    if (theme === "dark") {
      document.body.classList.add("dark-mode")
    } else {
      document.body.classList.remove("dark-mode")
    }
    localStorage.setItem("theme", theme)
  },
}

// Sidebar Management
const SidebarManager = {
  init() {
    // Check for saved sidebar state
    const sidebarState = localStorage.getItem("sidebarCollapsed")
    if (sidebarState === "true") {
      document.querySelector(".app-container").classList.add("sidebar-collapsed")
    }

    // Set up sidebar toggle button
    const sidebarToggle = document.getElementById("sidebarToggle")
    if (sidebarToggle) {
      sidebarToggle.addEventListener("click", () => {
        const appContainer = document.querySelector(".app-container")
        appContainer.classList.toggle("sidebar-collapsed")
        localStorage.setItem("sidebarCollapsed", appContainer.classList.contains("sidebar-collapsed"))
      })
    }
  },
}

// Professional Business Accounting System - Enhanced JavaScript

// Application State
let creditData = [
  {
    id: 1,
    timestamp: "30/08/2022 - 10:30 AM",
    description: "DBBL-ft Gateway Payment",
    category: "বিক্রয়",
    amount: 70000,
  },
  {
    id: 2,
    timestamp: "05/09/2022 - 02:15 PM",
    description: "DBBL-ft Gateway Payment",
    category: "বিক্রয়",
    amount: 60000,
  },
  {
    id: 3,
    timestamp: "13/09/2022 - 11:45 AM",
    description: "SEBL-eft Gateway Service",
    category: "সেবা",
    amount: 139860,
  },
]

let debitData = [
  { id: 4, timestamp: "28/09/2022 - 09:20 AM", description: "অগাস্ট মাসের অফিস ভাড়া", category: "অফিস খরচ", amount: 2200 },
  {
    id: 5,
    timestamp: "15/10/2022 - 03:30 PM",
    description: "সেপ্টেম্বর মাসের বিদ্যুৎ বিল",
    category: "ইউটিলিটি",
    amount: 4600,
  },
  {
    id: 6,
    timestamp: "31/10/2022 - 01:15 PM",
    description: "অক্টোবর মাসের পরিবহন খরচ",
    category: "পরিবহন",
    amount: 7400,
  },
]

let nextId = 7
let editingTransaction = null
let isProcessing = false
let currentSection = "dashboard"

// Application Configuration
const CONFIG = {
  dateFormat: "dd/MM/yyyy",
  timeFormat: "12h",
  currency: "BDT",
  autoSave: true,
  animationDuration: 300,
  notificationDuration: 4000,
  version: "2.0.0",
}

// Utility Functions
const Utils = {
  formatNumber(num) {
    try {
      return new Intl.NumberFormat("bn-BD").format(num)
    } catch (error) {
      return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
    }
  },

  formatCurrency(amount) {
    return `${this.formatNumber(amount)} টাকা`
  },

  getCurrentTimestamp() {
    try {
      const now = new Date()
      const date = now.toLocaleDateString("en-GB")
      const time = now.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      })
      return `${date} - ${time}`
    } catch (error) {
      const now = new Date()
      const day = now.getDate().toString().padStart(2, "0")
      const month = (now.getMonth() + 1).toString().padStart(2, "0")
      const year = now.getFullYear()
      const hours = now.getHours()
      const minutes = now.getMinutes().toString().padStart(2, "0")
      const ampm = hours >= 12 ? "PM" : "AM"
      const displayHours = hours % 12 || 12
      return `${day}/${month}/${year} - ${displayHours}:${minutes} ${ampm}`
    }
  },

  getCurrentTimeForDisplay() {
    try {
      const now = new Date()
      const options = {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: true,
      }
      return now.toLocaleTimeString("en-US", options)
    } catch (error) {
      return new Date().toLocaleTimeString()
    }
  },

  getCurrentDateForDisplay() {
    try {
      const now = new Date()
      const options = {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      }
      return now.toLocaleDateString("bn-BD", options)
    } catch (error) {
      return new Date().toLocaleDateString()
    }
  },

  debounce(func, wait) {
    let timeout
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout)
        func(...args)
      }
      clearTimeout(timeout)
      timeout = setTimeout(later, wait)
    }
  },

  generateId() {
    return Date.now() + Math.random().toString(36).substr(2, 9)
  },

  smoothScrollTo(element) {
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" })
    }
  },
}

// Data Management
const DataManager = {
  save() {
    try {
      const data = {
        creditData,
        debitData,
        nextId,
        lastSaved: new Date().toISOString(),
        version: CONFIG.version,
      }
      localStorage.setItem("professionalAccountingData", JSON.stringify(data))
      return true
    } catch (error) {
      console.error("Error saving data:", error)
      return false
    }
  },

  load() {
    try {
      const savedData = localStorage.getItem("professionalAccountingData")
      if (savedData) {
        const data = JSON.parse(savedData)
        if (data.creditData && Array.isArray(data.creditData)) {
          creditData = data.creditData
        }
        if (data.debitData && Array.isArray(data.debitData)) {
          debitData = data.debitData
        }
        if (data.nextId && typeof data.nextId === "number") {
          nextId = data.nextId
        }
        return true
      }
      return false
    } catch (error) {
      console.error("Error loading data:", error)
      return false
    }
  },

  export() {
    const allData = [...creditData.map((t) => ({ ...t, type: "আয়" })), ...debitData.map((t) => ({ ...t, type: "ব্যয়" }))]

    const headers = ["তারিখ ও সময়", "বিবরণ", "ক্যাটেগরি", "ধরন", "পরিমাণ"]
    const csvContent = [
      headers.join(","),
      ...allData.map((row) =>
        [
          `"${row.timestamp || ""}"`,
          `"${(row.description || "").replace(/"/g, '""')}"`,
          `"${(row.category || "সাধারণ").replace(/"/g, '""')}"`,
          `"${row.type || ""}"`,
          row.amount || 0,
        ].join(","),
      ),
    ].join("\n")

    return "\ufeff" + csvContent
  },

  backup() {
    const backupData = {
      creditData,
      debitData,
      nextId,
      backupDate: new Date().toISOString(),
      version: CONFIG.version,
      metadata: {
        totalTransactions: creditData.length + debitData.length,
        totalIncome: creditData.reduce((sum, t) => sum + (t.amount || 0), 0),
        totalExpense: debitData.reduce((sum, t) => sum + (t.amount || 0), 0),
      },
    }
    return JSON.stringify(backupData, null, 2)
  },

  restore(backupData) {
    try {
      const data = JSON.parse(backupData)
      if (!data.creditData || !data.debitData) {
        throw new Error("Invalid backup format")
      }

      creditData = Array.isArray(data.creditData) ? data.creditData : []
      debitData = Array.isArray(data.debitData) ? data.debitData : []
      nextId = typeof data.nextId === "number" ? data.nextId : 1

      return this.save()
    } catch (error) {
      console.error("Error restoring data:", error)
      return false
    }
  },

  reset() {
    creditData = []
    debitData = []
    nextId = 1
    return this.save()
  },
}

// UI Management
const UI = {
  showLoading() {
    const overlay = document.getElementById("loadingOverlay")
    if (overlay) {
      overlay.style.display = "flex"
    }
  },

  hideLoading() {
    const overlay = document.getElementById("loadingOverlay")
    if (overlay) {
      overlay.style.display = "none"
    }
  },

  showNotification(message, type = "success", duration = CONFIG.notificationDuration) {
    const notification = document.getElementById("notification")
    if (!notification) return

    const iconMap = {
      success: "fas fa-check-circle",
      error: "fas fa-exclamation-circle",
      warning: "fas fa-exclamation-triangle",
      info: "fas fa-info-circle",
    }

    notification.className = `notification ${type}`
    notification.style.display = "block"

    const icon = notification.querySelector(".notification-icon")
    const messageEl = notification.querySelector(".notification-message")

    if (icon) icon.className = `notification-icon ${iconMap[type] || iconMap.info}`
    if (messageEl) messageEl.textContent = message

    setTimeout(() => {
      this.hideNotification()
    }, duration)
  },

  hideNotification() {
    const notification = document.getElementById("notification")
    if (notification) {
      notification.style.display = "none"
    }
  },

  animateValue(element, targetValue, duration = 1000, formatter = Utils.formatNumber) {
    if (!element) return

    const startValue = Number.parseInt(element.textContent.replace(/[^\d]/g, "")) || 0
    const difference = targetValue - startValue
    const startTime = performance.now()

    const animate = (currentTime) => {
      const elapsed = currentTime - startTime
      const progress = Math.min(elapsed / duration, 1)

      const easeOutCubic = 1 - Math.pow(1 - progress, 3)
      const currentValue = Math.round(startValue + difference * easeOutCubic)

      element.textContent = formatter(currentValue)

      if (progress < 1) {
        requestAnimationFrame(animate)
      }
    }

    requestAnimationFrame(animate)
  },

  switchSection(sectionName) {
    // Update navigation
    document.querySelectorAll(".nav-item").forEach((item) => {
      item.classList.remove("active")
      if (item.dataset.section === sectionName) {
        item.classList.add("active")
      }
    })

    // Update content sections
    document.querySelectorAll(".content-section").forEach((section) => {
      section.classList.remove("active")
    })

    const targetSection = document.getElementById(`${sectionName}-section`)
    if (targetSection) {
      targetSection.classList.add("active")
      currentSection = sectionName

      // Update page title
      this.updatePageTitle(sectionName)

      // Refresh section-specific data
      this.refreshSection(sectionName)
    }
  },

  updatePageTitle(sectionName) {
    const titleElement = document.getElementById("currentPageTitle")
    const subtitleElement = document.getElementById("currentPageSubtitle")

    const titles = {
      dashboard: {
        title: "ড্যাশবোর্ড",
        subtitle: "আপনার ব্যবসায়িক হিসাবের সম্পূর্ণ চিত্র",
      },
      transactions: {
        title: "লেনদেন ব্যবস্থাপনা",
        subtitle: "নতুন লেনদেন যোগ করুন এবং বিদ্যমান লেনদেন পরিচালনা করুন",
      },
      reports: {
        title: "রিপোর্ট ও বিশ্লেষণ",
        subtitle: "আপনার ব্যবসায়িক তথ্যের বিস্তারিত বিশ্লেষণ",
      },
      analytics: {
        title: "বিশ্লেষণ ও পরিসংখ্যান",
        subtitle: "গভীর বিশ্লেষণ এবং ট্রেন্ড পর্যবেক্ষণ",
      },
      settings: {
        title: "সিস্টেম সেটিংস",
        subtitle: "ডেটা ব্যাকআপ, রিস্টোর এবং সিস্টেম কনফিগারেশন",
      },
    }

    const sectionInfo = titles[sectionName] || titles.dashboard

    if (titleElement) titleElement.textContent = sectionInfo.title
    if (subtitleElement) subtitleElement.textContent = sectionInfo.subtitle
  },

  refreshSection(sectionName) {
    switch (sectionName) {
      case "dashboard":
        this.updateDashboard()
        break
      case "transactions":
        this.updateTransactions()
        break
      case "reports":
        this.updateReports()
        break
      case "analytics":
        this.updateAnalytics()
        break
      case "settings":
        this.updateSettings()
        break
    }
  },

  updateDashboard() {
    this.updateKPIs()
    this.updateDashboardStats()
    this.updateRecentTransactions()
  },

  updateKPIs() {
    const totalIncome = creditData.reduce((sum, t) => sum + (t.amount || 0), 0)
    const totalExpense = debitData.reduce((sum, t) => sum + (t.amount || 0), 0)
    const balance = totalIncome - totalExpense
    const totalTransactions = creditData.length + debitData.length

    this.animateValue(document.getElementById("totalBalance"), balance, 800, Utils.formatNumber)
    this.animateValue(document.getElementById("totalIncome"), totalIncome, 800, Utils.formatNumber)
    this.animateValue(document.getElementById("totalExpense"), totalExpense, 800, Utils.formatNumber)
    this.animateValue(document.getElementById("totalTransactions"), totalTransactions, 600)

    // Update balance color
    const balanceElement = document.getElementById("totalBalance")
    if (balanceElement) {
      balanceElement.className = balance >= 0 ? "kpi-value" : "kpi-value expense-color"
    }
  },

  updateDashboardStats() {
    const today = new Date()
    const todayFormatted =
      today.getDate().toString().padStart(2, "0") +
      "/" +
      (today.getMonth() + 1).toString().padStart(2, "0") +
      "/" +
      today.getFullYear()

    const todayTransactions = [...creditData, ...debitData].filter(
      (t) => t.timestamp && t.timestamp.includes(todayFormatted),
    )

    const todayIncome = todayTransactions
      .filter((t) => creditData.includes(t))
      .reduce((sum, t) => sum + (t.amount || 0), 0)

    const todayExpense = todayTransactions
      .filter((t) => debitData.includes(t))
      .reduce((sum, t) => sum + (t.amount || 0), 0)

    const currentMonth = today.getMonth()
    const currentYear = today.getFullYear()

    const monthlyIncome = creditData
      .filter((t) => {
        if (!t.timestamp) return false
        try {
          const datePart = t.timestamp.split(" - ")[0]
          const parts = datePart.split("/")
          if (parts.length !== 3) return false

          const transactionMonth = Number.parseInt(parts[1]) - 1
          const transactionYear = Number.parseInt(parts[2])

          return transactionMonth === currentMonth && transactionYear === currentYear
        } catch (e) {
          return false
        }
      })
      .reduce((sum, t) => sum + (t.amount || 0), 0)

    const monthlyExpense = debitData
      .filter((t) => {
        if (!t.timestamp) return false
        try {
          const datePart = t.timestamp.split(" - ")[0]
          const parts = datePart.split("/")
          if (parts.length !== 3) return false

          const transactionMonth = Number.parseInt(parts[1]) - 1
          const transactionYear = Number.parseInt(parts[2])

          return transactionMonth === currentMonth && transactionYear === currentYear
        } catch (e) {
          return false
        }
      })
      .reduce((sum, t) => sum + (t.amount || 0), 0)

    const monthlyProfit = monthlyIncome - monthlyExpense

    this.animateValue(document.getElementById("todayIncome"), todayIncome, 600, Utils.formatNumber)
    this.animateValue(document.getElementById("todayExpense"), todayExpense, 600, Utils.formatNumber)
    this.animateValue(document.getElementById("todayTransactions"), todayTransactions.length, 600)
    this.animateValue(document.getElementById("monthlyIncome"), monthlyIncome, 800, Utils.formatNumber)
    this.animateValue(document.getElementById("monthlyExpense"), monthlyExpense, 800, Utils.formatNumber)
    this.animateValue(document.getElementById("monthlyProfit"), monthlyProfit, 800, Utils.formatNumber)

    // Update monthly profit color
    const monthlyProfitElement = document.getElementById("monthlyProfit")
    if (monthlyProfitElement) {
      monthlyProfitElement.className = monthlyProfit >= 0 ? "summary-value income-color" : "summary-value expense-color"
    }
  },

  updateRecentTransactions() {
    const recentList = document.getElementById("recentTransactionsList")
    if (!recentList) return

    const allTransactions = [
      ...creditData.map((t) => ({ ...t, type: "income" })),
      ...debitData.map((t) => ({ ...t, type: "expense" })),
    ]
      .sort((a, b) => {
        // Sort by timestamp (newest first)
        const dateA = new Date(a.timestamp.split(" - ")[0].split("/").reverse().join("-"))
        const dateB = new Date(b.timestamp.split(" - ")[0].split("/").reverse().join("-"))
        return dateB - dateA
      })
      .slice(0, 5)

    if (allTransactions.length === 0) {
      recentList.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-inbox"></i>
                    <h3>কোন লেনদেন নেই</h3>
                    <p>এখনও কোন লেনদেন যোগ করা হয়নি</p>
                </div>
            `
      return
    }

    recentList.innerHTML = allTransactions
      .map(
        (transaction) => `
            <div class="recent-transaction-item ${transaction.type}">
                <div class="transaction-info">
                    <div class="transaction-description">${transaction.description}</div>
                    <div class="transaction-meta">
                        <i class="fas fa-tag"></i> ${transaction.category} • 
                        <i class="fas fa-clock"></i> ${transaction.timestamp}
                    </div>
                </div>
                <div class="transaction-amount ${transaction.type === "income" ? "income-color" : "expense-color"}">
                    ${transaction.type === "income" ? "+" : "-"}${Utils.formatCurrency(transaction.amount)}
                </div>
            </div>
        `,
      )
      .join("")
  },

  updateTransactions() {
    this.renderTable("creditTable", creditData)
    this.renderTable("debitTable", debitData)
  },

  renderTable(tableId, data) {
    const table = document.getElementById(tableId)
    if (!table) return

    const tbody = table.querySelector("tbody")
    if (!tbody) return

    if (data.length === 0) {
      tbody.innerHTML = `
                <tr>
                    <td colspan="5" class="empty-state">
                        <i class="fas fa-inbox"></i>
                        <h3>কোন তথ্য নেই</h3>
                        <p>এই ক্যাটেগরিতে কোন লেনদেন নেই</p>
                    </td>
                </tr>
            `
      return
    }

    tbody.innerHTML = data
      .map((item) => {
        const timestampParts = (item.timestamp || "").split(" - ")
        const date = timestampParts[0] || ""
        const time = timestampParts[1] || ""
        const isIncome = tableId === "creditTable"

        return `
                <tr>
                    <td>
                        <div class="font-semibold">${date}</div>
                        <div style="font-size: 0.75rem; color: #6b7280;">${time}</div>
                    </td>
                    <td class="font-medium">${item.description || ""}</td>
                    <td>
                        <span style="display: inline-flex; align-items: center; padding: 0.25rem 0.75rem; border-radius: 0.5rem; font-size: 0.75rem; font-weight: 600; background: rgba(59, 130, 246, 0.1); color: #2563eb;">
                            ${item.category || "সাধারণ"}
                        </span>
                    </td>
                    <td class="text-right font-bold ${isIncome ? "income-color" : "expense-color"}">
                        ${Utils.formatCurrency(item.amount || 0)}
                    </td>
                    <td class="text-center">
                        <div class="action-buttons">
                            <button class="action-btn edit" onclick="editTransaction(${item.id}, '${isIncome ? "credit" : "debit"}')">
                                <i class="fas fa-edit"></i>
                                সম্পাদনা
                            </button>
                            <button class="action-btn delete" onclick="deleteTransaction(${item.id}, '${isIncome ? "credit" : "debit"}')">
                                <i class="fas fa-trash"></i>
                                মুছুন
                            </button>
                        </div>
                    </td>
                </tr>
            `
      })
      .join("")
  },

  updateReports() {
    const totalIncome = creditData.reduce((sum, t) => sum + (t.amount || 0), 0)
    const totalExpense = debitData.reduce((sum, t) => sum + (t.amount || 0), 0)
    const netProfit = totalIncome - totalExpense

    // Update financial summary
    const reportTotalIncome = document.getElementById("reportTotalIncome")
    const reportTotalExpense = document.getElementById("reportTotalExpense")
    const reportNetProfit = document.getElementById("reportNetProfit")

    if (reportTotalIncome) reportTotalIncome.textContent = Utils.formatCurrency(totalIncome)
    if (reportTotalExpense) reportTotalExpense.textContent = Utils.formatCurrency(totalExpense)
    if (reportNetProfit) {
      reportNetProfit.textContent = Utils.formatCurrency(netProfit)
      reportNetProfit.className = `metric-value ${netProfit >= 0 ? "income-color" : "expense-color"}`
    }

    // Update category breakdown
    this.updateCategoryBreakdown()
  },

  updateCategoryBreakdown() {
    const categoryBreakdown = document.getElementById("categoryBreakdown")
    if (!categoryBreakdown) return

    const categories = {}
    debitData.forEach((transaction) => {
      const category = transaction.category || "সাধারণ"
      categories[category] = (categories[category] || 0) + transaction.amount
    })

    const totalExpense = Object.values(categories).reduce((sum, amount) => sum + amount, 0)

    if (totalExpense === 0) {
      categoryBreakdown.innerHTML = '<p style="color: #6b7280;">কোন ব্যয়ের তথ্য নেই</p>'
      return
    }

    categoryBreakdown.innerHTML = Object.entries(categories)
      .sort(([, a], [, b]) => b - a)
      .map(([category, amount]) => {
        const percentage = ((amount / totalExpense) * 100).toFixed(1)
        return `
                    <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px 0; border-bottom: 1px solid #e5e7eb;">
                        <span style="font-weight: 500;">${category}</span>
                        <div style="text-align: right;">
                            <div style="font-weight: 600; color: #dc2626;">${Utils.formatCurrency(amount)}</div>
                            <div style="font-size: 0.75rem; color: #6b7280;">${percentage}%</div>
                        </div>
                    </div>
                `
      })
      .join("")
  },

  updateAnalytics() {
    const now = new Date()
    const thisMonth = now.getMonth()
    const thisYear = now.getFullYear()
    const lastMonth = thisMonth === 0 ? 11 : thisMonth - 1
    const lastMonthYear = thisMonth === 0 ? thisYear - 1 : thisYear

    const thisMonthIncome = creditData
      .filter((t) => {
        if (!t.timestamp) return false
        try {
          const datePart = t.timestamp.split(" - ")[0]
          const parts = datePart.split("/")
          if (parts.length !== 3) return false

          const transactionMonth = Number.parseInt(parts[1]) - 1
          const transactionYear = Number.parseInt(parts[2])

          return transactionMonth === thisMonth && transactionYear === thisYear
        } catch (e) {
          return false
        }
      })
      .reduce((sum, t) => sum + (t.amount || 0), 0)

    const lastMonthIncome = creditData
      .filter((t) => {
        if (!t.timestamp) return false
        try {
          const datePart = t.timestamp.split(" - ")[0]
          const parts = datePart.split("/")
          if (parts.length !== 3) return false

          const transactionMonth = Number.parseInt(parts[1]) - 1
          const transactionYear = Number.parseInt(parts[2])

          return transactionMonth === lastMonth && transactionYear === lastMonthYear
        } catch (e) {
          return false
        }
      })
      .reduce((sum, t) => sum + (t.amount || 0), 0)

    const change = lastMonthIncome > 0 ? (((thisMonthIncome - lastMonthIncome) / lastMonthIncome) * 100).toFixed(1) : 0

    const avgIncome =
      creditData.length > 0 ? creditData.reduce((sum, t) => sum + (t.amount || 0), 0) / creditData.length : 0

    const avgExpense =
      debitData.length > 0 ? debitData.reduce((sum, t) => sum + (t.amount || 0), 0) / debitData.length : 0

    const thisMonthIncomeEl = document.getElementById("thisMonthIncome")
    const lastMonthIncomeEl = document.getElementById("lastMonthIncome")
    const incomeChangeEl = document.getElementById("incomeChange")
    const avgIncomeEl = document.getElementById("avgIncome")
    const avgExpenseEl = document.getElementById("avgExpense")

    if (thisMonthIncomeEl) thisMonthIncomeEl.textContent = Utils.formatCurrency(thisMonthIncome)
    if (lastMonthIncomeEl) lastMonthIncomeEl.textContent = Utils.formatCurrency(lastMonthIncome)
    if (incomeChangeEl) {
      incomeChangeEl.textContent = `${change >= 0 ? "+" : ""}${change}%`
      incomeChangeEl.className = `trend-value ${change >= 0 ? "text-success" : "text-danger"}`
    }
    if (avgIncomeEl) avgIncomeEl.textContent = Utils.formatCurrency(Math.round(avgIncome))
    if (avgExpenseEl) avgExpenseEl.textContent = Utils.formatCurrency(Math.round(avgExpense))
  },

  updateSettings() {
    const lastUpdate = document.getElementById("lastUpdate")
    const totalDataSize = document.getElementById("totalDataSize")

    if (lastUpdate) {
      lastUpdate.textContent = new Date().toLocaleDateString("bn-BD")
    }

    if (totalDataSize) {
      const dataString = JSON.stringify({ creditData, debitData })
      const sizeInBytes = new Blob([dataString]).size
      const sizeInKB = (sizeInBytes / 1024).toFixed(2)
      totalDataSize.textContent = `${sizeInKB} KB`
    }
  },
}

// Time Management
const TimeManager = {
  updateTime() {
    const currentTime = document.getElementById("currentTime")
    const currentDate = document.getElementById("currentDate")
    const autoTimestamp = document.getElementById("autoTimestamp")

    if (currentTime) {
      currentTime.textContent = Utils.getCurrentTimeForDisplay()
    }

    if (currentDate) {
      currentDate.textContent = Utils.getCurrentDateForDisplay()
    }

    if (autoTimestamp) {
      autoTimestamp.textContent = Utils.getCurrentTimestamp()
    }
  },

  startClock() {
    this.updateTime()
    setInterval(() => this.updateTime(), 1000)
  },
}

// Form Management
const FormManager = {
  validate(description, amount) {
    let isValid = true

    if (!description || description.trim() === "") {
      isValid = false
    }

    if (!amount || isNaN(amount) || amount <= 0) {
      isValid = false
    }

    return isValid
  },

  reset() {
    const form = document.getElementById("transactionForm")
    if (form) {
      form.reset()
      // Clear error messages
      form.querySelectorAll(".error-message").forEach((error) => {
        error.textContent = ""
      })
    }
  },

  setupEventListeners() {
    const form = document.getElementById("transactionForm")
    if (form) {
      form.addEventListener("submit", (e) => {
        e.preventDefault()
        addTransaction()
      })
    }

    // Navigation event listeners
    document.querySelectorAll(".nav-item").forEach((item) => {
      item.addEventListener("click", (e) => {
        e.preventDefault()
        const section = item.dataset.section
        if (section) {
          UI.switchSection(section)
        }
      })
    })

    // Keyboard shortcuts
    document.addEventListener("keydown", (e) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case "s":
            e.preventDefault()
            if (currentSection === "transactions") {
              addTransaction()
            }
            break
          case "e":
            e.preventDefault()
            exportToCSV()
            break
          case "b":
            e.preventDefault()
            backupData()
            break
        }
      }

      if (e.key === "Escape") {
        closeEditModal()
      }
    })
  },
}

// Transaction Management Functions
function addTransaction() {
  if (isProcessing) return
  isProcessing = true

  UI.showLoading()

  try {
    const description = document.getElementById("description").value
    const amount = Number.parseFloat(document.getElementById("amount").value)
    const category = document.getElementById("category").value
    const type = document.getElementById("type").value

    const isValid = FormManager.validate(description, amount)

    if (!isValid) {
      UI.hideLoading()
      isProcessing = false
      return
    }

    setTimeout(() => {
      const newEntry = {
        id: nextId++,
        timestamp: Utils.getCurrentTimestamp(),
        description: description.trim(),
        category: category,
        amount: amount,
      }

      if (type === "credit") {
        creditData.push(newEntry)
      } else {
        debitData.push(newEntry)
      }

      if (DataManager.save()) {
        FormManager.reset()
        UI.refreshSection(currentSection)
        UI.showNotification("লেনদেন সফলভাবে যুক্ত হয়েছে", "success")
      } else {
        UI.showNotification("লেনদেন সংরক্ষণ করতে সমস্যা হয়েছে", "error")
      }

      UI.hideLoading()
      isProcessing = false
    }, 500)
  } catch (error) {
    console.error("Error adding transaction:", error)
    UI.showNotification("লেনদেন যুক্ত করতে সমস্যা হয়েছে", "error")
    UI.hideLoading()
    isProcessing = false
  }
}

function editTransaction(id, type) {
  if (isProcessing) return

  try {
    const data = type === "credit" ? creditData : debitData
    const transaction = data.find((t) => t.id === id)

    if (transaction) {
      editingTransaction = { id: id, type: type }

      // Clear previous errors
      document.getElementById("editDescriptionError").textContent = ""
      document.getElementById("editAmountError").textContent = ""

      // Populate form
      document.getElementById("editDescription").value = transaction.description || ""
      document.getElementById("editAmount").value = transaction.amount || ""
      document.getElementById("editCategory").value = transaction.category || "সাধারণ"

      // Show modal
      const modal = document.getElementById("editModal")
      if (modal) {
        modal.style.display = "block"
      }
    }
  } catch (error) {
    console.error("Error preparing edit:", error)
    UI.showNotification("সম্পাদনা প্রস্তুত করতে সমস্যা হয়েছে", "error")
  }
}

function saveEdit() {
  if (isProcessing || !editingTransaction) return
  isProcessing = true

  UI.showLoading()

  try {
    const description = document.getElementById("editDescription").value
    const amount = Number.parseFloat(document.getElementById("editAmount").value)
    const category = document.getElementById("editCategory").value

    const isValid = FormManager.validate(description, amount)

    if (!isValid) {
      UI.hideLoading()
      isProcessing = false
      return
    }

    setTimeout(() => {
      const data = editingTransaction.type === "credit" ? creditData : debitData
      const transaction = data.find((t) => t.id === editingTransaction.id)

      if (transaction) {
        transaction.description = description.trim()
        transaction.amount = amount
        transaction.category = category

        if (DataManager.save()) {
          UI.refreshSection(currentSection)
          closeEditModal()
          UI.showNotification("লেনদেন সফলভাবে আপডেট হয়েছে", "success")
        } else {
          UI.showNotification("লেনদেন আপডেট করতে সমস্যা হয়েছে", "error")
        }
      }

      UI.hideLoading()
      isProcessing = false
    }, 500)
  } catch (error) {
    console.error("Error saving edit:", error)
    UI.showNotification("সম্পাদনা সংরক্ষণ করতে সমস্যা হয়েছে", "error")
    UI.hideLoading()
    isProcessing = false
  }
}

function closeEditModal() {
  const modal = document.getElementById("editModal")
  if (modal) {
    modal.style.display = "none"
  }
  editingTransaction = null

  // Clear errors
  document.getElementById("editDescriptionError").textContent = ""
  document.getElementById("editAmountError").textContent = ""
}

function deleteTransaction(id, type) {
  if (isProcessing) return

  try {
    if (confirm("আপনি কি এই লেনদেনটি মুছে ফেলতে চান?")) {
      isProcessing = true
      UI.showLoading()

      setTimeout(() => {
        if (type === "credit") {
          creditData = creditData.filter((t) => t.id !== id)
        } else {
          debitData = debitData.filter((t) => t.id !== id)
        }

        if (DataManager.save()) {
          UI.refreshSection(currentSection)
          UI.showNotification("লেনদেন সফলভাবে মুছে ফেলা হয়েছে", "success")
        } else {
          UI.showNotification("লেনদেন মুছতে সমস্যা হয়েছে", "error")
        }

        UI.hideLoading()
        isProcessing = false
      }, 300)
    }
  } catch (error) {
    console.error("Error deleting transaction:", error)
    UI.showNotification("লেনদেন মুছতে সমস্যা হয়েছে", "error")
    isProcessing = false
  }
}

// Export and Backup Functions
function exportToCSV() {
  if (isProcessing) return
  isProcessing = true

  UI.showLoading()

  try {
    setTimeout(() => {
      const csvContent = DataManager.export()
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
      const link = document.createElement("a")
      link.href = URL.createObjectURL(blob)
      link.download = `ব্যবসায়িক_হিসাব_${new Date().toLocaleDateString("en-GB").replace(/\//g, "-")}.csv`
      link.click()

      UI.showNotification("CSV ফাইল সফলভাবে ডাউনলোড হয়েছে", "success")
      UI.hideLoading()
      isProcessing = false
    }, 800)
  } catch (error) {
    console.error("Error exporting CSV:", error)
    UI.showNotification("CSV এক্সপোর্ট করতে সমস্যা হয়েছে", "error")
    UI.hideLoading()
    isProcessing = false
  }
}

function printReport() {
  if (isProcessing) return
  isProcessing = true

  UI.showLoading()

  try {
    setTimeout(() => {
      const totalCredit = creditData.reduce((sum, t) => sum + (t.amount || 0), 0)
      const totalDebit = debitData.reduce((sum, t) => sum + (t.amount || 0), 0)
      const balance = totalCredit - totalDebit

      const printWindow = window.open("", "_blank")
      if (!printWindow) {
        UI.showNotification("প্রিন্ট উইন্ডো খুলতে সমস্যা হয়েছে। পপ-আপ ব্লকার চেক করুন", "error")
        UI.hideLoading()
        isProcessing = false
        return
      }

      const htmlContent = `
                <!DOCTYPE html>
                <html>
                <head>
                    <title>ব্যবসায়িক হিসাব রিপোর্ট</title>
                    <meta charset="UTF-8">
                    <style>
                        body { 
                            font-family: 'Inter', Arial, sans-serif; 
                            margin: 20px; 
                            line-height: 1.6;
                            color: #374151;
                        }
                        .header {
                            text-align: center;
                            margin-bottom: 30px;
                            padding-bottom: 20px;
                            border-bottom: 3px solid #2563eb;
                        }
                        .header h1 {
                            color: #1f2937;
                            font-size: 28px;
                            margin-bottom: 10px;
                            font-weight: 800;
                        }
                        .company-info {
                            color: #6b7280;
                            font-size: 14px;
                        }
                        table { 
                            width: 100%; 
                            border-collapse: collapse; 
                            margin: 20px 0;
                            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                            border-radius: 8px;
                            overflow: hidden;
                        }
                        th, td { 
                            border: 1px solid #e5e7eb; 
                            padding: 12px 8px; 
                            text-align: left; 
                            font-size: 12px;
                        }
                        th { 
                            background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
                            font-weight: 700;
                            color: #374151;
                        }
                        .summary { 
                            background: linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%);
                            padding: 25px; 
                            margin: 25px 0; 
                            border: 2px solid #e5e7eb;
                            border-radius: 12px;
                            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
                        }
                        .summary h3 {
                            margin-top: 0;
                            color: #1f2937;
                            font-size: 20px;
                            margin-bottom: 15px;
                        }
                        .text-right { text-align: right; }
                        .income { color: #059669; font-weight: 600; }
                        .expense { color: #dc2626; font-weight: 600; }
                        .balance { 
                            color: ${balance >= 0 ? "#2563eb" : "#dc2626"}; 
                            font-weight: 800;
                            font-size: 18px;
                        }
                        .section-title {
                            color: #1f2937;
                            font-size: 18px;
                            font-weight: 700;
                            margin: 25px 0 15px 0;
                            padding-bottom: 8px;
                            border-bottom: 2px solid #e5e7eb;
                            display: flex;
                            align-items: center;
                            gap: 8px;
                        }
                        .footer {
                            margin-top: 40px;
                            text-align: center;
                            color: #6b7280;
                            font-size: 12px;
                            border-top: 1px solid #e5e7eb;
                            padding-top: 20px;
                        }
                        @media print { 
                            body { font-size: 11px; margin: 15px; } 
                            .header h1 { font-size: 24px; } 
                            .section-title { font-size: 16px; }
                            .balance { font-size: 16px; }
                        }
                    </style>
                </head>
                <body>
                    <div class="header">
                        <h1>ব্যবসায়িক হিসাব রিপোর্ট</h1>
                        <div class="company-info">
                            <p><strong>তারিখ:</strong> ${new Date().toLocaleDateString("bn-BD")}</p>
                            <p><strong>সময়:</strong> ${new Date().toLocaleTimeString("bn-BD")}</p>
                            <p><strong>রিপোর্ট ID:</strong> ${Utils.generateId()}</p>
                        </div>
                    </div>
                    
                    <div class="summary">
                        <h3>📊 আর্থিক সারসংক্ষেপ</h3>
                        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px;">
                            <div>
                                <p class="income">💰 মোট আয়: ${Utils.formatCurrency(totalCredit)}</p>
                            </div>
                            <div>
                                <p class="expense">💸 মোট ব্যয়: ${Utils.formatCurrency(totalDebit)}</p>
                            </div>
                            <div>
                                <p class="balance">⚖️ নিট ব্যালেন্স: ${Utils.formatCurrency(balance)}</p>
                            </div>
                        </div>
                    </div>
                    
                    <h3 class="section-title">💰 আয়ের বিস্তারিত তালিকা</h3>
                    <table>
                        <thead>
                            <tr>
                                <th>তারিখ ও সময়</th>
                                <th>বিবরণ</th>
                                <th>ক্যাটেগরি</th>
                                <th class="text-right">পরিমাণ (টাকা)</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${creditData
                              .map(
                                (item) => `
                                <tr>
                                    <td>${item.timestamp || ""}</td>
                                    <td>${item.description || ""}</td>
                                    <td>${item.category || "সাধারণ"}</td>
                                    <td class="text-right income">${Utils.formatNumber(item.amount || 0)}</td>
                                </tr>
                            `,
                              )
                              .join("")}
                            ${creditData.length === 0 ? '<tr><td colspan="4" style="text-align: center; color: #6b7280;">কোন আয়ের তথ্য নেই</td></tr>' : ""}
                        </tbody>
                    </table>
                    
                    <h3 class="section-title">💸 ব্যয়ের বিস্তারিত তালিকা</h3>
                    <table>
                        <thead>
                            <tr>
                                <th>তারিখ ও সময়</th>
                                <th>বিবরণ</th>
                                <th>ক্যাটেগরি</th>
                                <th class="text-right">পরিমাণ (টাকা)</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${debitData
                              .map(
                                (item) => `
                                <tr>
                                    <td>${item.timestamp || ""}</td>
                                    <td>${item.description || ""}</td>
                                    <td>${item.category || "সাধারণ"}</td>
                                    <td class="text-right expense">${Utils.formatNumber(item.amount || 0)}</td>
                                </tr>
                            `,
                              )
                              .join("")}
                            ${debitData.length === 0 ? '<tr><td colspan="4" style="text-align: center; color: #6b7280;">কোন ব্যয়ের তথ্য নেই</td></tr>' : ""}
                        </tbody>
                    </table>
                    
                    <div class="footer">
                        <p>এই রিপোর্টটি ব্যবসায়িক হিসাব ব্যবস্থাপনা সিস্টেম দ্বারা স্বয়ংক্রিয়ভাবে তৈরি করা হয়েছে</p>
                        <p>© ${new Date().getFullYear()} ব্যবসায়িক হিসাব ব্যবস্থাপনা - সর্বস্বত্ব সংরক্ষিত</p>
                    </div>
                    
                    <script>
                        window.onload = function() { 
                            setTimeout(function() { 
                                window.print(); 
                            }, 1000); 
                        }
                    </script>
                </body>
                </html>
            `

      printWindow.document.write(htmlContent)
      printWindow.document.close()

      UI.showNotification("প্রিন্ট রিপোর্ট তৈরি হয়েছে", "success")
      UI.hideLoading()
      isProcessing = false
    }, 800)
  } catch (error) {
    console.error("Error printing report:", error)
    UI.showNotification("প্রিন্ট করতে সমস্যা হয়েছে", "error")
    UI.hideLoading()
    isProcessing = false
  }
}

function generatePDF() {
  UI.showNotification("PDF জেনারেশন ফিচার শীঘ্রই আসছে", "info")
}

function backupData() {
  if (isProcessing) return
  isProcessing = true

  UI.showLoading()

  try {
    setTimeout(() => {
      const backupContent = DataManager.backup()
      const blob = new Blob([backupContent], { type: "application/json" })
      const link = document.createElement("a")
      link.href = URL.createObjectURL(blob)
      link.download = `ব্যবসায়িক_হিসাব_ব্যাকআপ_${new Date().toLocaleDateString("en-GB").replace(/\//g, "-")}.json`
      link.click()

      UI.showNotification("ব্যাকআপ ফাইল সফলভাবে ডাউনলোড হয়েছে", "success")
      UI.hideLoading()
      isProcessing = false
    }, 800)
  } catch (error) {
    console.error("Error creating backup:", error)
    UI.showNotification("ব্যাকআপ করতে সমস্যা হয়েছে", "error")
    UI.hideLoading()
    isProcessing = false
  }
}

function restoreData(event) {
  if (isProcessing) return

  const file = event.target.files[0]
  if (!file) return

  isProcessing = true
  UI.showLoading()

  try {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const backupContent = e.target.result

        if (confirm("এই অপারেশন বর্তমান সব ডেটা মুছে দেবে। আপনি কি নিশ্চিত?")) {
          if (DataManager.restore(backupContent)) {
            UI.refreshSection(currentSection)
            UI.showNotification("ডেটা সফলভাবে রিস্টোর হয়েছে", "success")
          } else {
            UI.showNotification("ডেটা রিস্টোর করতে সমস্যা হয়েছে", "error")
          }
        }
      } catch (error) {
        console.error("Error parsing backup file:", error)
        UI.showNotification("ব্যাকআপ ফাইল পড়তে সমস্যা হয়েছে", "error")
      } finally {
        UI.hideLoading()
        isProcessing = false
        document.getElementById("restoreFile").value = ""
      }
    }

    reader.onerror = () => {
      UI.showNotification("ফাইল পড়তে সমস্যা হয়েছে", "error")
      UI.hideLoading()
      isProcessing = false
      document.getElementById("restoreFile").value = ""
    }

    reader.readAsText(file)
  } catch (error) {
    console.error("Error restoring data:", error)
    UI.showNotification("ডেটা রিস্টোর করতে সমস্যা হয়েছে", "error")
    UI.hideLoading()
    isProcessing = false
    document.getElementById("restoreFile").value = ""
  }
}

function resetAllData() {
  if (isProcessing) return

  try {
    const confirmReset = confirm("আপনি কি নিশ্চিত যে আপনি সমস্ত লেনদেন মুছে ফেলতে চান? এই কাজটি পূর্বাবস্থায় ফেরানো যাবে না।")

    if (confirmReset) {
      isProcessing = true
      UI.showLoading()

      setTimeout(() => {
        try {
          if (DataManager.reset()) {
            UI.refreshSection(currentSection)
            UI.showNotification("সমস্ত ডেটা সফলভাবে মুছে ফেলা হয়েছে", "success")
          } else {
            UI.showNotification("ডেটা মুছতে সমস্যা হয়েছে", "error")
          }
        } catch (innerError) {
          console.error("Error resetting data:", innerError)
          UI.showNotification("ডেটা রিসেট করতে সমস্যা হয়েছে", "error")
        } finally {
          UI.hideLoading()
          isProcessing = false
        }
      }, 1000)
    }
  } catch (error) {
    console.error("Error resetting all data:", error)
    UI.showNotification("সমস্ত ডেটা রিসেট করতে সমস্যা হয়েছে", "error")
    isProcessing = false
  }
}

// Utility Functions for Navigation
function switchSection(sectionName) {
  UI.switchSection(sectionName)
}

function hideNotification() {
  UI.hideNotification()
}

// Application Initialization
function initializeApp() {
  try {
    // Initialize theme manager
    ThemeManager.init()

    // Initialize sidebar manager
    SidebarManager.init()

    // Load saved data
    DataManager.load()

    // Start time updates
    TimeManager.startClock()

    // Setup form event listeners
    FormManager.setupEventListeners()

    // Initialize UI
    UI.switchSection("dashboard")

    // Show welcome notification
    setTimeout(() => {
      UI.showNotification("প্রফেশনাল ব্যবসায়িক হিসাব ব্যবস্থাপনা সিস্টেমে স্বাগতম", "success")
    }, 1000)

    // Auto-save every 30 seconds
    if (CONFIG.autoSave) {
      setInterval(() => {
        DataManager.save()
      }, 30000)
    }

    console.log("Professional Accounting System initialized successfully")
  } catch (error) {
    console.error("Error initializing application:", error)
    UI.showNotification("অ্যাপ্লিকেশন শুরু করতে সমস্যা হয়েছে", "error")
  }
}

// Event Listeners
document.addEventListener("DOMContentLoaded", initializeApp)

// Handle page visibility changes for auto-save
document.addEventListener("visibilitychange", () => {
  if (document.hidden && CONFIG.autoSave) {
    DataManager.save()
  }
})

// Handle beforeunload for data safety
window.addEventListener("beforeunload", (e) => {
  if (CONFIG.autoSave) {
    DataManager.save()
  }
})

// Handle window resize for responsive updates
window.addEventListener(
  "resize",
  Utils.debounce(() => {
    UI.refreshSection(currentSection)
  }, 250),
)

// Performance monitoring
if ("performance" in window) {
  window.addEventListener("load", () => {
    setTimeout(() => {
      const perfData = performance.getEntriesByType("navigation")[0]
      console.log(`Page load time: ${perfData.loadEventEnd - perfData.loadEventStart}ms`)
    }, 0)
  })
}

// Export global functions for HTML onclick handlers
window.addTransaction = addTransaction
window.editTransaction = editTransaction
window.saveEdit = saveEdit
window.closeEditModal = closeEditModal
window.deleteTransaction = deleteTransaction
window.exportToCSV = exportToCSV
window.printReport = printReport
window.generatePDF = generatePDF
window.backupData = backupData
window.restoreData = restoreData
window.resetAllData = resetAllData
window.switchSection = switchSection
window.hideNotification = hideNotification

// Development helpers (remove in production)
if (typeof process !== "undefined" && process?.env?.NODE_ENV === "development") {
  window.devTools = {
    creditData,
    debitData,
    DataManager,
    UI,
    Utils,
    CONFIG,
  }
}
