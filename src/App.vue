<template>
  <div id="app">
    <div class="row no-gutters">
      <!-- 選擇地區 -->
      <div class="toolbox col-sm-3 p-2 bg-white">
        <div class="form-group d-flex">
          <label for="city" class="col-form-label mr-2 text-right">縣市</label>
          <div class="flex-fill">
            <select id="city" class="form-control" v-model="select.city">
              <!-- 製作下拉選單 -->
              <option value="AAA">AAA</option>
              <option :value="city.name" :key="city.name" v-for="city in cities">
                {{ city.name }}
              </option>
            </select>
          </div>
        </div>
        <div class="form-group d-flex">
          <label for="dist" class="col-form-label mr-2 text-right">地區</label>
          <div class="flex-fill">
            <select id="dist" class="form-control" v-model="select.dist">
              <!-- 製作下拉選單 -->
              <option :value="dist.name" :key="dist.name"
              v-for="dist in this.currentCity.districts">
                {{ dist.name }}
              </option>
            </select>
          </div>
        </div>
      </div>

      <!-- 顯示地圖和 UBike 站點 -->
      <div class="col-sm-9">
        <div id="map"></div>
      </div>
    </div>
  </div>
</template>

<script>
import L from 'leaflet';
import cities from './assets/cityName.json';

export default {
  name: 'App',
  data: () => ({
    cities,
    select: {
      city: '臺北市',
      dist: '中正區',
    },
    ubikes: [],
    OSMap: {},
    currentBikes: [],
  }),
  computed: {
    currentCity() {
      return cities.find((city) => city.name === this.select.city);
    },
    currentDist() {
      return this.currentCity.districts.find((dist) => dist.name === this.select.dist);
    },
  },
  watch: {
    currentDist() {
      this.removeMarkers(this.currentBikes);
      this.currentBikes = this.ubikes.filter((bike) => bike.dist === this.select.dist);
      this.addMarkers(this.currentBikes);
      this.focusToMarkers(this.currentBikes);
    },
  },
  methods: {
    removeMarkers(bikes) {
      bikes.forEach((bike) => {
        this.OSMap.removeLayer(bike.marker);
      });
    },
    addMarkers(bikes) {
      bikes.forEach((bike) => {
        bike.marker.addTo(this.OSMap);
      });
    },
    focusToMarkers(bikes) {
      // this.OSMap.panTo([this.currentDist.latitude, this.currentDist.longitude]);
      // this.OSMap.flyTo([this.currentDist.latitude, this.currentDist.longitude], 14);
      this.OSMap.fitBounds(bikes.map((bike) => bike.latlng));
    },
  },
  created() {
    const url = 'https://tcgbusfs.blob.core.windows.net/blobyoubike/YouBikeTP.json';
    this.$http.get(url).then((response) => {
      this.ubikes = Object.values(response.data.retVal).map((bike) => {
        const popupTemplate = `<p><strong style="font-size: 20px;">${bike.sna}</strong></p>
          <strong style="font-size: 16px; color: #d45345;">可租借車輛剩餘：${bike.sbi} 台</strong><br>
          可停空位剩餘: ${bike.bemp}<br>
          <small>最後更新時間: ${bike.mday}</small>`;
        return {
          dist: bike.sarea,
          latlng: [bike.lat, bike.lng],
          marker: L.marker([bike.lat, bike.lng]).bindPopup(popupTemplate),
        };
      });
    });
  },
  mounted() {
    this.OSMap = L.map('map', {
      center: [25.041956, 121.508791],
      zoom: 18,
    });

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: 'QQ',
      maxZoom: 18,
    }).addTo(this.OSMap);
  },
};
</script>

<style lang="scss">
@import 'bootstrap/scss/bootstrap';

#map {
  height: 100vh;
  position: relative;
}
</style>
