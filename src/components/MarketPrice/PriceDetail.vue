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
    </div>

    <div class="title-bar">
      <h2 class="chart-title">시세</h2>
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
      <apexchart type="line" height="200" :options="chartOptions" :series="series" />
    </div>

    <!-- 체결 거래 내역 -->
    <div class="trade-history">
      <h3>체결 거래</h3>
      <table>
        <thead>
            <tr class="table-header">
                <th>거래가</th>
                <th>거래 일자</th>
            </tr>
            </thead>
            <tbody>
            <tr v-for="trade in trades" :key="trade.date">
                <td>{{ formatPrice(trade.price) }}</td>
                <td>{{ trade.date }}</td>
            </tr>
        </tbody>
      </table>
    </div>

    <!-- 구매 / 판매 버튼 -->
    <div class="action-buttons">
      <button class="buy">구매 {{ formatPrice(buyPrice) }}</button>
      <button class="sell">판매 {{ formatPrice(sellPrice) }}</button>
    </div>
  </div>
</template>

<script>
import VueApexCharts from "vue3-apexcharts";

export default {
  name: "PlantDetail",
  components: { apexchart: VueApexCharts },
  data() {
    return {
      selectedPeriod: "1m",
      periods: [
        { label: "1개월", value: "1m" },
        { label: "3개월", value: "3m" },
        { label: "6개월", value: "6m" },
        { label: "1년", value: "1y" },
        { label: "전체", value: "all" }
      ],
      dummyData: {
        "1m": [110000, 115000, 112000, 118000],
        "3m": [100000, 120000, 115000, 130000, 125000],
        "6m": [95000, 110000, 125000, 130000, 120000, 135000],
        "1y": [90000, 95000, 110000, 120000, 125000, 140000, 130000, 135000],
        "all": [80000, 100000, 120000, 140000, 160000, 180000]
      },
      series: [
        { name: "시세", data: [] }
      ],
      chartOptions: {
        chart: { toolbar: { show: false } },
        stroke: { curve: "smooth" },
        xaxis: { categories: [] }
      },
      trades: [
        { price: 105000, date: "24/06/22" },
        { price: 115000, date: "24/06/22" },
        { price: 99000, date: "24/06/21" }
      ],
      buyPrice: 105000,
      sellPrice: 153000
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
        xaxis: { categories: this.generateCategories(period) }
      };
    },
    generateCategories(period) {
      if (period === "1m") return ["1주", "2주", "3주", "4주"];
      if (period === "3m") return ["1월", "2월", "3월", "4월", "5월"];
      if (period === "6m") return ["1월", "2월", "3월", "4월", "5월", "6월"];
      if (period === "1y") return ["1월", "2월", "3월", "4월", "5월", "6월", "7월", "8월"];
      return ["2019", "2020", "2021", "2022", "2023", "2024"];
    },
    formatPrice(val) {
      return val.toLocaleString() + "원";
    }
  }
}
</script>

<style scoped>
.plant-detail {
  padding: 16px;
}

.header-bar {
  display: flex;
  align-items: center;
  padding: 10px 12px;
  border-bottom: 2px solid #eee;
}

.back-btn {
  width: 20px;
  height: 20px;
  cursor: pointer;
  margin-right: 10px;
}

.title-bar {
  padding: 12px;
  text-align: left;
  background: #fff;
  margin-bottom: 6px;
}

.chart-title {
  font-size: 18px;
  font-weight: bold;
  margin: 0;
}

.period-tabs {
  display: flex;
  justify-content: space-around;
  margin-bottom: 12px;
}

.period-tabs button {
  flex: 1;
  padding: 6px 0;
  border: none;
  background: none;
  font-size: 14px;
  cursor: pointer;
  color: #666;
}

.period-tabs button.active {
  font-weight: bold;
  color: #000;
  border-bottom: 2px solid #000;
}

.chart-container {
  margin-bottom: 20px;
}

.chart-container {
  margin-bottom: 20px;
}

.trade-history table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 8px;
}

.trade-history th {
  font-size: 12px;
  color: #888;
  font-weight: normal;
  text-align: center;
  padding-bottom: 4px;
}

.trade-history td {
  padding: 6px 4px;
  border-bottom: 1px solid #eee;
  font-size: 14px;
}

.action-buttons {
  display: flex;
  justify-content: space-between;
  margin-top: 20px;
}

.buy {
  flex: 1;
  margin-right: 8px;
  padding: 12px;
  background: #fb6e52;
  color: #fff;
  border: none;
  border-radius: 6px;
  font-weight: bold;
}

.sell {
  flex: 1;
  margin-left: 8px;
  padding: 12px;
  background: #568265;
  color: #fff;
  border: none;
  border-radius: 6px;
  font-weight: bold;
}
</style>
