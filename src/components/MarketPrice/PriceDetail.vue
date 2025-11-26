<template>
  <div class="plant-detail">
    <!-- 상단 헤더 -->
    <div class="header-bar">
      <img 
        src="../../assets/icons/back-arrow.png" 
        alt="뒤로가기" 
        class="back-btn" 
        @click="$router.back()" 
      />
      <h2 class="plant-name">{{ plantName || '식물명' }}</h2>
    </div>

    <!-- 현재 가격 정보 -->
    <div class="price-info">
      <div class="current-price">
        <span class="price">{{ formatPrice(currentPrice) }}</span>
        <span :class="['change', priceChange > 0 ? 'positive' : 'negative']">
          {{ priceChange > 0 ? '+' : '' }}{{ formatPrice(Math.abs(priceChange)) }}
          ({{ priceChangePercent > 0 ? '+' : '' }}{{ priceChangePercent.toFixed(2) }}%)
        </span>
      </div>
      <div class="price-range">
        <span class="range-item">최고: {{ formatPrice(highPrice) }}</span>
        <span class="range-item">최저: {{ formatPrice(lowPrice) }}</span>
      </div>
    </div>

    <div class="title-bar">
      <h3 class="chart-title">시세 차트</h3>
    </div>

    <!-- 기간 선택 탭 -->
    <div class="period-tabs">
      <button 
        v-for="p in periods" 
        :key="p.value" 
        :class="{ active: selectedPeriod === p.value }"
        @click="changePeriod(p.value)"
      >
        {{ p.label }}
      </button>
    </div>

    <!-- 그래프 -->
    <div class="chart-container">
      <apexchart 
        type="line" 
        height="250" 
        :options="chartOptions" 
        :series="series" 
      />
    </div>

    <!-- 체결 거래 내역 -->
    <div class="trade-history">
      <div class="section-header">
        <h3>최근 거래 내역</h3>
        <span class="trade-count">{{ trades.length }}건</span>
      </div>
      <div class="table-wrapper">
        <table>
          <thead>
            <tr class="table-header">
              <th>거래가</th>
              <th>변동</th>
              <th>거래 일자</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(trade, index) in trades" :key="trade.date + index">
              <td class="price-cell">{{ formatPrice(trade.price) }}</td>
              <td :class="['change-cell', getTradeChangeClass(trade, index)]">
                {{ getTradeChange(trade, index) }}
              </td>
              <td class="date-cell">{{ formatDate(trade.date) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- 통계 정보 -->
    <div class="statistics">
      <h3>거래 통계</h3>
      <div class="stats-grid">
        <div class="stat-item">
          <span class="stat-label">거래량</span>
          <span class="stat-value">{{ tradeVolume }}개</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">평균가</span>
          <span class="stat-value">{{ formatPrice(averagePrice) }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">시가총액</span>
          <span class="stat-value">{{ formatPrice(marketCap) }}</span>
        </div>
      </div>
    </div>

    <!-- 구매 / 판매 버튼 -->
    <div class="action-buttons">
      <button class="buy" @click="handleBuy">
        <span class="btn-label">구매</span>
        <span class="btn-price">{{ formatPrice(buyPrice) }}</span>
      </button>
      <button class="sell" @click="handleSell">
        <span class="btn-label">판매</span>
        <span class="btn-price">{{ formatPrice(sellPrice) }}</span>
      </button>
    </div>
  </div>
</template>

<script>
import VueApexCharts from "vue3-apexcharts";

export default {
  name: "PriceDetail",
  components: { apexchart: VueApexCharts },
  data() {
    return {
      plantName: "몬스테라 델리시오사",
      currentPrice: 125000,
      priceChange: 8000,
      priceChangePercent: 6.8,
      highPrice: 153000,
      lowPrice: 98000,
      tradeVolume: 124,
      averagePrice: 118500,
      marketCap: 15620000,
      selectedPeriod: "1m",
      periods: [
        { label: "1개월", value: "1m" },
        { label: "3개월", value: "3m" },
        { label: "6개월", value: "6m" },
        { label: "1년", value: "1y" },
        { label: "전체", value: "all" }
      ],
      dummyData: {
        "1m": [110000, 115000, 112000, 118000, 125000],
        "3m": [100000, 120000, 115000, 130000, 125000, 118000],
        "6m": [95000, 110000, 125000, 130000, 120000, 135000, 125000],
        "1y": [90000, 95000, 110000, 120000, 125000, 140000, 130000, 125000],
        "all": [80000, 100000, 120000, 140000, 160000, 180000, 125000]
      },
      series: [
        { name: "시세", data: [] }
      ],
      chartOptions: {
        chart: { 
          toolbar: { show: false },
          sparkline: { enabled: false }
        },
        stroke: { 
          curve: "smooth",
          width: 3,
          colors: ['#568265']
        },
        grid: {
          borderColor: '#e0e0e0',
          strokeDashArray: 3
        },
        xaxis: { 
          categories: [],
          labels: {
            style: { fontSize: '12px', colors: '#666' }
          }
        },
        yaxis: {
          labels: {
            formatter: (val) => this.formatPrice(val),
            style: { fontSize: '11px', colors: '#666' }
          }
        },
        tooltip: {
          y: {
            formatter: (val) => this.formatPrice(val)
          }
        },
        colors: ['#568265']
      },
      trades: [
        { price: 125000, date: "2024-06-24" },
        { price: 118000, date: "2024-06-24" },
        { price: 115000, date: "2024-06-23" },
        { price: 120000, date: "2024-06-23" },
        { price: 99000, date: "2024-06-22" },
        { price: 105000, date: "2024-06-22" }
      ],
      buyPrice: 127000,
      sellPrice: 123000
    }
  },
  mounted() {
    this.changePeriod("1m");
  },
  methods: {
    changePeriod(period) {
      this.selectedPeriod = period;
      this.series = [
        { name: "시세", data: this.dummyData[period] }
      ];
      this.chartOptions = {
        ...this.chartOptions,
        xaxis: { 
          ...this.chartOptions.xaxis,
          categories: this.generateCategories(period) 
        }
      };
    },
    generateCategories(period) {
      if (period === "1m") return ["1주", "2주", "3주", "4주", "현재"];
      if (period === "3m") return ["1월", "2월", "3월", "4월", "5월", "현재"];
      if (period === "6m") return ["1월", "2월", "3월", "4월", "5월", "6월", "현재"];
      if (period === "1y") return ["1월", "2월", "3월", "4월", "5월", "6월", "7월", "현재"];
      return ["2019", "2020", "2021", "2022", "2023", "2024", "현재"];
    },
    formatPrice(val) {
      return val.toLocaleString() + "원";
    },
    formatDate(dateString) {
      const date = new Date(dateString);
      return `${String(date.getMonth() + 1).padStart(2, '0')}/${String(date.getDate()).padStart(2, '0')}`;
    },
    getTradeChange(trade, index) {
      if (index >= this.trades.length - 1) return "-";
      const prevPrice = this.trades[index + 1].price;
      const change = trade.price - prevPrice;
      const changePercent = ((change / prevPrice) * 100).toFixed(1);
      return change > 0 ? `+${changePercent}%` : `${changePercent}%`;
    },
    getTradeChangeClass(trade, index) {
      if (index >= this.trades.length - 1) return "neutral";
      const prevPrice = this.trades[index + 1].price;
      const change = trade.price - prevPrice;
      return change > 0 ? "positive" : change < 0 ? "negative" : "neutral";
    },
    handleBuy() {
      const query = this.plantName?.trim();
      this.$router.push({
        name: "Community",
        query: query ? { q: query } : undefined
      });
    },
    handleSell() {
      this.$router.push({
        name: "WritePost",
        query: {
          price: this.sellPrice,
          title: this.plantName
        }
      });
    }
  }
}
</script>

<style scoped>
.plant-detail {
  padding: 0;
  background: #f8f9fa;
  min-height: 100vh;
}

.header-bar {
  display: flex;
  align-items: center;
  padding: 16px;
  background: #fff;
  border-bottom: 1px solid #e9ecef;
  position: sticky;
  top: 0;
  z-index: 10;
}

.back-btn {
  width: 24px;
  height: 24px;
  cursor: pointer;
  margin-right: 12px;
}

.plant-name {
  font-size: 18px;
  font-weight: 600;
  margin: 0;
  color: #212529;
}

.price-info {
  background: #fff;
  padding: 20px 16px;
  margin-bottom: 8px;
}

.current-price {
  display: flex;
  align-items: baseline;
  gap: 12px;
  margin-bottom: 8px;
}

.price {
  font-size: 24px;
  font-weight: bold;
  color: #212529;
}

.change {
  font-size: 14px;
  font-weight: 500;
}

.change.positive {
  color: #dc3545;
}

.change.negative {
  color: #198754;
}

.price-range {
  display: flex;
  gap: 16px;
}

.range-item {
  font-size: 13px;
  color: #6c757d;
}

.title-bar {
  padding: 16px;
  background: #fff;
  border-bottom: 1px solid #e9ecef;
}

.chart-title {
  font-size: 16px;
  font-weight: 600;
  margin: 0;
  color: #212529;
}

.period-tabs {
  display: flex;
  background: #fff;
  padding: 0 16px 16px;
  gap: 4px;
}

.period-tabs button {
  flex: 1;
  padding: 8px 12px;
  border: 1px solid #e9ecef;
  background: #fff;
  font-size: 13px;
  cursor: pointer;
  color: #6c757d;
  border-radius: 4px;
  transition: all 0.2s;
}

.period-tabs button.active {
  background: #568265;
  color: #fff;
  border-color: #568265;
  font-weight: 500;
}

.chart-container {
  background: #fff;
  padding: 16px;
  margin-bottom: 8px;
}

.trade-history {
  background: #fff;
  padding: 16px;
  margin-bottom: 8px;
}

.section-header {
  display: flex;
  justify-content: between;
  align-items: center;
  margin-bottom: 12px;
}

.section-header h3 {
  font-size: 16px;
  font-weight: 600;
  margin: 0;
  color: #212529;
}

.trade-count {
  font-size: 12px;
  color: #6c757d;
  background: #f8f9fa;
  padding: 2px 6px;
  border-radius: 10px;
}

.table-wrapper {
  overflow-x: auto;
}

.trade-history table {
  width: 100%;
  border-collapse: collapse;
}

.trade-history th {
  font-size: 12px;
  color: #6c757d;
  font-weight: 500;
  text-align: center;
  padding: 8px 4px;
  border-bottom: 1px solid #e9ecef;
}

.trade-history td {
  padding: 12px 4px;
  border-bottom: 1px solid #f8f9fa;
  font-size: 14px;
  text-align: center;
}

.price-cell {
  font-weight: 600;
  color: #212529;
}

.change-cell {
  font-weight: 500;
  font-size: 12px;
}

.change-cell.positive {
  color: #dc3545;
}

.change-cell.negative {
  color: #198754;
}

.change-cell.neutral {
  color: #6c757d;
}

.date-cell {
  color: #6c757d;
  font-size: 12px;
}

.statistics {
  background: #fff;
  padding: 16px;
  margin-bottom: 20px;
}

.statistics h3 {
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 12px 0;
  color: #212529;
}

.stats-grid {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 16px;
}

.stat-item {
  text-align: center;
}

.stat-label {
  display: block;
  font-size: 12px;
  color: #6c757d;
  margin-bottom: 4px;
}

.stat-value {
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: #212529;
}

.action-buttons {
  display: flex;
  gap: 12px;
  padding: 16px;
  position: sticky;
  bottom: 0;
  background: #fff;
  border-top: 1px solid #e9ecef;
}

.buy, .sell {
  flex: 1;
  padding: 14px;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  transition: all 0.2s;
}

.buy {
  background: #dc3545;
  color: #fff;
}

.buy:hover {
  background: #c82333;
}

.sell {
  background: #198754;
  color: #fff;
}

.sell:hover {
  background: #157347;
}

.btn-label {
  font-size: 14px;
  margin-bottom: 2px;
}

.btn-price {
  font-size: 16px;
  font-weight: bold;
}
</style>
